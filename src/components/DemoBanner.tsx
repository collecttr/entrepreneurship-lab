import { isDemoAuth, supabaseConfigured } from '@/lib/supabase'

export function DemoBanner() {
  if (!isDemoAuth) return null

  return (
    <div className="demo-stripe border-b border-ink/10 px-4 py-2 text-center text-sm text-ink">
      <strong className="font-semibold">Демо-режим.</strong>{' '}
      {supabaseConfigured
        ? 'VITE_DEMO_AUTH=true — локальная сессия без реального Supabase Auth.'
        : 'Supabase URL/ключ не заданы. Вход через allowlist демо-аккаунтов. Чат/форум: localStorage + BroadcastChannel (не production Realtime). Два аккаунта — две вкладки.'}{' '}
      Для боевого режима заполните .env (см. .env.example).
    </div>
  )
}
