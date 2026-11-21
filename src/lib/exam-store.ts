import { EXAMS, getWeek, type ExamDef } from '@/data/curriculum'
import { isDemoAuth, supabase, supabaseConfigured } from '@/lib/supabase'

const ATTEMPTS_KEY = 'elab_exam_attempts'
const UUID_CACHE_KEY = 'elab_exam_uuid_map'

export type ExamAttemptStatus = 'draft' | 'submitted' | 'returned' | 'graded'

export interface ExamAttempt {
  id: string
  /** Client slug (`exam-mid-4`) — never a Supabase UUID in localStorage. */
  exam_id: string
  author_id: string
  status: ExamAttemptStatus
  body_md: string
  score: number | null
  feedback_md: string | null
  submitted_at: string | null
  updated_at: string
}

const useLiveExams = () => Boolean(supabaseConfigured && !isDemoAuth && supabase)

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
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.warn('exam localStorage write failed:', key, err)
  }
  try {
    window.dispatchEvent(new CustomEvent('elab-exams'))
  } catch {
    /* ignore */
  }
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function normalizeAttempt(raw: unknown, index: number): ExamAttempt | null {
  if (!raw || typeof raw !== 'object') return null
  const a = raw as Partial<ExamAttempt>
  const exam_id = typeof a.exam_id === 'string' && a.exam_id ? a.exam_id : ''
  const author_id = typeof a.author_id === 'string' && a.author_id ? a.author_id : ''
  if (!exam_id || !author_id) return null
  const status = a.status
  const okStatus =
    status === 'draft' || status === 'submitted' || status === 'returned' || status === 'graded'
      ? status
      : 'draft'
  return {
    id: typeof a.id === 'string' && a.id ? a.id : `exam-attempt-${index}`,
    exam_id,
    author_id,
    status: okStatus,
    body_md: typeof a.body_md === 'string' ? a.body_md : String(a.body_md ?? ''),
    score: typeof a.score === 'number' ? a.score : null,
    feedback_md: typeof a.feedback_md === 'string' ? a.feedback_md : null,
    submitted_at: typeof a.submitted_at === 'string' && a.submitted_at ? a.submitted_at : null,
    updated_at:
      typeof a.updated_at === 'string' && a.updated_at
        ? a.updated_at
        : new Date().toISOString(),
  }
}

/** Stable client slug for a DB exam row (week_number + kind). */
export function examSlugFor(weekNumber: number, kind: ExamDef['kind']): string | undefined {
  return EXAMS.find((e) => e.week_number === weekNumber && e.kind === kind)?.id
}

type UuidMap = Record<string, string> // slug → uuid

function readUuidCache(): UuidMap {
  const raw = readJson<unknown>(UUID_CACHE_KEY, {})
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: UuidMap = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === 'string' && v) out[k] = v
  }
  return out
}

function writeUuidCache(map: UuidMap) {
  writeJson(UUID_CACHE_KEY, map)
}

/** Resolve client slug → Supabase exams.id (UUID). Caches lookups. */
export async function resolveExamUuid(slug: string): Promise<string | null> {
  const exam = getExam(slug)
  if (!exam) return null
  const cache = readUuidCache()
  if (cache[slug]) return cache[slug]
  if (!useLiveExams() || !supabase) return null
  try {
    const { data, error } = await supabase
      .from('exams')
      .select('id, week_number, kind')
      .eq('week_number', exam.week_number)
      .eq('kind', exam.kind)
      .maybeSingle()
    if (error) {
      console.warn('exam uuid resolve:', error.message)
      return null
    }
    if (!data?.id) return null
    cache[slug] = data.id as string
    writeUuidCache(cache)
    return cache[slug]
  } catch (err) {
    console.warn('exam uuid resolve failed:', err)
    return null
  }
}

/** Prefetch all slug↔UUID pairs when live (safe no-op in demo). */
export async function hydrateExamUuidMap(): Promise<UuidMap> {
  const cache = readUuidCache()
  if (!useLiveExams() || !supabase) return cache
  try {
    const { data, error } = await supabase.from('exams').select('id, week_number, kind')
    if (error) {
      console.warn('exam uuid hydrate:', error.message)
      return cache
    }
    for (const row of asArray<{ id: string; week_number: number; kind: string }>(data)) {
      const slug = examSlugFor(row.week_number, row.kind as ExamDef['kind'])
      if (slug && row.id) cache[slug] = row.id
    }
    writeUuidCache(cache)
  } catch (err) {
    console.warn('exam uuid hydrate failed:', err)
  }
  return cache
}

function slugFromUuid(uuid: string, cache: UuidMap): string | null {
  for (const [slug, id] of Object.entries(cache)) {
    if (id === uuid) return slug
  }
  return null
}

