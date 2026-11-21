import { useState } from 'react'
import { WEEKS } from '@/data/curriculum'
import { isSpendLockOn } from '@/lib/ai-config'
import { getUnlockedWeek, setUnlockedWeek } from '@/lib/progress-store'

export function AdminPage() {
  const [unlocked, setUnlocked] = useState(getUnlockedWeek())
  const [saved, setSaved] = useState<string | null>(null)

  function unlockTo(week: number) {
    setUnlockedWeek(week)
    setUnlocked(week)
    setSaved(`Открыто до недели ${week}`)
  }

  return (
    <div className="space-y-5">
      <header className="surface rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Админ</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Управление программой</h1>
        <p className="mt-2 text-sm text-slate">
          Progressive unlock: learners видят недели ≤ текущего значения. Сейчас открыто до недели{' '}
          <strong className="text-ink">{unlocked}</strong>.
        </p>
      </header>

      <section className="surface rounded-3xl p-5">
        <h2 className="font-display text-xl">Unlock недели</h2>
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
        <h2 className="font-display text-xl">AI spend lock</h2>
        <p className="mt-2 text-sm text-slate">
          Сейчас: <strong className="text-ink">{isSpendLockOn() ? 'ON (платный AI заблокирован)' : 'OFF'}</strong>.
          Локальные экзаменаторы работают всегда. Снятие lock — только через env
          (`VITE_AI_SPEND_LOCK=false` + `VITE_AI_LIVE_UNLOCK=true`) и server secrets; ключ провайдера не в клиенте.
        </p>
      </section>

      <p className="text-xs text-slate">
        Редакция источников/брифов в БД — через миграции и seed; в демо-режиме контент читается из{' '}
        `src/data/curriculum.ts`.
      </p>
    </div>
  )
}
