import { useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import type { ExaminerResult } from '@/ai/examiners'
import { AssignmentComments } from '@/components/AssignmentComments'
import { ExaminerResultPanel } from '@/components/ExaminerResultPanel'
import { WEEKS } from '@/data/curriculum'
import { useAuth } from '@/context/AuthContext'
import { isExpertExamConfigured } from '@/lib/ai-config'
import { requestExpertExam } from '@/lib/expert-exam-client'
import {
  getSubmission,
  getUnlockedWeek,
  isWeekUnlocked,
  saveDraft,
  submitAssignment,
} from '@/lib/progress-store'
import { syncOwnProgressSnapshot } from '@/lib/peer-progress'

export function AssignmentDetailPage() {
  const { id } = useParams()
  const { profile } = useAuth()
  const found = useMemo(() => {
    for (const w of WEEKS) {
      for (const a of [w.assignment_a, w.assignment_b, w.joint]) {
        if (a.code === id) return { week: w, assignment: a }
      }
    }
    return null
  }, [id])

  const existing = profile && found ? getSubmission(profile.id, found.assignment.code) : undefined
  const [body, setBody] = useState(existing?.body_md ?? '')
  const [message, setMessage] = useState<string | null>(null)
  const [examResult, setExamResult] = useState<ExaminerResult | null>(null)
  const [examBusy, setExamBusy] = useState(false)
  const [examError, setExamError] = useState<string | null>(null)

  if (!found || !profile) return <Navigate to="/assignments" replace />

  const unlocked = getUnlockedWeek()
  const open = isWeekUnlocked(found.week.week_number, unlocked) || profile.role === 'admin'
  if (!open) {
    return (
      <div className="surface rounded-3xl p-6">
        <h1 className="font-display text-2xl">Неделя закрыта</h1>
        <Link to="/assignments" className="mt-3 inline-block text-teal">
          ← Назад
        </Link>
      </div>
    )
  }

  const slotOk =
    found.assignment.participant_slot === 'both' ||
    found.assignment.participant_slot === profile.participant_slot ||
    profile.role === 'admin'

  const expertOn = isExpertExamConfigured()

  function onSave(e: FormEvent) {
    e.preventDefault()
    saveDraft(profile!.id, found!.assignment, found!.week.week_number, body)
    setMessage('Черновик сохранён')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!body.trim()) {
      setMessage('Добавьте текст сдачи')
      return
    }
    submitAssignment(profile!.id, found!.assignment, found!.week.week_number, body)
    void syncOwnProgressSnapshot(profile!)
    setMessage('Сдано. Прогресс обновлён (не от просмотра страницы).')
  }

  async function runLocalExam() {
    setExamError(null)
    setExamBusy(true)
    try {
      const [{ fetchWeekSourceSnippets }, { examineWriting }] = await Promise.all([
        import('@/ai/local-evidence'),
        import('@/ai/examiners'),
      ])
      const pageSnippets = await fetchWeekSourceSnippets(found!.week, 3)
      const r = examineWriting(profile!.id, {
        text: body,
        weekNumber: found!.week.week_number,
        pageSnippets,
      })
      setExamResult({
        ...r,
        title: `Локально · отчёт · ${found!.assignment.code}`,
      })
    } finally {
      setExamBusy(false)
    }
  }

  async function runExpertExam() {
    setExamError(null)
    setExamBusy(true)
    try {
      const outcome = await requestExpertExam({
        userId: profile!.id,
        trainerSlug: 'week-report',
        learnerText: body,
        weekNumber: found!.week.week_number,
        extraFields: {
          assignment_code: found!.assignment.code,
          assignment_title: found!.assignment.title_ru,
        },
      })
      if (!outcome.ok) {
        setExamError(outcome.message_ru)
        return
      }
      setExamResult(outcome.result)
    } finally {
      setExamBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <header className="surface rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">
          Неделя {found.week.week_number} · {found.assignment.code}
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink">{found.assignment.title_ru}</h1>
        <p className="mt-2 text-sm text-slate">
          Слот {found.assignment.participant_slot} · ≤ {found.assignment.max_minutes} мин · тип{' '}
          {found.assignment.deliverable_type}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink">{found.assignment.brief_md}</p>
        <Link to={`/program/weeks/${found.week.week_number}`} className="mt-3 inline-block text-sm font-semibold text-teal">
          ← К неделе
        </Link>
      </header>

      {!slotOk && (
        <p className="rounded-2xl bg-amber-soft/60 px-4 py-3 text-sm">
          Это задание другого слота. Вы можете просмотреть бриф, но сдача рассчитана на слот{' '}
          {found.assignment.participant_slot}.
        </p>
      )}

      <form className="surface rounded-3xl p-5 space-y-3" onSubmit={onSubmit}>
        <label className="block text-sm">
          <span className="mb-1.5 block text-slate">Текст сдачи (markdown)</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="w-full rounded-xl border border-ink/10 bg-white/80 px-3 py-2 font-mono text-sm outline-none ring-ink focus:ring-2"
            disabled={!slotOk}
          />
        </label>
        {message && <p className="text-sm text-teal-deep">{message}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={!slotOk}
            className="rounded-xl border border-ink/10 px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Сохранить черновик
          </button>
          <button
            type="submit"
            disabled={!slotOk}
            className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-on-accent hover:bg-teal-deep disabled:opacity-50"
          >
            Сдать
          </button>
        </div>
        {existing?.submitted_at && (
          <p className="text-xs text-slate">
            Последняя сдача: {existing.submitted_at} · статус {existing.status}
          </p>
        )}
      </form>

      {slotOk && (
        <section className="surface space-y-3 rounded-3xl p-5">
          <h2 className="font-display text-xl text-ink">Проверка отчёта</h2>
          <p className="text-sm text-slate">
            <strong className="text-ink">локально</strong> — быстрый гейт и сверка тезисов с
            источниками недели.{' '}
            {expertOn ? (
              <>
                <strong className="text-ink">эксперт (LLM)</strong> — free-tier ментор по идеям
                (продажи / переговоры / предпринимательство), русский разбор.
              </>
            ) : (
              <>Эксперт (LLM) появится после ключей free-провайдеров на Vercel.</>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={examBusy || !body.trim()}
              onClick={() => void runLocalExam()}
              className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-on-accent hover:bg-teal-deep disabled:opacity-50"
            >
              {examBusy ? 'Проверяю…' : 'Проверить локально'}
            </button>
            {expertOn && (
              <button
                type="button"
                disabled={examBusy || !body.trim()}
                onClick={() => void runExpertExam()}
                className="rounded-xl border border-ink/15 bg-paper px-4 py-2 text-sm font-semibold text-ink hover:bg-mist disabled:opacity-50"
              >
                {examBusy ? 'Эксперт думает…' : 'Экспертная проверка'}
              </button>
            )}
          </div>
          {examError && <p className="text-sm text-danger">{examError}</p>}
          {examResult && <ExaminerResultPanel result={examResult} />}
        </section>
      )}

      <AssignmentComments assignmentCode={found.assignment.code} authorId={profile.id} />
    </div>
  )
}
