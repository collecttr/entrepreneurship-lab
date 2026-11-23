import { MODULES } from '@/data/modules'
import { WEEKS } from '@/data/curriculum'
import {
  COURSE_START_DATE,
  TOTAL_COURSE_WEEKS,
  courseWeekNumber,
  moscowDateString,
} from '@/lib/course-calendar'
import { LEARNERS, canonicalDisplayName, learnerByEmail, type LearnerDef } from '@/lib/learners'
import {
  ensureCleanCourseStart,
  getUnlockedWeek,
  listSubmissions,
  progressPercent,
  type SubmissionRecord,
} from '@/lib/progress-store'
import { DEMO_USERS } from '@/lib/demo-data'
import { isDemoAuth, supabase, supabaseConfigured } from '@/lib/supabase'
import type { ParticipantSlot, Profile } from '@/lib/types'

export interface LearnerProgressCard {
  key: string
  display_name: string
  email: string
  participant_slot: ParticipantSlot
  user_id: string | null
  is_you: boolean
  /** Fully closed weeks (own slot + joint submitted/graded). */
  weeks_completed: number
  weeks_remaining: number
  /** Modules (stages) with all weeks fully done. */
  stages_completed: number
  stages_total: number
  /** Calendar week of the course (from start date). */
  calendar_week: number
  /** Working week hint for the learner. */
  current_week: number
  assignments_completed: number
  assignments_total: number
  assignments_remaining: number
  progress_pct: number
  current_week_complete: boolean
  source: 'local' | 'remote' | 'empty'
}

export interface ProgressSnapshotRow {
  user_id: string
  email: string
  display_name: string
  participant_slot: string | null
  weeks_completed: number
  weeks_remaining: number
  stages_completed: number
  current_week: number
  assignments_completed: number
  assignments_total: number
  progress_pct: number
  updated_at: string
}

/** Same-tab + multi-tab signal after submit / sync / reset. */
export const PROGRESS_CHANGED_EVENT = 'elab-progress'

export function notifyProgressChanged(reason = 'update') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(PROGRESS_CHANGED_EVENT, { detail: { reason } }))
}

function doneStatuses(s: SubmissionRecord | undefined): boolean {
  return Boolean(s && (s.status === 'submitted' || s.status === 'graded'))
}

function relevantCodes(slot: ParticipantSlot): { week: number; code: string }[] {
  const out: { week: number; code: string }[] = []
  for (const w of WEEKS) {
    if (slot === 'B') out.push({ week: w.week_number, code: w.assignment_b.code })
    else out.push({ week: w.week_number, code: w.assignment_a.code })
    out.push({ week: w.week_number, code: w.joint.code })
  }
  return out
}

function weekComplete(
  authorId: string,
  weekNumber: number,
  slot: ParticipantSlot,
  submissions?: SubmissionRecord[],
): boolean {
  const mine = submissions ?? listSubmissions(authorId)
  const week = WEEKS.find((w) => w.week_number === weekNumber)
  if (!week) return false
  const own = slot === 'B' ? week.assignment_b : week.assignment_a
  const ownRow = mine.find((s) => s.assignment_code === own.code)
  const jointRow = mine.find((s) => s.assignment_code === week.joint.code)
  return doneStatuses(ownRow) && doneStatuses(jointRow)
}

function normalizeMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

export function computeLearnerProgress(input: {
  userId: string | null
  email: string
  displayName?: string
  slot: ParticipantSlot
  isYou: boolean
  submissions?: SubmissionRecord[]
  source?: LearnerProgressCard['source']
}): LearnerProgressCard {
  const slot = input.slot ?? 'A'
  const codes = relevantCodes(slot)
  const total = codes.length
  const mine = input.userId ? (input.submissions ?? listSubmissions(input.userId)) : []
  const completed = input.userId
    ? mine.filter((s) => doneStatuses(s) && codes.some((c) => c.code === s.assignment_code)).length
    : 0

  let weeksCompleted = 0
  for (let w = 1; w <= TOTAL_COURSE_WEEKS; w++) {
    if (input.userId && weekComplete(input.userId, w, slot, mine)) weeksCompleted++
    else break
  }

  let stagesCompleted = 0
  for (const mod of MODULES) {
    let ok = true
    for (let w = mod.week_from; w <= mod.week_to; w++) {
      if (!input.userId || !weekComplete(input.userId, w, slot, mine)) {
        ok = false
        break
      }
    }
    if (ok) stagesCompleted++
  }

  const calendarWeek = courseWeekNumber(moscowDateString(), COURSE_START_DATE)
  const unlocked = getUnlockedWeek()
  let currentWeek = calendarWeek
  if (input.userId) {
    const submittedWeeks = mine.filter((s) => doneStatuses(s)).map((s) => s.week_number)
    const maxSubmitted = submittedWeeks.length ? Math.max(...submittedWeeks) : 0
    if (weeksCompleted < TOTAL_COURSE_WEEKS) {
      currentWeek = Math.min(
        TOTAL_COURSE_WEEKS,
        Math.max(weeksCompleted + 1, Math.min(calendarWeek, unlocked), maxSubmitted || 1),
      )
    } else {
      currentWeek = TOTAL_COURSE_WEEKS
    }
  }

  const pct = input.userId ? progressPercent(input.userId, slot) : 0
  const currentComplete = Boolean(
    input.userId && weekComplete(input.userId, currentWeek, slot, mine),
  )

  const learner = learnerByEmail(input.email)
  return {
    key: learner?.key ?? input.email,
    display_name: canonicalDisplayName(
      { email: input.email, display_name: input.displayName ?? '', id: input.userId ?? '' },
      input.displayName || 'Участник',
    ),
    email: input.email,
    participant_slot: slot,
    user_id: input.userId,
    is_you: input.isYou,
    weeks_completed: weeksCompleted,
    weeks_remaining: TOTAL_COURSE_WEEKS - weeksCompleted,
    stages_completed: stagesCompleted,
    stages_total: MODULES.length,
    calendar_week: calendarWeek,
    current_week: currentWeek,
    assignments_completed: completed,
    assignments_total: total,
    assignments_remaining: Math.max(0, total - completed),
    progress_pct: pct,
    current_week_complete: currentComplete,
    source: input.source ?? (input.userId ? 'local' : 'empty'),
  }
}

