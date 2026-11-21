import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getWeek } from '@/data/curriculum'
import {
  examKindLabel,
  examLinkedAssignments,
  getExam,
  getExamAttempt,
  hydrateExamAttemptsFromSupabase,
  saveExamDraft,
  submitExamAttempt,
} from '@/lib/exam-store'
import { getSubmission, getUnlockedWeek, isWeekUnlocked } from '@/lib/progress-store'

export function ExamPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const exam = id ? getExam(id) : undefined
  const unlocked = getUnlockedWeek()

  const [attempt, setAttempt] = useState(() =>
    profile && exam ? getExamAttempt(profile.id, exam.id) : undefined,
  )
  const [body, setBody] = useState(attempt?.body_md ?? '')
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const linked = useMemo(() => (exam ? examLinkedAssignments(exam) : []), [exam])
  const week = exam ? getWeek(exam.week_number) : undefined

  useEffect(() => {
    if (!profile || !exam) return
    let cancelled = false
    void hydrateExamAttemptsFromSupabase(profile.id).then(() => {
      if (cancelled) return
      const next = getExamAttempt(profile.id, exam.id)
      setAttempt(next)
      if (next?.body_md && !body.trim()) setBody(next.body_md)
    })
    return () => {
      cancelled = true
    }
    // body intentionally omitted — hydrate only fills empty editor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, exam])

  if (!profile) return null
  if (!exam) return <Navigate to="/program" replace />

  const open = isWeekUnlocked(exam.week_number, unlocked) || profile.role === 'admin'
  const lockedStatus = attempt?.status === 'submitted' || attempt?.status === 'graded'

  function onSaveDraft(e: FormEvent) {
    e.preventDefault()
    if (!profile || !exam) return
    const row = saveExamDraft(profile.id, exam.id, body)
    setAttempt(row)
    setSaved('Черновик сохранён')
    setError(null)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!profile || !exam) return
    if (body.trim().length < 80) {
      setError(
        'Опишите пакет аттестации подробнее (минимум ~80 символов): что сдаёте, доказательства и что просите на защите.',
      )
      return
    }
    const row = submitExamAttempt(profile.id, exam.id, body)
    setAttempt(row)
    setSaved('Аттестация сдана')
    setError(null)
  }

  if (!open) {
    return (
      <div className="surface rounded-3xl p-6">
        <h1 className="font-display text-2xl text-ink">{exam.title_ru}</h1>
        <p className="mt-2 text-slate">
          Неделя {exam.week_number} ещё закрыта (сейчас открыто до {unlocked}). Админ открывает
          прогрессивный доступ на странице «Админ».
        </p>
        <Link to="/program" className="mt-4 inline-block text-sm font-semibold text-teal hover:underline">
          ← К программе
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <header className="surface rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
          {examKindLabel(exam.kind)} · неделя {exam.week_number}
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink">{exam.title_ru}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate">{exam.brief_md}</p>
        {week && (
          <p className="mt-2 text-xs text-slate">
            Контекст недели: {week.title_ru} ·{' '}
            <Link to={`/program/weeks/${week.week_number}`} className="font-semibold text-teal hover:underline">
              открыть неделю
            </Link>
          </p>
        )}
        {attempt && (
          <p className="mt-3 text-sm text-ink">
            Статус:{' '}
            <strong>
              {attempt.status === 'draft' && 'черновик'}
              {attempt.status === 'submitted' && 'сдано'}
              {attempt.status === 'returned' && 'возвращено'}
              {attempt.status === 'graded' && 'оценено'}
            </strong>
            {attempt.submitted_at && (
              <span className="text-slate">
                {' '}
                · {new Date(attempt.submitted_at).toLocaleString('ru-RU')}
              </span>
            )}
          </p>
        )}
      </header>

      <section className="surface rounded-3xl p-5">
        <h2 className="font-display text-xl text-ink">Связанные задания недели</h2>
        <p className="mt-1 text-sm text-slate">
          Аттестация опирается на ваши задания варианта A или B и совместное задание недели. Сдайте их
          до защиты, где возможно.
        </p>
        <ul className="mt-3 space-y-2">
          {linked.map((a) => {
            const sub = getSubmission(profile.id, a.code)
            return (
              <li
                key={a.code}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-paper/80 px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium text-ink">{a.title_ru}</p>
                  <p className="text-xs text-slate">
                    {a.code} · вариант{' '}
                    {a.participant_slot === 'both' ? 'совместное' : a.participant_slot} ·{' '}
                    {sub?.status === 'submitted' || sub?.status === 'graded'
                      ? 'сдано'
                      : sub?.status === 'draft'
                        ? 'черновик'
                        : 'не начато'}
                  </p>
                </div>
                <Link to={`/assignments/${a.code}`} className="text-sm font-semibold text-teal hover:underline">
                  Открыть →
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="surface rounded-3xl p-5">
        <h2 className="font-display text-xl text-ink">Пакет / защита</h2>
        <p className="mt-1 text-sm text-slate">
          Опишите материалы, доказательства разговоров или экспериментов и план защиты. Оценивает
          человек (преподаватель или напарник) — AI аттестацию не заменяет.
        </p>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={lockedStatus}
            rows={12}
            className="w-full rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-ink/30 disabled:opacity-70"
            placeholder="1) что сдаёте 2) доказательства 3) слабые места 4) что просите на защите"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          {saved && <p className="text-sm text-ok">{saved}</p>}
          {!lockedStatus && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onSaveDraft}
                className="rounded-xl bg-mist px-4 py-2.5 text-sm font-semibold text-ink hover:bg-teal-soft"
              >
                Сохранить черновик
              </button>
              <button
                type="submit"
                className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-on-accent"
              >
                Сдать аттестацию
              </button>
            </div>
          )}
        </form>
      </section>

      <Link to="/program" className="inline-block text-sm font-semibold text-teal hover:underline">
        ← К программе
      </Link>
    </div>
  )
}
