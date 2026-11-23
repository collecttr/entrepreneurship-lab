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
import { refreshUnlockedWeekFromSupabase } from '@/lib/progress-store'
import { isDemoAuth, supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

const DEMO_SESSION_KEY = 'elab_demo_session'
const PROFILE_RETRY_DELAYS_MS = [0, 400, 1000]

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
  return {
    id: userId,
    email,
    display_name: email.split('@')[0] ?? email,
    role: 'learner',
    participant_slot: null,
    avatar_path: null,
    timezone: 'Europe/Moscow',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

async function upsertOwnProfile(userId: string, email: string): Promise<Profile | null> {
  if (!supabase) return null
  const payload = {
    id: userId,
    email: email.toLowerCase(),
    display_name: email.split('@')[0] || email,
    timezone: 'Europe/Moscow',
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
    return { ok: true, profile: data as Profile }
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
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user
    if (!user) {
      setHasSession(false)
      setProfile(null)
      return
    }
    setHasSession(true)
    await applyProfileLoad(user.id, user.email ?? '')
  }, [applyProfileLoad])

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (isDemoAuth) {
        if (!cancelled) {
          const demo = readDemoSession()
          setProfile(demo)
          setHasSession(Boolean(demo))
          setLoading(false)
        }
        return
      }

      if (!supabase) {
        if (!cancelled) setLoading(false)
        return
      }

      const { data } = await supabase.auth.getSession()
      if (data.session?.user && !cancelled) {
        setHasSession(true)
        await applyProfileLoad(data.session.user.id, data.session.user.email ?? '')
      }

      const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
        // Logout only on explicit sign-out / real auth invalidation
        if (event === 'SIGNED_OUT' || !session?.user) {
          setHasSession(false)
          setProfile(null)
          setAuthError(null)
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

      void refreshUnlockedWeekFromSupabase()
      if (!cancelled) setLoading(false)

      return () => {
        sub.subscription.unsubscribe()
      }
    }

    const cleanupPromise = init()
    return () => {
      cancelled = true
      void cleanupPromise.then((cleanup) => cleanup?.())
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalized,
        password,
      })
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
      await applyProfileLoad(data.user.id, data.user.email ?? normalized)
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
      await supabase.auth.signOut()
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
