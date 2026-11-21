import { Link } from 'react-router-dom'
import { EXAMS, MODULES, WEEKS, mandatoryMinutesForSlot } from '@/data/curriculum'
import { useAuth } from '@/context/AuthContext'
import { examKindLabel } from '@/lib/exam-store'
import { getUnlockedWeek, isWeekUnlocked } from '@/lib/progress-store'

export function ProgramPage() {
  const { profile } = useAuth()
  const unlocked = getUnlockedWeek()
  const slot = profile?.participant_slot ?? 'A'

  return (
    <div className="space-y-6">
      <header className="surface rounded-3xl p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Программа</p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">7 модулей · 26 недель</h1>
        <p className="mt-3 max-w-2xl text-slate">
          Постепенное открытие до недели {unlocked}. Обязательная нагрузка ≤ 240 мин/нед на участника.
          Прогресс считается по сданным заданиям, не по просмотрам.
        </p>
      </header>

      <section className="surface rounded-3xl p-5">
        <h2 className="font-display text-xl text-ink">Аттестации</h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {EXAMS.map((e) => {
            const open = isWeekUnlocked(e.week_number, unlocked)
            return (
              <li key={e.id} className="rounded-2xl bg-paper/80 px-3 py-2.5 text-sm">
                <span className="font-semibold text-teal">
                  {examKindLabel(e.kind)} · нед. {e.week_number}
                </span>
                <p className="font-medium text-ink">{e.title_ru}</p>
                {open ? (
                  <Link
                    to={`/exams/${e.id}`}
                    className="mt-1 inline-block text-sm font-semibold text-teal hover:underline"
                  >
                    Открыть аттестацию →
                  </Link>
                ) : (
                  <p className="mt-1 text-xs text-slate">Доступ после открытия недели админом</p>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      {MODULES.map((mod) => {
        const weeks = WEEKS.filter((w) => w.week_number >= mod.week_from && w.week_number <= mod.week_to)
        return (
          <section key={mod.id} className="surface rounded-3xl p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">
              Модуль {mod.order_index}
            </p>
            <h2 className="mt-1 font-display text-2xl text-ink">{mod.title_ru}</h2>
            <p className="mt-2 text-sm text-slate">{mod.description_ru}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {weeks.map((w) => {
                const open = isWeekUnlocked(w.week_number, unlocked)
                const mins = mandatoryMinutesForSlot(w, slot)
                return (
                  <div
                    key={w.week_number}
                    className={`rounded-2xl border px-3 py-3 ${
                      open ? 'border-ink/15 bg-teal-soft/30' : 'border-ink/5 bg-mist/50 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-slate">Неделя {w.week_number}</p>
                        <p className="font-medium text-ink">{w.title_ru}</p>
                        <p className="mt-1 text-xs text-slate">
                          ~{mins} мин · вариант {slot}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate">
                        {open ? 'открыта' : 'закрыта'}
                      </span>
                    </div>
                    {open ? (
                      <Link
                        to={`/program/weeks/${w.week_number}`}
                        className="mt-2 inline-block text-sm font-semibold text-teal hover:underline"
                      >
                        Открыть неделю →
                      </Link>
                    ) : (
                      <p className="mt-2 text-xs text-slate">Доступ после открытия админом</p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
