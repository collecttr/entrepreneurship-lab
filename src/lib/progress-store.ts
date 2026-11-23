import { WEEKS, type AssignmentDef } from '@/data/curriculum'
import { SKILLS } from '@/data/skills'
import { COURSE_START_DATE } from '@/lib/course-calendar'
import { isDemoAuth, supabase, supabaseConfigured } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

const UNLOCK_KEY = 'elab_unlocked_week'
const SUBMISSIONS_KEY = 'elab_submissions'
const SKILL_KEY = 'elab_skill_progress'
const EVIDENCE_KEY = 'elab_skill_evidence'
/** One-time client migrate for course restart 2026-11-23 (clears stale demo %). */
const COURSE_RESET_KEY = 'elab_course_start_reset_v1_2026-11-23'

function emptySkillScores(): SkillScore[] {
  return SKILLS.map((s) => ({
    skill_id: s.id,
    score_ema: 0,
    evidence_count: 0,
    last_updated: '—',
  }))
}

export type SubmissionStatus = 'draft' | 'submitted' | 'returned' | 'graded'

export interface SubmissionRecord {
  id: string
  assignment_code: string
  week_number: number
  author_id: string
  status: SubmissionStatus
  body_md: string
  submitted_at: string | null
  grade_score: number | null
}

export interface SkillScore {
  skill_id: string
  score_ema: number
  evidence_count: number
  last_updated: string
}

export interface SkillEvidence {
  id: string
  user_id: string
  skill_id: string
  source: 'assignment' | 'trainer' | 'exam'
  label: string
  signal: number
  at: string
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
}

export function getUnlockedWeek(): number {
  const n = Number(localStorage.getItem(UNLOCK_KEY) ?? '1')
  return Number.isFinite(n) && n >= 1 ? Math.min(26, Math.floor(n)) : 1
}

export function setUnlockedWeek(week: number) {
  const next = Math.max(1, Math.min(26, week))
  localStorage.setItem(UNLOCK_KEY, String(next))
  window.dispatchEvent(new CustomEvent('elab-unlock', { detail: { week: next } }))
  void syncUnlockedWeekToSupabase(next)
}

/** Pull unlock from program_settings when Supabase is live; keep local cache. */
export async function refreshUnlockedWeekFromSupabase(): Promise<number> {
  if (isDemoAuth || !supabaseConfigured || !supabase) return getUnlockedWeek()
  try {
    const { data, error } = await supabase
      .from('program_settings')
      .select('current_unlocked_week')
      .eq('id', 1)
      .maybeSingle()
    if (error) throw error
    if (data?.current_unlocked_week) {
      const next = Math.max(1, Math.min(26, Number(data.current_unlocked_week)))
      localStorage.setItem(UNLOCK_KEY, String(next))
      return next
    }
  } catch (err) {
    console.warn('unlock refresh skipped:', err)
  }
  return getUnlockedWeek()
}

async function syncUnlockedWeekToSupabase(week: number) {
  if (isDemoAuth || !supabaseConfigured || !supabase) return
  try {
    await supabase
      .from('program_settings')
      .upsert({ id: 1, current_unlocked_week: week, updated_at: new Date().toISOString() })
  } catch (err) {
    console.warn('unlock sync skipped:', err)
  }
}

export function isWeekUnlocked(weekNumber: number, unlocked = getUnlockedWeek()): boolean {
  return weekNumber <= unlocked
}

export function listSubmissions(authorId?: string): SubmissionRecord[] {
  const all = readJson<SubmissionRecord[]>(SUBMISSIONS_KEY, [])
  return authorId ? all.filter((s) => s.author_id === authorId) : all
}

export function getSubmission(authorId: string, code: string): SubmissionRecord | undefined {
  return listSubmissions(authorId).find((s) => s.assignment_code === code)
}

