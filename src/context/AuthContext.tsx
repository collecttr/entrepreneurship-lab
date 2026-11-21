import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEMO_USERS } from '@/lib/demo-data'
import { isDemoAuth, supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

const DEMO_SESSION_KEY = 'elab_demo_session'

interface AuthContextValue {
  profile: Profile | null
  loading: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

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
  // migrate away from shared localStorage session so two tabs don't overwrite each other
  localStorage.removeItem(DEMO_SESSION_KEY)
}

async function loadProfileFromSupabase(userId: string, email: string): Promise<Profile> {
  if (!supabase) {
    throw new Error('Supabase не настроен')
  }
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  if (data) return data as Profile

  // Soft fallback if trigger hasn't created profile yet
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (isDemoAuth) {
        if (!cancelled) {
          setProfile(readDemoSession())
          setLoading(false)
        }
        return
      }

      if (!supabase) {
        if (!cancelled) {
          setLoading(false)
        }
        return
      }

      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        try {
          const p = await loadProfileFromSupabase(
            data.session.user.id,
            data.session.user.email ?? '',
          )
          if (!cancelled) setProfile(p)
        } catch {
          if (!cancelled) setProfile(null)
        }
      }

      const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!session?.user) {
          setProfile(null)
          return
        }
        try {
          const p = await loadProfileFromSupabase(session.user.id, session.user.email ?? '')
          setProfile(p)
        } catch {
          setProfile(null)
        }
      })

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
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase()

    if (isDemoAuth) {
      const match = DEMO_USERS.find(
        (u) => u.email === normalized && u.password === password,
      )
      if (!match) {
        return {
          error:
            'Неверный email или пароль. В демо-режиме доступны только два allowlist-аккаунта (см. подсказку на форме).',
        }
      }
      writeDemoSession(match.profile)
      setProfile(match.profile)
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
      return { error: error.message }
    }
    if (!data.user) {
      return { error: 'Вход не удался' }
    }

    // Allowlist check via RPC / profiles presence
    const { data: allowed, error: allowErr } = await supabase
      .from('allowed_emails')
      .select('email')
      .eq('email', normalized)
      .maybeSingle()

    if (allowErr) {
      console.warn(allowErr)
    }
    if (!allowed) {
      await supabase.auth.signOut()
      return { error: 'Этот email не в списке допущенных участников.' }
    }

    const p = await loadProfileFromSupabase(data.user.id, data.user.email ?? normalized)
    setProfile(p)
    return {}
  }, [])

  const signOut = useCallback(async () => {
    if (isDemoAuth) {
      writeDemoSession(null)
      setProfile(null)
      return
    }
    if (supabase) {
      await supabase.auth.signOut()
    }
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({
      profile,
      loading,
      isDemo: isDemoAuth,
      signIn,
      signOut,
    }),
    [profile, loading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
