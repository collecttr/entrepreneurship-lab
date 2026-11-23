import { useEffect, useState } from 'react'
import { WEEKS } from '@/data/curriculum'
import { useAuth } from '@/context/AuthContext'
import { isSpendLockOn } from '@/lib/ai-config'
import { syncOwnProgressSnapshot } from '@/lib/peer-progress'
import {
  adminClearLocalProgress,
  getUnlockedWeek,
  refreshUnlockedWeekFromSupabase,
  setUnlockedWeek,
} from '@/lib/progress-store'
import { isDemoAuth, supabaseConfigured } from '@/lib/supabase'

export function AdminPage() {
  const { profile } = useAuth()
  const [unlocked, setUnlocked] = useState(getUnlockedWeek())
  const [saved, setSaved] = useState<string | null>(null)
  const [resetMsg, setResetMsg] = useState<string | null>(null)

  useEffect(() => {
    void refreshUnlockedWeekFromSupabase().then(setUnlocked)
  }, [])

  function unlockTo(week: number) {
    setUnlockedWeek(week)
    setUnlocked(week)
    setSaved(
      supabaseConfigured && !isDemoAuth
        ? `Открыто до недели ${week} (синхронизация с program_settings)`
        : `Открыто до недели ${week} (в этом браузере; на сервере — общий доступ для всех)`,
    )
  }

  async function clearStarterProgress() {
    const ok = window.confirm(
      'Сбросить локальный прогресс в этом браузере (сдачи, навыки) до 0%? Реальная работа после сдачи заданий будет удалена только здесь. Снимки на сервере обнулятся для вашего аккаунта при синхронизации; для обоих участников см. SQL миграции 011.',
    )
    if (!ok) return
    adminClearLocalProgress()
    if (profile) await syncOwnProgressSnapshot(profile)
    setResetMsg('Локальный прогресс обнулён. Обновите страницу «Обзор».')
  }

  return (
    <div className="space-y-5">
      <header className="surface rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Админ</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Управление программой</h1>
        <p className="mt-2 text-sm text-slate">
          Постепенное открытие: участники видят недели ≤ текущего значения. Сейчас открыто до недели{' '}
          <strong className="text-ink">{unlocked}</strong>.
        </p>
      </header>

      <section className="surface rounded-3xl p-5">
        <h2 className="font-display text-xl">Открытие недель</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 8, 12, 16, 20, 24, 26].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => unlockTo(w)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                unlocked === w ? 'bg-teal text-on-accent' : 'bg-mist text-ink hover:bg-teal-soft'
              }`}
            >
              До {w}
            </button>
          ))}
        </div>
        <label className="mt-4 block text-sm">
          Точное значение (1–26)
          <input
            type="number"
            min={1}
            max={26}
            value={unlocked}
            onChange={(e) => unlockTo(Number(e.target.value) || 1)}
            className="mt-1 w-32 rounded-xl border border-ink/10 px-3 py-2"
          />
        </label>
        {saved && <p className="mt-3 text-sm text-teal-deep">{saved}</p>}
      </section>

      <section className="surface rounded-3xl p-5">
        <h2 className="font-display text-xl">Недели</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {WEEKS.map((w) => (
            <li key={w.week_number} className="rounded-2xl bg-paper/80 px-3 py-2 text-sm">
              <span className="font-semibold text-ink">W{w.week_number}</span> {w.title_ru}
              <span className="ml-2 text-xs text-slate">
                {w.week_number <= unlocked ? 'открыта' : 'закрыта'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface rounded-3xl p-5">
        <h2 className="font-display text-xl">Старт курса · чистый ноль</h2>
        <p className="mt-2 text-sm text-slate">
          Если полоски прогресса показывают ~4% или навыки «28» без сдач — сбросьте локальные данные.
          Для Саши и Платона на сервере выполните SQL из{' '}
          <code className="text-xs">supabase/migrations/011_zero_starter_progress_snapshots.sql</code>.
        </p>
        <button
          type="button"
          onClick={() => void clearStarterProgress()}
          className="mt-4 rounded-xl bg-mist px-4 py-2 text-sm font-semibold text-ink hover:bg-teal-soft"
        >
          Сбросить локальный прогресс до 0%
        </button>
        {resetMsg && <p className="mt-3 text-sm text-teal-deep">{resetMsg}</p>}
      </section>

      <section className="surface rounded-3xl p-5">
        <h2 className="font-display text-xl">Блокировка платного AI</h2>
        <p className="mt-2 text-sm text-slate">
          Сейчас:{' '}
          <strong className="text-ink">
            {isSpendLockOn() ? 'ON (платный AI заблокирован)' : 'OFF'}
          </strong>
          . Локальные экзаменаторы работают всегда. Снятие блокировки — только через env (
          `VITE_AI_SPEND_LOCK=false` + `VITE_AI_LIVE_UNLOCK=true`) и серверные секреты; ключ провайдера
          не в клиенте.
        </p>
      </section>

      <p className="text-xs text-slate">
        Редакция источников/брифов в БД — через миграции и seed; в демо-режиме контент читается из{' '}
        `src/data/curriculum.ts`.
      </p>
    </div>
  )
}