export function saveDraft(authorId: string, assignment: AssignmentDef, weekNumber: number, body: string) {
  const all = listSubmissions()
  const existing = all.find((s) => s.author_id === authorId && s.assignment_code === assignment.code)
  if (existing) {
    existing.body_md = body
    if (existing.status === 'submitted' || existing.status === 'graded') {
      // keep status; edits create new draft only if not locked — allow edit of draft/returned
    } else {
      existing.status = 'draft'
    }
  } else {
    all.push({
      id: crypto.randomUUID(),
      assignment_code: assignment.code,
      week_number: weekNumber,
      author_id: authorId,
      status: 'draft',
      body_md: body,
      submitted_at: null,
      grade_score: null,
    })
  }
  writeJson(SUBMISSIONS_KEY, all)
}

export function submitAssignment(
  authorId: string,
  assignment: AssignmentDef,
  weekNumber: number,
  body: string,
): SubmissionRecord {
  const all = listSubmissions()
  let row = all.find((s) => s.author_id === authorId && s.assignment_code === assignment.code)
  const now = new Date().toISOString()
  if (!row) {
    row = {
      id: crypto.randomUUID(),
      assignment_code: assignment.code,
      week_number: weekNumber,
      author_id: authorId,
      status: 'submitted',
      body_md: body,
      submitted_at: now,
      grade_score: null,
    }
    all.push(row)
  } else {
    row.body_md = body
    row.status = 'submitted'
    row.submitted_at = now
  }
  writeJson(SUBMISSIONS_KEY, all)
  bumpSkills(authorId, assignment.skill_slugs, 55, {
    source: 'assignment',
    label: `Сдача ${assignment.code}`,
  })
  return row
}

function bumpSkills(
  authorId: string,
  skillSlugs: string[],
  signal = 55,
  evidence?: { source: SkillEvidence['source']; label: string },
) {
  const map = readJson<Record<string, SkillScore[]>>(SKILL_KEY, {})
  const list = map[authorId] ?? emptySkillScores().map((s) => ({
    ...s,
    last_updated: new Date().toISOString().slice(0, 10),
  }))
  const clamped = Math.max(0, Math.min(100, signal))
  const now = new Date().toISOString()
  const evidenceLog = readJson<SkillEvidence[]>(EVIDENCE_KEY, [])
  for (const slug of skillSlugs) {
    const skill = SKILLS.find((s) => s.slug === slug)
    if (!skill) continue
    const row = list.find((x) => x.skill_id === skill.id)
    if (!row) continue
    row.evidence_count += 1
    row.score_ema = Math.min(100, Math.round(row.score_ema * 0.7 + clamped * 0.3))
    row.last_updated = now.slice(0, 10)
    if (evidence) {
      evidenceLog.unshift({
        id: crypto.randomUUID(),
        user_id: authorId,
        skill_id: skill.id,
        source: evidence.source,
        label: evidence.label,
        signal: clamped,
        at: now,
      })
    }
  }
  map[authorId] = list
  writeJson(SKILL_KEY, map)
  if (evidence) {
    writeJson(EVIDENCE_KEY, evidenceLog.slice(0, 200))
  }
}

/** Update skill EMA from local examiner / sim scores (not page views). */
export function applyTrainerSkillBump(authorId: string, skillSlugs: string[], score0to100: number) {
  bumpSkills(authorId, skillSlugs, score0to100, {
    source: 'trainer',
    label: `Тренировка · сигнал ${Math.round(score0to100)}`,
  })
}

export function listSkillEvidence(userId: string, skillId?: string): SkillEvidence[] {
  const all = readJson<SkillEvidence[]>(EVIDENCE_KEY, []).filter((e) => e.user_id === userId)
  return skillId ? all.filter((e) => e.skill_id === skillId) : all
}

export function getSkillProgress(authorId: string): SkillScore[] {
  ensureCleanCourseStart()
  const map = readJson<Record<string, SkillScore[]>>(SKILL_KEY, {})
  const rows = map[authorId]
  if (!rows) return emptySkillScores()
  // No evidence → always show 0 (never fake 25/28/42 starter scores).
  return rows.map((s) =>
    s.evidence_count > 0
      ? s
      : { ...s, score_ema: 0, evidence_count: 0 },
  )
}

function hasSubmittedOnOrAfterCourseStart(rows: SubmissionRecord[]): boolean {
  return rows.some((s) => {
    if (s.status !== 'submitted' && s.status !== 'graded') return false
    const at = (s.submitted_at ?? '').slice(0, 10)
    return !at || at >= COURSE_START_DATE
  })
}

