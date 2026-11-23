import { isDemoAuth, supabaseConfigured } from '@/lib/supabase'

export function DemoBanner() {
  if (!isDemoAuth) return null

  return (
    <div className="demo-stripe border-b border-ink/10 px-3 py-2 text-center text-xs text-slate sm:text-sm">
      <strong className="font-semibold text-ink">Демо-режим.</strong>{' '}
      {supabaseConfigured
        ? 'Учебный вход; данные курса в этом браузере.'
        : 'Сервер не подключён — демо-аккаунты; чат и форум между вкладками.'}
    </div>
  )
}
