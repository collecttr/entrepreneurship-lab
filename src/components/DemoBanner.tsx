import { isDemoAuth, supabaseConfigured } from '@/lib/supabase'

export function DemoBanner() {
  if (!isDemoAuth) return null

  return (
    <div className="demo-stripe border-b border-ink/10 px-4 py-2 text-center text-sm text-ink">
      <strong className="font-semibold">Демо-режим.</strong>{' '}
      {supabaseConfigured
        ? 'VITE_DEMO_AUTH=true — локальная сессия без реального Supabase Auth.'
        : 'Supabase URL/ключ не заданы в Vercel env. Вход через allowlist демо-аккаунтов. Чат/форум: localStorage + BroadcastChannel. Два аккаунта — две вкладки.'}{' '}
      Боевой режим: задайте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в Vercel (см. runbook) — не в чате.
    </div>
  )
}
