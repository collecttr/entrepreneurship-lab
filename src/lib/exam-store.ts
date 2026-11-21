import { EXAMS, getWeek, type ExamDef } from '@/data/curriculum'

const ATTEMPTS_KEY = 'elab_exam_attempts'

export type ExamAttemptStatus = 'draft' | 'submitted' | 'returned' | 'graded'

export interface ExamAttempt {
  id: string
  exam_id: string
  author_id: string
  status: ExamAttemptStatus
  body_md: string
  score: number | null
  feedback_md: string | null
  submitted_at: string | null
  updated_at: string
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('elab-exams'))
}

export function getExam(id: string): ExamDef | undefined {
  return EXAMS.find((e) => e.id === id)
}

export function listExamAttempts(authorId?: string): ExamAttempt[] {
  const all = readJson<ExamAttempt[]>(ATTEMPTS_KEY, [])
  return authorId ? all.filter((a) => a.author_id === authorId) : all
}

export function getExamAttempt(authorId: string, examId: string): ExamAttempt | undefined {
  return listExamAttempts(authorId).find((a) => a.exam_id === examId)
}

export function saveExamDraft(authorId: string, examId: string, body: string): ExamAttempt {
  const all = listExamAttempts()
  const now = new Date().toISOString()
  let row = all.find((a) => a.author_id === authorId && a.exam_id === examId)
  if (!row) {
    row = {
      id: crypto.randomUUID(),
      exam_id: examId,
      author_id: authorId,
      status: 'draft',
      body_md: body,
      score: null,
      feedback_md: null,
      submitted_at: null,
      updated_at: now,
    }
    all.push(row)
  } else if (row.status === 'draft' || row.status === 'returned') {
    row.body_md = body
    row.status = 'draft'
    row.updated_at = now
  }
  writeJson(ATTEMPTS_KEY, all)
  return row
}

export function submitExamAttempt(authorId: string, examId: string, body: string): ExamAttempt {
  const all = listExamAttempts()
  const now = new Date().toISOString()
  let row = all.find((a) => a.author_id === authorId && a.exam_id === examId)
  if (!row) {
    row = {
      id: crypto.randomUUID(),
      exam_id: examId,
      author_id: authorId,
      status: 'submitted',
      body_md: body,
      score: null,
      feedback_md: null,
      submitted_at: now,
      updated_at: now,
    }
    all.push(row)
  } else {
    row.body_md = body
    row.status = 'submitted'
    row.submitted_at = now
    row.updated_at = now
  }
  writeJson(ATTEMPTS_KEY, all)
  // Live Supabase exam_attempts uses UUID FKs from seed; map client slug→uuid after seed in a follow-up.
  return row
}

/** Linked week assignments that make up this midterm/final package. */
export function examLinkedAssignments(exam: ExamDef) {
  const week = getWeek(exam.week_number)
  if (!week) return []
  return [week.assignment_a, week.assignment_b, week.joint]
}

export function examKindLabel(kind: ExamDef['kind']): string {
  return kind === 'midterm' ? 'Промежуточная' : 'Финальная'
}
