import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { DEMO_USERS } from '@/lib/demo-data'
import { canonicalDisplayName, learnerByEmail } from '@/lib/learners'
import { ensureCleanCourseStart, refreshUnlockedWeekFromSupabase } from '@/lib/progress-store'
import { isDemoAuth, supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

const DEMO_SESSION_KEY = 'elab_demo_session'
const PROFILE_RETRY_DELAYS_MS = [0, 400, 1000]
/** Never block first paint longer than this — Russia/VPN / blocked Supabase Auth. */
const AUTH_BOOT_TIMEOUT_MS = 4000
const SLOW_AUTH_HINT =
  'Сеть медленная или Auth недоступен. Форма входа доступна — профиль подтянется в фоне.'

interface AuthContextValue {
  profile: Profile | null
  loading: boolean
  isDemo: boolean
  /** Russian message when session is valid but profile load/upsert failed (no hard sign-out). */
  authError: string | null
  hasSession: boolean
  retryProfile: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | undefined> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(undefined), ms)
    promise
      .then((value) => {
        window.clearTimeout(timer)
        resolve(value)
      })
      .catch(() => {
        window.clearTimeout(timer)
        resolve(undefined)
      })
  })
}

/** Per-tab demo session so A and B can be open in two tabs; collab data stays in localStorage. */
function readDemoSession(): Profile | null {
  try {
    const raw = sessionStorage.getItem(DEMO_SESSION_KEY) ?? localStorage.getItem(DEMO_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Profile
  } catch {
    return null
  }
}

function writeDemoSession(profile: Profile | null) {
  if (!profile) {
    sessionStorage.removeItem(DEMO_SESSION_KEY)
    localStorage.removeItem(DEMO_SESSION_KEY)
    return
  }
  sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(profile))
  localStorage.removeItem(DEMO_SESSION_KEY)
}