/** Zero skill EMAs that have no evidence (safe anytime). */
export function zeroUnevidencedSkillScores(): void {
  const map = readJson<Record<string, SkillScore[]>>(SKILL_KEY, {})
  let changed = false
  for (const authorId of Object.keys(map)) {
    map[authorId] = (map[authorId] ?? []).map((s) => {
      if (s.evidence_count > 0) return s
      if (s.score_ema === 0) return s
      changed = true
      return { ...s, score_ema: 0, evidence_count: 0 }
    })
  }
  if (changed) writeJson(SKILL_KEY, map)
}

/**
 * Clear local submissions + skill EMA/evidence.
 * Used by admin reset and one-time course-start migrate when there is no real work.
 */
export function clearLocalProgressStores(): void {
  localStorage.removeItem(SUBMISSIONS_KEY)
  localStorage.removeItem(SKILL_KEY)
  localStorage.removeItem(EVIDENCE_KEY)
  window.dispatchEvent(new CustomEvent('elab-progress-reset'))
}

/**
 * One-time migrate for live course start (2026-11-23):
 * - If no submitted/graded work on/after course start → wipe stale local progress (→ clean 0%).
 * - Always zero skill bars with no evidence.
 * Demo auth is left alone (labeled demo fixtures may keep sample scores elsewhere).
 */
export function ensureCleanCourseStart(): { cleared: boolean } {
  if (typeof window === 'undefined') return { cleared: false }
  try {
    if (localStorage.getItem(COURSE_RESET_KEY) === '1') {
      zeroUnevidencedSkillScores()
      return { cleared: false }
    }

    zeroUnevidencedSkillScores()

    if (isDemoAuth) {
      localStorage.setItem(COURSE_RESET_KEY, '1')
      return { cleared: false }
    }

    const all = listSubmissions()
    const realWork = hasSubmittedOnOrAfterCourseStart(all)
    if (!realWork) {
      clearLocalProgressStores()
      localStorage.setItem(COURSE_RESET_KEY, '1')
      return { cleared: true }
    }

    localStorage.setItem(COURSE_RESET_KEY, '1')
    return { cleared: false }
  } catch (err) {
    console.warn('course start progress migrate skipped:', err)
    return { cleared: false }
  }
}

/**
 * Admin / explicit clear: wipe local progress and allow migrate to re-run.
 * Does not delete remote `progress_snapshots` (see SQL in migration 011).
 */
export function adminClearLocalProgress(): void {
  clearLocalProgressStores()
  localStorage.removeItem(COURSE_RESET_KEY)
  ensureCleanCourseStart()
}

/** Progress from submitted/graded assignments only — not page views. */
export function progressPercent(authorId: string, slot: 'A' | 'B' | null): number {
  const mine = listSubmissions(authorId).filter((s) => s.status === 'submitted' || s.status === 'graded')
  const relevantCodes = new Set<string>()
  for (const w of WEEKS) {
    if (slot === 'B') relevantCodes.add(w.assignment_b.code)
    else relevantCodes.add(w.assignment_a.code)
    relevantCodes.add(w.joint.code)
  }
  const done = mine.filter((s) => relevantCodes.has(s.assignment_code)).length
  const total = relevantCodes.size
  return total ? Math.round((done / total) * 100) : 0
}

export function assignmentsForProfile(profile: Profile): {
  week: number
  assignment: AssignmentDef
  submission?: SubmissionRecord
}[] {
  const slot = profile.participant_slot
  const out: { week: number; assignment: AssignmentDef; submission?: SubmissionRecord }[] = []
  for (const w of WEEKS) {
    const list = [w.assignment_a, w.assignment_b, w.joint].filter((a) => {
      if (a.participant_slot === 'both') return true
      if (!slot) return true
      return a.participant_slot === slot
    })
    for (const assignment of list) {
      out.push({
        week: w.week_number,
        assignment,
        submission: getSubmission(profile.id, assignment.code),
      })
    }
  }
  return out
}
