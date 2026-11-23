import { WEEKS, type AssignmentDef } from '@/data/curriculum'
import { getSubmission, listSubmissions, type SubmissionRecord } from '@/lib/progress-store'
import type { Profile } from '@/lib/types'

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
