import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const demoFlag = import.meta.env.VITE_DEMO_AUTH

/** Demo mode when explicitly enabled or when Supabase public env is incomplete. */
export const isDemoAuth =
  demoFlag === 'true' || !url || !anonKey || url.includes('YOUR_PROJECT')

export const supabaseConfigured = Boolean(url && anonKey && !url.includes('YOUR_PROJECT'))

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
