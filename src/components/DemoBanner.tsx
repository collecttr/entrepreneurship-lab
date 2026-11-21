import { isDemoAuth, supabaseConfigured } from '@/lib/supabase'

export function DemoBanner() {
  if (!isDemoAuth) return null

  return (
    <div className="demo-stripe border-b border-ink/10 px-4 py-2 text-center text-sm text-ink">
      <strong className="font-semibold">Демо-режим.</strong>{' '}
      {supabaseConfigured
        ? 'Учебный вход без полной авторизации на сервере. Данные курса сохраняются в этом браузере.'
        : 'Сервер курса ещё не подключён. Вход через демо-аккаунты из списка. Чат и форум синхронизируются между вкладками этого браузера — откройте два аккаунта в двух вкладках.'}{' '}
      Боевой режим настраивает администратор на хостинге (см. runbook) — не в чате.
    </div>
  )
}
