import { WEEKS, type AssignmentDef } from '@/data/curriculum'
import { SKILLS } from '@/data/skills'
import type { Profile } from '@/lib/types'

const UNLOCK_KEY = 'elab_unlocked_week'
const SUBMISSIONS_KEY = 'elab_submissions'
const SKILL_KEY = 'elab_skill_progress'

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
  localStorage.setItem(UNLOCK_KEY, String(Math.max(1, Math.min(26, week))))
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
  bumpSkills(authorId, assignment.skill_slugs)
  return row
}

function bumpSkills(authorId: string, skillSlugs: string[], signal = 55) {
  const map = readJson<Record<string, SkillScore[]>>(SKILL_KEY, {})
  const list = map[authorId] ?? SKILLS.map((s) => ({
    skill_id: s.id,
    score_ema: 25,
    evidence_count: 0,
    last_updated: new Date().toISOString().slice(0, 10),
  }))
  const clamped = Math.max(0, Math.min(100, signal))
  for (const slug of skillSlugs) {
    const skill = SKILLS.find((s) => s.slug === slug)
    if (!skill) continue
    const row = list.find((x) => x.skill_id === skill.id)
    if (!row) continue
    row.evidence_count += 1
    row.score_ema = Math.min(100, Math.round(row.score_ema * 0.7 + clamped * 0.3))
    row.last_updated = new Date().toISOString().slice(0, 10)
  }
  map[authorId] = list
  writeJson(SKILL_KEY, map)
}

/** Update skill EMA from local examiner / sim scores (not page views). */
export function applyTrainerSkillBump(authorId: string, skillSlugs: string[], score0to100: number) {
  bumpSkills(authorId, skillSlugs, score0to100)
}

export function getSkillProgress(authorId: string): SkillScore[] {
  const map = readJson<Record<string, SkillScore[]>>(SKILL_KEY, {})
  if (map[authorId]) return map[authorId]
  return SKILLS.map((s) => ({
    skill_id: s.id,
    score_ema: 28,
    evidence_count: 0,
    last_updated: '—',
  }))
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
