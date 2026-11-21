import type { ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getModule, getWeek, mandatoryMinutesForSlot } from '@/data/curriculum'
import { getSource } from '@/data/sources'
import { useAuth } from '@/context/AuthContext'
import { getUnlockedWeek, isWeekUnlocked } from '@/lib/progress-store'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="surface rounded-3xl p-5 md:p-6">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-slate">{children}</div>
    </section>
  )
}

export function WeekPage() {
  const { weekNumber } = useParams()
  const n = Number(weekNumber)
  const week = getWeek(n)
  const { profile } = useAuth()
  const unlocked = getUnlockedWeek()

  if (!week || !Number.isFinite(n)) return <Navigate to="/program" replace />

  const isAdmin = profile?.role === 'admin'
  if (!isWeekUnlocked(n, unlocked) && !isAdmin) {
    return (
      <div className="surface rounded-3xl p-6">
        <h1 className="font-display text-2xl">Неделя {n} закрыта</h1>
        <p className="mt-2 text-slate">Админ ещё не открыл эту неделю (сейчас unlock до {unlocked}).</p>
        <Link to="/program" className="mt-4 inline-block font-semibold text-teal">
          ← К программе
        </Link>
      </div>
    )
  }

  const mod = getModule(n)
  const slot = profile?.participant_slot ?? 'A'
  const mins = mandatoryMinutesForSlot(week, slot)
  const own = slot === 'B' ? week.assignment_b : week.assignment_a

  return (
    <div className="space-y-4">
      <header className="surface rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">
          {mod.title_ru} · неделя {n}
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink">{week.title_ru}</h1>
        <p className="mt-2 text-sm text-slate">
          Обязательная нагрузка слота {slot}: <strong className="text-ink">{mins} мин</strong> / 240
          {mins > 240 && <span className="text-danger"> — превышение!</span>}
        </p>
        <Link to="/program" className="mt-3 inline-block text-sm font-semibold text-teal">
          ← Все недели
        </Link>
      </header>

      <Section title="Проблема недели">
        <p className="text-ink">{week.problem_ru}</p>
      </Section>

      <Section title="Результаты обучения">
        <ul className="list-disc space-y-1 pl-5 text-ink">
          {week.outcomes.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </Section>

      <Section title="Ключевые понятия">
        <div className="flex flex-wrap gap-2">
          {week.concepts.map((c) => (
            <span key={c} className="rounded-lg bg-teal-soft/60 px-2.5 py-1 text-ink">
              {c}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Источники">
        <ul className="space-y-3">
          {week.sources.map((link) => {
            const s = getSource(link.source_id)
            if (!s) return null
            return (
              <li key={link.source_id} className="rounded-2xl bg-paper/80 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-teal hover:underline"
                  >
                    {s.title_ru}
                  </a>
                  <span className="text-xs text-slate">{s.provider}</span>
                  <span className="rounded bg-mist px-1.5 text-[10px] font-semibold uppercase">
                    {link.is_mandatory ? 'обязательно' : 'по желанию'}
                  </span>
                  <span className="text-xs text-slate">{link.study_minutes_planned} мин</span>
                </div>
                <p className="mt-1 text-ink">
                  <strong>Зачем:</strong> {s.why_ru}
                </p>
                <p>
                  <strong className="text-ink">Что читать:</strong> {s.parts_ru}
                </p>
                <p>
                  <strong className="text-ink">Что понять:</strong> {s.understand_ru}
                </p>
                {s.questions_ru.length > 0 && (
                  <ul className="mt-1 list-disc pl-5">
                    {s.questions_ru.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title={`Задание A · ${week.assignment_a.code}`}>
          <p className="font-medium text-ink">{week.assignment_a.title_ru}</p>
          <p className="mt-2">{week.assignment_a.brief_md}</p>
          <p className="mt-2 text-xs">≤ {week.assignment_a.max_minutes} мин</p>
          {slot === 'A' && (
            <Link to={`/assignments/${week.assignment_a.code}`} className="mt-3 inline-block font-semibold text-teal">
              Сдать задание A →
            </Link>
          )}
        </Section>
        <Section title={`Задание B · ${week.assignment_b.code}`}>
          <p className="font-medium text-ink">{week.assignment_b.title_ru}</p>
          <p className="mt-2">{week.assignment_b.brief_md}</p>
          <p className="mt-2 text-xs">≤ {week.assignment_b.max_minutes} мин</p>
          {slot === 'B' && (
            <Link to={`/assignments/${week.assignment_b.code}`} className="mt-3 inline-block font-semibold text-teal">
              Сдать задание B →
            </Link>
          )}
        </Section>
      </div>

      <Section title={`Совместное · ${week.joint.code}`}>
        <p className="font-medium text-ink">{week.joint.title_ru}</p>
        <p className="mt-2">{week.joint.brief_md}</p>
        <Link to={`/assignments/${week.joint.code}`} className="mt-3 inline-block font-semibold text-teal">
          Сдать совместное →
        </Link>
      </Section>

      <Section title="Практика продаж (каждую неделю)">
        <p className="text-ink">{week.sales_drill_ru}</p>
      </Section>

      <Section title="Дебаты">
        <p className="text-ink">{week.debate_ru}</p>
      </Section>

      <Section title="Кейс">
        <p className="text-ink">{week.case_ru}</p>
      </Section>

      <Section title="Симуляция">
        <p className="text-ink">{week.simulation_ru}</p>
      </Section>

      <Section title="Рубрика">
        <ul className="space-y-2">
          {week.rubric.map((c) => (
            <li key={c.id} className="rounded-xl bg-paper/80 px-3 py-2">
              <span className="font-medium text-ink">
                {c.label} ({c.max_score})
              </span>
              <p>{c.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Рефлексия">
        <ul className="list-disc space-y-1 pl-5 text-ink">
          {week.reflection.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Section>

      <Section title="Error watchlist">
        <ul className="list-disc space-y-1 pl-5 text-danger">
          {week.error_watchlist.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </Section>

      <p className="text-xs text-slate">
        Ваше основное задание слота: <strong>{own.code}</strong> — {own.title_ru}
      </p>
    </div>
  )
}
