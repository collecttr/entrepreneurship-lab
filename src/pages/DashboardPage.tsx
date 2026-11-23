import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PeerProgressBoard } from '@/components/PeerProgressBoard'
import { useAuth } from '@/context/AuthContext'
import {
  COURSE_START_DATE,
  courseWeekNumber,
  formatRuDate,
  weekDeadlineDate,
} from '@/lib/course-calendar'
import { loadDashboard } from '@/lib/dashboard'
import { canonicalDisplayName } from '@/lib/learners'
import { syncOwnProgressSnapshot } from '@/lib/peer-progress'
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
    void syncOwnProgressSnapshot(profile)
    return () => {
      cancelled = true
    }
  }, [profile])

  if (error) {
    return <p className="rounded-2xl bg-danger/10 p-4 text-danger">{error}</p>
  }

  if (!data) {
    return <p className="text-slate">Загружаем обзор…</p>
  }

  const { profile: p, settings, currentWeek, isDemoData } = data
  const calendarWeek = courseWeekNumber()
  const weekDeadline = weekDeadlineDate(
    calendarWeek,
    settings.program_start_date || COURSE_START_DATE,
  )

  return (
    <div className="space-y-5">
      <header className="surface overflow-hidden rounded-2xl md:rounded-3xl">
        <div className="relative px-4 py-6 md:px-8 md:py-7">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                'linear-gradient(120deg, rgba(100,110,130,0.10) 0%, transparent 48%), linear-gradient(220deg, rgba(140,150,165,0.08) 0%, transparent 42%)',
            }}
          />
          <div className="relative">
            <p className="text-sm text-slate">Добро пожаловать</p>
            <h1 className="mt-1 font-display text-3xl tracking-tight text-ink md:text-4xl">
              {canonicalDisplayName(p)}
            </h1>
            <p className="mt-2 text-sm text-slate">
              {p.email} · {p.role === 'admin' ? 'админ' : 'участник'}
              {p.participant_slot ? ` · вариант заданий ${p.participant_slot}` : ''} · {p.timezone}
            </p>
            <p className="mt-2 text-xs text-slate">
              Курс с {formatRuDate(settings.program_start_date || COURSE_START_DATE)} · календарная
              неделя {calendarWeek} · дедлайн {formatRuDate(weekDeadline)} (МСК)
            </p>
          </div>
        </div>
      </header>

      <PeerProgressBoard profile={p} />

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
            Открыто до недели {settings.current_unlocked_week} · цель {settings.hours_per_week_target}{' '}
            мин/нед
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
          <p className="mt-1 text-xs text-slate">По правилам курса · без платного AI</p>
          <ul className="mt-3 space-y-2">
            {data.recommendationsTomorrow.map((r) => (
              <li key={r.id} className="rounded-2xl bg-teal-soft/40 px-3 py-2.5 text-sm">
                <p className="font-medium text-ink">{r.title}</p>
                <p className="text-xs text-slate">{r.reason}</p>
                {r.href ? (
                  <Link to={r.href} className="mt-1 inline-block text-xs font-semibold text-teal">
                    Открыть →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="surface rounded-3xl p-5">
        <h3 className="font-display text-xl text-ink">
          Сдачи на этой неделе
          <DemoLabel show={isDemoData} />
        </h3>
        <p className="mt-1 text-xs text-slate">
          По дням текущей календарной недели · считаются только сданные и оценённые работы
        </p>
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

      <section className="surface rounded-3xl p-5">
        <h3 className="font-display text-xl text-ink">
          История недель
          <DemoLabel show={isDemoData} />
        </h3>
        <p className="mt-1 text-xs text-slate">
          Открытые недели программы · прогресс по вашим заданиям варианта и совместным
        </p>
        {data.weekHistory.length === 0 ? (
          <p className="mt-3 text-sm text-slate">Пока нет открытых недель.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {data.weekHistory.map((w) => {
              const pct = w.total ? Math.round((w.completed / w.total) * 100) : 0
              return (
                <li
                  key={w.week_number}
                  className="flex flex-wrap items-center gap-3 rounded-2xl bg-paper/90 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">
                      Неделя {w.week_number}
                      <span className="ml-2 text-xs font-normal text-slate">{w.status_ru}</span>
                    </p>
                    <p className="truncate text-xs text-slate">{w.title_ru}</p>
                  </div>
                  <p className="shrink-0 font-display text-sm text-ink">
                    {w.completed}/{w.total}
                  </p>
                  <div className="w-24 shrink-0">
                    <ProgressBar value={pct} />
                  </div>
                  <Link
                    to={`/program/weeks/${w.week_number}`}
                    className="shrink-0 text-xs font-semibold text-teal hover:underline"
                  >
                    Открыть →
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