function syntheticProfile(userId: string, email: string): Profile {
  const learner = learnerByEmail(email)
  return {
    id: userId,
    email,
    display_name: learner?.display_name ?? email.split('@')[0] ?? email,
    role: learner?.role ?? 'learner',
    participant_slot: learner?.participant_slot ?? null,
    avatar_path: null,
    timezone: 'Europe/Moscow',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

async function upsertOwnProfile(userId: string, email: string): Promise<Profile | null> {
  if (!supabase) return null
  const learner = learnerByEmail(email)
  const payload = {
    id: userId,
    email: email.toLowerCase(),
    display_name: learner?.display_name ?? (email.split('@')[0] || email),
    timezone: 'Europe/Moscow',
    ...(learner
      ? { role: learner.role, participant_slot: learner.participant_slot }
      : {}),
  }
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .maybeSingle()
  if (error) {
    console.warn('profile upsert failed', error)
    return null
  }
  return (data as Profile | null) ?? null
}

type LoadProfileResult =
  | { ok: true; profile: Profile }
  | { ok: false; message: string }

async function loadProfileOnce(userId: string, email: string): Promise<LoadProfileResult> {
  if (!supabase) {
    return { ok: false, message: 'Supabase не настроен' }
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) {
    return {
      ok: false,
      message:
        'Не удалось загрузить профиль (временная ошибка сети или доступа). Сессия сохранена — нажмите «Повторить».',
    }
  }
  if (data) {
    const row = data as Profile
    const learner = learnerByEmail(row.email)
    if (learner && row.display_name !== learner.display_name) {
      return {
        ok: true,
        profile: {
          ...row,
          display_name: learner.display_name,
          role: row.role === 'admin' ? row.role : learner.role,
          participant_slot: row.participant_slot ?? learner.participant_slot,
        },
      }
    }
    return { ok: true, profile: { ...row, display_name: canonicalDisplayName(row) } }
  }

  // Missing row: try client upsert (RLS allows own insert when allowlisted after migration 007)
  const created = await upsertOwnProfile(userId, email)
  if (created) {
    return { ok: true, profile: created }
  }

  // Soft fallback so login does not bounce; show SQL hint
  return {
    ok: true,
    profile: syntheticProfile(userId, email),
  }
}

async function loadProfileWithRetry(
  userId: string,
  email: string,
): Promise<LoadProfileResult & { missingDbRow?: boolean }> {
  let last: LoadProfileResult | null = null
  for (const delay of PROFILE_RETRY_DELAYS_MS) {
    if (delay) await sleep(delay)
    last = await loadProfileOnce(userId, email)
    if (last.ok) {
      // Detect soft synthetic (no created_at from DB race — use upsert miss flag via second select)
      const { data } = supabase
        ? await supabase.from('profiles').select('id').eq('id', userId).maybeSingle()
        : { data: null }
      return { ...last, missingDbRow: !data }
    }
  }
  return last!
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [hasSession, setHasSession] = useState(false)
  const profileRef = useRef<Profile | null>(null)
  profileRef.current = profile

  const applyProfileLoad = useCallback(async (userId: string, email: string) => {
    const result = await loadProfileWithRetry(userId, email)
    if (result.ok) {
      setProfile(result.profile)
      // Soft synthetic profile still means login works — no learner-facing scare banner.
      if (result.missingDbRow) {
        console.info('profile row missing; using temporary client profile until DB sync')
      }
      setAuthError(null)
      return
    }
    // Transient failure: keep prior profile + session; never signOut here
    setAuthError(result.message)
  }, [])

  const retryProfile = useCallback(async () => {
    if (!supabase || isDemoAuth) return
    setAuthError(null)
    const timed = await withTimeout(supabase.auth.getSession(), AUTH_BOOT_TIMEOUT_MS)
    const user = timed?.data.session?.user
    if (!user) {
      setHasSession(false)
      setProfile(null)
      setAuthError(SLOW_AUTH_HINT)
      return
    }
    setHasSession(true)
    await applyProfileLoad(user.id, user.email ?? '')
  }, [applyProfileLoad])

  useEffect(() => {
    let cancelled = false
    let unsub: (() => void) | undefined

    function finishBoot(opts?: { slow?: boolean }) {
      if (cancelled) return
      setLoading(false)
      if (opts?.slow) {
        setAuthError((prev) => prev ?? SLOW_AUTH_HINT)
      }
    }

    async function init() {
      // Live course restart: clear stale local % / fake skill EMA (sync, never network).
      try {
        ensureCleanCourseStart()
      } catch (err) {
        console.warn('ensureCleanCourseStart failed:', err)
      }

      if (isDemoAuth) {
        if (!cancelled) {
          const demo = readDemoSession()
          setProfile(demo)
          setHasSession(Boolean(demo))
          finishBoot()
        }
        return
      }

      if (!supabase) {
        finishBoot()
        return
      }

      const bootTimer = window.setTimeout(() => finishBoot({ slow: true }), AUTH_BOOT_TIMEOUT_MS)

      try {
        const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
          // Logout only on explicit sign-out / real auth invalidation
          if (event === 'SIGNED_OUT' || !session?.user) {
            // Ignore empty INITIAL_SESSION while getSession is still racing
            if (event === 'INITIAL_SESSION' && !session) return
            if (event === 'SIGNED_OUT') {
              setHasSession(false)
              setProfile(null)
              setAuthError(null)
            }
            return
          }

          setHasSession(true)

          if (event === 'TOKEN_REFRESHED' && profileRef.current) {
            void loadProfileOnce(session.user.id, session.user.email ?? '').then((r) => {
              if (r.ok) {
                setProfile(r.profile)
                setAuthError(null)
              }
              // On failure: keep existing profile — do not clear
            })
            return
          }

          const before = profileRef.current
          await applyProfileLoad(session.user.id, session.user.email ?? '')
          // If load failed and we cleared nothing in applyProfileLoad on ok:false — restore guard
          if (!profileRef.current && before) {
            setProfile(before)
          }
        })
        unsub = () => sub.subscription.unsubscribe()

        const sessionResult = await withTimeout(supabase.auth.getSession(), AUTH_BOOT_TIMEOUT_MS)
        if (sessionResult?.data.session?.user && !cancelled) {
          setHasSession(true)
          // Profile in background — never block first paint / login form
          void applyProfileLoad(
            sessionResult.data.session.user.id,
            sessionResult.data.session.user.email ?? '',
          )
        } else if (!sessionResult && !cancelled) {
          setAuthError((prev) => prev ?? SLOW_AUTH_HINT)
        }

        void refreshUnlockedWeekFromSupabase()
      } catch (err) {
        console.warn('auth boot failed:', err)
        if (!cancelled) setAuthError((prev) => prev ?? SLOW_AUTH_HINT)
      } finally {
        window.clearTimeout(bootTimer)
        finishBoot()
      }
    }

    void init()
    return () => {
      cancelled = true
      unsub?.()
    }
  }, [applyProfileLoad])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const normalized = email.trim().toLowerCase()

      if (isDemoAuth) {
        const match = DEMO_USERS.find(
          (u) => u.email === normalized && u.password === password,
        )
        if (!match) {
          return {
            error:
              'Неверный email или пароль. В демо-режиме войти могут только два аккаунта из списка допуска (см. подсказку на форме).',
          }
        }
        writeDemoSession(match.profile)
        setProfile(match.profile)
        setHasSession(true)
        setAuthError(null)
        return {}
      }

      if (!supabase) {
        return { error: 'Supabase не настроен. Заполните .env или включите VITE_DEMO_AUTH=true.' }
      }

      const signed = await withTimeout(
        supabase.auth.signInWithPassword({
          email: normalized,
          password,
        }),
        15_000,
      )
      if (!signed) {
        return {
          error:
            'Сервер входа не отвечает (таймаут). Проверьте VPN/сеть и попробуйте ещё раз.',
        }
      }
      const { data, error } = signed
      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
          return {
            error:
              'Неверный email или пароль. Если аккаунт ещё не создан администратором, входа не будет — публичной регистрации нет.',
          }
        }
        if (msg.includes('email not confirmed')) {
          return { error: 'Email ещё не подтверждён. Обратитесь к администратору.' }
        }
        return { error: error.message }
      }
      if (!data.user) {
        return { error: 'Вход не удался. Попробуйте ещё раз.' }
      }

      // Auth succeeded → keep session. Do NOT query allowed_emails (RLS chicken/egg → signOut bounce).
      // Signup allowlist is enforced by handle_new_user trigger; login only needs a valid Auth user.
      setHasSession(true)
      // Resume profile in background so submit never hangs on slow DB
      void applyProfileLoad(data.user.id, data.user.email ?? normalized)
      return {}
    },
    [applyProfileLoad],
  )

  const signOut = useCallback(async () => {
    if (isDemoAuth) {
      writeDemoSession(null)
      setProfile(null)
      setHasSession(false)
      setAuthError(null)
      return
    }
    if (supabase) {
      await withTimeout(supabase.auth.signOut(), 5000)
    }
    setProfile(null)
    setHasSession(false)
    setAuthError(null)
  }, [])

  const value = useMemo(
    () => ({
      profile,
      loading,
      isDemo: isDemoAuth,
      authError,
      hasSession,
      retryProfile,
      signIn,
      signOut,
    }),
    [profile, loading, authError, hasSession, retryProfile, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