async function syncAttemptToSupabase(row: ExamAttempt) {
  if (!useLiveExams() || !supabase) return
  const examUuid = await resolveExamUuid(row.exam_id)
  if (!examUuid) {
    console.warn('exam sync skipped — no UUID for', row.exam_id)
    return
  }
  try {
    const payload: Record<string, unknown> = {
      id: row.id,
      exam_id: examUuid,
      author_id: row.author_id,
      status: row.status,
      score: row.score,
      feedback_md: row.feedback_md,
      submitted_at: row.submitted_at,
    }
    // body_md / updated_at exist after migration 008; ignore column errors gracefully
    payload.body_md = row.body_md
    payload.updated_at = row.updated_at
    const { error } = await supabase.from('exam_attempts').upsert(payload, {
      onConflict: 'exam_id,author_id',
    })
    if (error) {
      // Retry without optional columns if schema predates 008
      if (/body_md|updated_at/i.test(error.message)) {
        const { error: err2 } = await supabase.from('exam_attempts').upsert(
          {
            id: row.id,
            exam_id: examUuid,
            author_id: row.author_id,
            status: row.status,
            score: row.score,
            feedback_md: row.feedback_md,
            submitted_at: row.submitted_at,
          },
          { onConflict: 'exam_id,author_id' },
        )
        if (err2) console.warn('exam_attempts upsert:', err2.message)
      } else {
        console.warn('exam_attempts upsert:', error.message)
      }
    }
  } catch (err) {
    console.warn('exam_attempts sync failed:', err)
  }
}

/** Pull remote attempts; map UUID → slug; merge into localStorage (slug keys win for body). */
export async function hydrateExamAttemptsFromSupabase(authorId: string): Promise<void> {
  if (!useLiveExams() || !supabase) return
  const cache = await hydrateExamUuidMap()
  try {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('author_id', authorId)
    if (error) {
      console.warn('exam_attempts hydrate:', error.message)
      return
    }
    const local = listExamAttempts()
    const byKey = new Map(local.map((a) => [`${a.author_id}:${a.exam_id}`, a]))
    for (const row of asArray<Record<string, unknown>>(data)) {
      const examUuid = typeof row.exam_id === 'string' ? row.exam_id : ''
      const slug = slugFromUuid(examUuid, cache) ?? examUuid
      // Only accept known client slugs — drop orphan UUIDs that didn't map
      if (!getExam(slug)) continue
      const author_id = typeof row.author_id === 'string' ? row.author_id : authorId
      const key = `${author_id}:${slug}`
      const existing = byKey.get(key)
      const remoteUpdated =
        typeof row.updated_at === 'string'
          ? row.updated_at
          : typeof row.submitted_at === 'string'
            ? row.submitted_at
            : ''
      const remoteBody = typeof row.body_md === 'string' ? row.body_md : ''
      if (existing) {
        // Prefer richer local body if remote has none; otherwise take newer remote status
        if (remoteBody && remoteBody.length >= existing.body_md.length) {
          existing.body_md = remoteBody
        }
        if (remoteUpdated && remoteUpdated >= existing.updated_at) {
          existing.status = (row.status as ExamAttemptStatus) ?? existing.status
          existing.score = typeof row.score === 'number' ? row.score : existing.score
          existing.feedback_md =
            typeof row.feedback_md === 'string' ? row.feedback_md : existing.feedback_md
          existing.submitted_at =
            typeof row.submitted_at === 'string' ? row.submitted_at : existing.submitted_at
          existing.updated_at = remoteUpdated
        }
      } else {
        byKey.set(key, {
          id: typeof row.id === 'string' ? row.id : crypto.randomUUID(),
          exam_id: slug,
          author_id,
          status: (row.status as ExamAttemptStatus) ?? 'draft',
          body_md: remoteBody,
          score: typeof row.score === 'number' ? row.score : null,
          feedback_md: typeof row.feedback_md === 'string' ? row.feedback_md : null,
          submitted_at: typeof row.submitted_at === 'string' ? row.submitted_at : null,
          updated_at: remoteUpdated || new Date().toISOString(),
        })
      }
    }
    writeJson(ATTEMPTS_KEY, [...byKey.values()])
  } catch (err) {
    console.warn('exam_attempts hydrate failed:', err)
  }
}

export function getExam(id: string): ExamDef | undefined {
  return EXAMS.find((e) => e.id === id)
}

export function listExamAttempts(authorId?: string): ExamAttempt[] {
  try {
    const raw = readJson<unknown>(ATTEMPTS_KEY, [])
    const all = asArray<unknown>(raw)
      .map((row, i) => normalizeAttempt(row, i))
      .filter((a): a is ExamAttempt => a != null)
    return authorId ? all.filter((a) => a.author_id === authorId) : all
  } catch (err) {
    console.warn('listExamAttempts failed:', err)
    return []
  }
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
  void syncAttemptToSupabase(row)
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
  void syncAttemptToSupabase(row)
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
