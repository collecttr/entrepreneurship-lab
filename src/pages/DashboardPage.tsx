import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { loadDashboard } from '@/lib/dashboard'
import type { DashboardData } from '@/lib/types'

function DemoLabel({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <span className="ml-2 rounded-md bg-amber-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink">
      демо-данные
    </span>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-mist">
      <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

export function DashboardPage() {
  const { profile } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    let cancelled = false
    void loadDashboard(profile)
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Ошибка загрузки')
      })
    return () => {
      cancelled = true
    }
  }, [profile])

  if (error) {
    return <p className="rounded-2xl bg-danger/10 p-4 text-danger">{error}</p>
  }

  if (!data) {
    return <p className="text-slate">Загружаем дашборд…</p>
  }

  const { profile: p, settings, currentWeek, isDemoData } = data

  return (
    <div className="space-y-5">
      <header className="surface overflow-hidden rounded-3xl">
        <div className="relative px-6 py-7 md:px-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                'linear-gradient(120deg, rgba(15,107,109,0.16) 0%, transparent 45%), linear-gradient(220deg, rgba(201,136,42,0.12) 0%, transparent 40%)',
            }}
          />
          <div className="relative">
            <p className="text-sm text-slate">Добро пожаловать</p>
            <h1 className="mt-1 font-display text-3xl tracking-tight text-ink md:text-4xl">
              {p.display_name}
            </h1>
            <p className="mt-2 text-sm text-slate">
              {p.email} · {p.role === 'admin' ? 'админ' : 'участник'}
              {p.participant_slot ? ` · слот ${p.participant_slot}` : ''} · {p.timezone}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="surface rounded-3xl p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">
                Текущая неделя
              </p>
              <h2 className="mt-1 font-display text-2xl text-ink">
                Неделя {currentWeek.week_number}: {currentWeek.title_ru}
              </h2>
              <p className="mt-1 text-sm text-slate">{currentWeek.module_title_ru}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                currentWeek.is_unlocked || currentWeek.week_number <= settings.current_unlocked_week
                  ? 'bg-teal-soft text-teal-deep'
                  : 'bg-mist text-slate'
              }`}
            >
              {currentWeek.is_unlocked || currentWeek.week_number <= settings.current_unlocked_week
                ? 'открыта'
                : 'закрыта'}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate">{currentWeek.summary_ru}</p>
          <p className="mt-3 text-xs text-slate">
            Unlock до недели {settings.current_unlocked_week} · цель {settings.hours_per_week_target}{' '}
            мин/нед · AI spend lock:{' '}
            {settings.ai_spend_lock ? 'включён (AI выкл)' : 'выключен'}
            <DemoLabel show={isDemoData} />
          </p>
          <Link to="/program" className="mt-4 inline-block text-sm font-semibold text-teal hover:underline">
            Открыть программу →
          </Link>
        </section>

        <section className="surface rounded-3xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">
            Общий прогресс
            <DemoLabel show={isDemoData} />
          </p>
          <p className="mt-3 font-display text-4xl text-ink">{data.overallProgressPct}%</p>
          <ProgressBar value={data.overallProgressPct} />
          <ul className="mt-4 space-y-2">
            {data.skillProgress.slice(0, 4).map((s) => (
              <li key={s.skill_id}>
                <div className="mb-1 flex justify-between text-xs text-slate">
                  <span>{s.title_ru}</span>
                  <span>{s.score_ema}</span>
                </div>
                <ProgressBar value={s.score_ema} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="surface rounded-3xl p-5">
          <h3 className="font-display text-xl text-ink">
            Задачи на сегодня
            <DemoLabel show={isDemoData} />
          </h3>
          <ul className="mt-3 space-y-2">
            {data.tasksToday.map((t) => (
              <li key={t.id} className="rounded-2xl bg-paper/80 px-3 py-2.5 text-sm">
                <p className="font-medium text-ink">{t.title}</p>
                <p className="text-xs text-slate">
                  {t.kind} · {t.due_label}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface rounded-3xl p-5">
          <h3 className="font-display text-xl text-ink">
            Просроченные
            <DemoLabel show={isDemoData} />
          </h3>
          <ul className="mt-3 space-y-2">
            {data.tasksOverdue.length === 0 && (
              <li className="text-sm text-slate">Нет просроченных задач.</li>
            )}
            {data.tasksOverdue.map((t) => (
              <li key={t.id} className="rounded-2xl bg-danger/5 px-3 py-2.5 text-sm">
                <p className="font-medium text-ink">{t.title}</p>
                <p className="text-xs text-danger">{t.due_label}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="surface rounded-3xl p-5">
          <h3 className="font-display text-xl text-ink">
            Следующее совместное
            <DemoLabel show={isDemoData} />
          </h3>
          <p className="mt-3 font-medium text-ink">{data.nextJoint.title}</p>
          <p className="text-sm text-slate">{data.nextJoint.when}</p>
          <Link to={data.nextJoint.href} className="mt-3 inline-block text-sm font-semibold text-teal">
            Перейти →
          </Link>
        </section>

        <section className="surface rounded-3xl p-5">
          <h3 className="font-display text-xl text-ink">
            Недавние сообщения
            <DemoLabel show={isDemoData} />
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {data.recentMessages.map((m) => (
              <li key={m.id}>
                <p className="font-medium text-ink">{m.title}</p>
                <p className="text-slate">{m.meta}</p>
                <p className="text-xs text-slate">{m.at}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface rounded-3xl p-5">
          <h3 className="font-display text-xl text-ink">
            Недавние результаты
            <DemoLabel show={isDemoData} />
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {data.recentResults.map((r) => (
              <li key={r.id}>
                <p className="font-medium text-ink">{r.title}</p>
                <p className="text-slate">{r.meta}</p>
                <p className="text-xs text-slate">{r.at}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface rounded-3xl p-5">
          <h3 className="font-display text-xl text-ink">
            Слабые места
            <DemoLabel show={isDemoData} />
          </h3>
          <ul className="mt-3 space-y-3">
            {data.weakSkills.map((s) => (
              <li key={s.skill_id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-ink">{s.title_ru}</span>
                  <span className="text-slate">{s.score_ema}/100</span>
                </div>
                <ProgressBar value={s.score_ema} />
              </li>
            ))}
          </ul>
          <Link to="/skills" className="mt-4 inline-block text-sm font-semibold text-teal">
            Карта навыков →
          </Link>
        </section>

        <section className="surface rounded-3xl p-5">
          <h3 className="font-display text-xl text-ink">
            Рекомендации на завтра
            <DemoLabel show={isDemoData} />
          </h3>
          <p className="mt-1 text-xs text-slate">Rule-based (без AI) · spend lock по умолчанию ON</p>
          <ul className="mt-3 space-y-2">
            {data.recommendationsTomorrow.map((r) => (
              <li key={r.id} className="rounded-2xl bg-teal-soft/40 px-3 py-2.5 text-sm">
                <p className="font-medium text-ink">{r.title}</p>
                <p className="text-xs text-slate">{r.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="surface rounded-3xl p-5">
        <h3 className="font-display text-xl text-ink">
          Календарь недели
          <DemoLabel show={isDemoData} />
        </h3>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {data.calendarDays.map((d) => {
            const pct = d.total ? Math.round((d.completed / d.total) * 100) : 0
            return (
              <div key={d.date} className="rounded-2xl bg-paper/90 p-2 text-center">
                <p className="text-xs font-semibold text-slate">{d.label}</p>
                <p className="mt-2 font-display text-lg text-ink">{d.completed}/{d.total}</p>
                <div className="mt-2">
                  <ProgressBar value={pct} />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