function resolveLearnerUserId(learner: LearnerDef, me: Profile): string | null {
  if (normalizeMatch(me.email, learner.email) || me.id === learner.demo_id) return me.id
  if (isDemoAuth) return learner.demo_id

  const authors = [...new Set(listSubmissions().map((s) => s.author_id))]
  const myLearner = learnerByEmail(me.email) ?? LEARNERS.find((l) => l.demo_id === me.id)
  if (myLearner && myLearner.key !== learner.key) {
    const other = authors.find((id) => id !== me.id)
    if (other) return other
  }
  return null
}

function cardFromSnapshot(row: ProgressSnapshotRow, me: Profile): LearnerProgressCard {
  const slot = (row.participant_slot === 'B' ? 'B' : 'A') as ParticipantSlot
  const base = computeLearnerProgress({
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    slot,
    isYou: row.user_id === me.id || normalizeMatch(row.email, me.email),
    source: 'remote',
  })
  const localDone = listSubmissions(row.user_id).filter(
    (s) => s.status === 'submitted' || s.status === 'graded',
  ).length
  if (localDone > 0) return { ...base, source: 'local' }

  // Stale / seeded remote rows with 0 assignments must never paint a fake bar.
  const assignmentsCompleted = Math.max(0, row.assignments_completed ?? 0)
  const progressPct =
    assignmentsCompleted === 0 ? 0 : Math.max(0, Math.min(100, row.progress_pct ?? 0))
  const weeksCompleted = assignmentsCompleted === 0 ? 0 : row.weeks_completed
  const stagesCompleted = assignmentsCompleted === 0 ? 0 : row.stages_completed

  return {
    ...base,
    weeks_completed: weeksCompleted,
    weeks_remaining:
      assignmentsCompleted === 0 ? TOTAL_COURSE_WEEKS : row.weeks_remaining,
    stages_completed: stagesCompleted,
    current_week: row.current_week || 1,
    assignments_completed: assignmentsCompleted,
    assignments_total: row.assignments_total || base.assignments_total,
    assignments_remaining: Math.max(
      0,
      (row.assignments_total || base.assignments_total) - assignmentsCompleted,
    ),
    progress_pct: progressPct,
    source: 'remote',
  }
}

/** Build Саша vs Платон cards from local submissions + optional remote snapshots. */
export async function loadPeerProgressBoard(me: Profile): Promise<LearnerProgressCard[]> {
  ensureCleanCourseStart()
  const remote = await fetchProgressSnapshots()

  const cards = LEARNERS.map((learner) => {
    const remoteRow = remote.find((r) => normalizeMatch(r.email, learner.email))
    if (remoteRow) {
      const localDone = listSubmissions(remoteRow.user_id).filter(
        (s) => s.status === 'submitted' || s.status === 'graded',
      ).length
      if (localDone === 0) return cardFromSnapshot(remoteRow, me)
    }

    const userId = resolveLearnerUserId(learner, me)
    const demoEmail = DEMO_USERS.find((u) => u.profile.id === learner.demo_id)?.profile.email

    return computeLearnerProgress({
      userId,
      email: isDemoAuth ? (demoEmail ?? learner.email) : learner.email,
      displayName: learner.display_name,
      slot: learner.participant_slot,
      isYou:
        normalizeMatch(me.email, learner.email) ||
        me.id === learner.demo_id ||
        canonicalDisplayName(me) === learner.display_name,
      source: userId ? 'local' : remoteRow ? 'remote' : 'empty',
    })
  })

  return cards.map((c) => ({
    ...c,
    is_you: c.is_you || c.user_id === me.id || canonicalDisplayName(me) === c.display_name,
  }))
}

