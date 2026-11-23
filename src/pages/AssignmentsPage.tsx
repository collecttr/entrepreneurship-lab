import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { assignmentsForProfile } from '@/lib/progress-assignments'
import { getUnlockedWeek, isWeekUnlocked } from '@/lib/progress-store'

export function AssignmentsPage() {
  const { profile } = useAuth()
  if (!profile) return null
  const unlocked = getUnlockedWeek()
  const items = assignmentsForProfile(profile)
  const open = items.filter((i) => isWeekUnlocked(i.week, unlocked))
  const overdue = open.filter((i) => !i.submission || i.submission.status === 'draft')
  const done = open.filter((i) => i.submission && ['submitted', 'graded'].includes(i.submission.status))

  return (
    <div className="space-y-5">
      <header className="surface rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Задания</p>
        <h1 className="mt-2 font-display text-3xl text-ink">
          Сдачи · вариант {profile.participant_slot ?? '—'}
        </h1>
        <p className="mt-2 text-sm text-slate">
          У каждого участника свой вариант заданий (A или B) плюс совместные. Закрытые недели появятся,
          когда админ их откроет. В прогресс входят только сданные и оценённые работы.
        </p>
        <p className="mt-3 text-sm text-ink">
          Открыто без сдачи: <strong>{overdue.length}</strong> · сдано: <strong>{done.length}</strong>
        </p>
      </header>

      <section className="surface rounded-3xl p-5">
        <h2 className="font-display text-xl">Текущие / к сдаче</h2>
        <ul className="mt-3 space-y-2">
          {overdue.map(({ week, assignment, submission }) => (
            <li key={assignment.code} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-paper/80 px-3 py-2.5 text-sm">
              <div>
                <p className="font-medium text-ink">
                  {assignment.code} · {assignment.title_ru}
                </p>
                <p className="text-xs text-slate">
                  Неделя {week} · вариант{' '}
                  {assignment.participant_slot === 'both' ? 'совместное' : assignment.participant_slot} ·{' '}
                  {submission?.status === 'submitted'
                    ? 'сдано'
                    : submission?.status === 'graded'
                      ? 'оценено'
                      : submission?.status === 'draft'
                        ? 'черновик'
                        : submission?.status === 'returned'
                          ? 'возвращено'
                          : 'не начато'}
                </p>
              </div>
              <Link to={`/assignments/${assignment.code}`} className="font-semibold text-teal">
                Открыть →
              </Link>
            </li>
          ))}
          {overdue.length === 0 && <li className="text-sm text-slate">Нет открытых несданных заданий.</li>}
        </ul>
      </section>

      <section className="surface rounded-3xl p-5">
        <h2 className="font-display text-xl">Сданные</h2>
        <ul className="mt-3 space-y-2">
          {done.map(({ week, assignment, submission }) => (
            <li key={assignment.code} className="rounded-2xl bg-teal-soft/40 px-3 py-2.5 text-sm">
              <p className="font-medium text-ink">
                {assignment.code} · {assignment.title_ru}
              </p>
              <p className="text-xs text-slate">
                Неделя {week} ·{' '}
                {submission?.status === 'graded'
                  ? 'оценено'
                  : submission?.status === 'submitted'
                    ? 'сдано'
                    : submission?.status ?? '—'}{' '}
                · {submission?.submitted_at?.slice(0, 10)}
              </p>
            </li>
          ))}
          {done.length === 0 && <li className="text-sm text-slate">Пока нет сдач — прогресс 0%.</li>}
        </ul>
      </section>
    </div>
  )
}
