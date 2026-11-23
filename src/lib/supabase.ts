import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { AUTH_STORAGE_KEY, createSafeAuthStorage } from '@/lib/safe-storage'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const demoFlag = import.meta.env.VITE_DEMO_AUTH

/** Demo mode when explicitly enabled or when Supabase public env is incomplete. */
export const isDemoAuth =
  demoFlag === 'true' || !url || !anonKey || url.includes('YOUR_PROJECT')

export const supabaseConfigured = Boolean(url && anonKey && !url.includes('YOUR_PROJECT'))

/**
 * Session persistence (~24h+):
 * - Client: persistSession + autoRefreshToken + safe localStorage wrapper.
 * - Access JWT is short-lived (~1h); autoRefreshToken renews it while the tab is open
 *   and on reload as long as the refresh token is valid.
 * - Refresh-token lifetime is set in Supabase Dashboard → Authentication → Settings
 *   (default is typically days/weeks, not 24h). There is no browser cookieOptions API
 *   on the plain JS client used here (@supabase/ssr would for cookies). Target ~24h
 *   by keeping refresh token ≥ 24h in the Dashboard if you need a hard floor.
 */
function buildClient(): SupabaseClient | null {
  if (!supabaseConfigured) return null
  try {
    return createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? createSafeAuthStorage() : undefined,
        storageKey: AUTH_STORAGE_KEY,
      },
    })
  } catch (err) {
    console.warn('supabase createClient failed; continuing without live auth', err)
    return null
  }
}

export const supabase: SupabaseClient | null = buildClient()