async function fetchProgressSnapshots(): Promise<ProgressSnapshotRow[]> {
  if (isDemoAuth || !supabaseConfigured || !supabase) return []
  try {
    const { data, error } = await supabase.from('progress_snapshots').select('*')
    if (error) {
      console.warn('progress_snapshots fetch:', error.message)
      return []
    }
    return (data ?? []) as ProgressSnapshotRow[]
  } catch (err) {
    console.warn('progress_snapshots fetch failed:', err)
    return []
  }
}

/** Persist own progress for the peer board (cross-device). Safe no-op if table missing. */
export async function syncOwnProgressSnapshot(profile: Profile): Promise<void> {
  ensureCleanCourseStart()
  const card = computeLearnerProgress({
    userId: profile.id,
    email: profile.email,
    displayName: canonicalDisplayName(profile),
    slot: profile.participant_slot ?? learnerByEmail(profile.email)?.participant_slot ?? 'A',
    isYou: true,
  })

  // Local board / other tabs update immediately even in demo or offline.
  notifyProgressChanged('local-sync')

  if (isDemoAuth || !supabaseConfigured || !supabase) return

  try {
    const row: ProgressSnapshotRow = {
      user_id: profile.id,
      email: profile.email.toLowerCase(),
      display_name: card.display_name,
      participant_slot: card.participant_slot,
      weeks_completed: card.weeks_completed,
      weeks_remaining: card.weeks_remaining,
      stages_completed: card.stages_completed,
      current_week: card.current_week,
      assignments_completed: card.assignments_completed,
      assignments_total: card.assignments_total,
      progress_pct: card.progress_pct,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('progress_snapshots').upsert(row, {
      onConflict: 'user_id',
    })
    if (error) console.warn('progress_snapshots upsert:', error.message)
    else notifyProgressChanged('remote-sync')
  } catch (err) {
    console.warn('progress_snapshots upsert failed:', err)
  }
}

/**
 * Live peer board: Realtime on progress_snapshots + local custom/storage events.
 * Free-tier friendly — one shared channel, refcounted.
 */
let progressRealtimeRefCount = 0
let progressRealtimeCleanup: (() => void) | null = null

export function subscribePeerProgress(onChange: () => void): () => void {
  const refresh = () => {
    try {
      onChange()
    } catch (err) {
      console.warn('peer progress listener failed:', err)
    }
  }

  const onCustom = () => refresh()
  const onStorage = (e: StorageEvent) => {
    if (
      e.key === 'elab_submissions' ||
      e.key === 'elab_unlocked_week' ||
      e.key === 'elab_skill_progress' ||
      e.key === null
    ) {
      refresh()
    }
  }

  window.addEventListener(PROGRESS_CHANGED_EVENT, onCustom)
  window.addEventListener('elab-progress-reset', onCustom)
  window.addEventListener('elab-unlock', onCustom)
  window.addEventListener('storage', onStorage)

  if (!isDemoAuth && supabaseConfigured && supabase) {
    const live = supabase
    progressRealtimeRefCount += 1
    if (progressRealtimeRefCount === 1 || !progressRealtimeCleanup) {
      try {
        const channel = live
          .channel('elab-progress-live')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'progress_snapshots' },
            () => refresh(),
          )
          .subscribe((status, err) => {
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.warn('realtime progress_snapshots:', err?.message ?? status)
            }
          })
        progressRealtimeCleanup = () => {
          try {
            void live.removeChannel(channel)
          } catch (removeErr) {
            console.warn('realtime progress remove failed:', removeErr)
          }
          progressRealtimeCleanup = null
        }
      } catch (err) {
        console.warn('realtime progress subscribe failed:', err)
        progressRealtimeCleanup = null
      }
    }
  }

  return () => {
    window.removeEventListener(PROGRESS_CHANGED_EVENT, onCustom)
    window.removeEventListener('elab-progress-reset', onCustom)
    window.removeEventListener('elab-unlock', onCustom)
    window.removeEventListener('storage', onStorage)
    if (!isDemoAuth && supabaseConfigured && supabase) {
      progressRealtimeRefCount = Math.max(0, progressRealtimeRefCount - 1)
      if (progressRealtimeRefCount === 0) {
        progressRealtimeCleanup?.()
      }
    }
  }
}

export function isCurrentWeekIncomplete(profile: Profile): boolean {
  const slot =
    profile.participant_slot ?? learnerByEmail(profile.email)?.participant_slot ?? 'A'
  const week = courseWeekNumber()
  return !weekComplete(profile.id, week, slot)
}
