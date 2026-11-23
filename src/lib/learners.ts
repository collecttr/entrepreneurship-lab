import type { ParticipantSlot, Profile, UserRole } from '@/lib/types'

/** Canonical two learners of the closed course. */
export interface LearnerDef {
  key: 'sasha' | 'platon'
  display_name: 'Саша' | 'Платон'
  email: string
  participant_slot: Exclude<ParticipantSlot, null>
  role: UserRole
  /** Demo fixture id when VITE_DEMO_AUTH=true */
  demo_id: string
}

export const LEARNERS: readonly LearnerDef[] = [
  {
    key: 'sasha',
    display_name: 'Саша',
    email: 'standkill25@gmail.com',
    participant_slot: 'B',
    role: 'admin',
    demo_id: 'demo-user-b',
  },
  {
    key: 'platon',
    display_name: 'Платон',
    email: 'officevishfind@gmail.com',
    participant_slot: 'A',
    role: 'learner',
    demo_id: 'demo-user-a',
  },
] as const

const DEMO_EMAIL_BY_SLOT: Record<'A' | 'B', string> = {
  A: 'learner.a@lab.local',
  B: 'learner.b@lab.local',
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function learnerByEmail(email: string | null | undefined): LearnerDef | undefined {
  if (!email) return undefined
  const e = normalizeEmail(email)
  const live = LEARNERS.find((l) => l.email === e)
  if (live) return live
  if (e === DEMO_EMAIL_BY_SLOT.A) return LEARNERS.find((l) => l.key === 'platon')
  if (e === DEMO_EMAIL_BY_SLOT.B) return LEARNERS.find((l) => l.key === 'sasha')
  return undefined
}

export function learnerById(id: string | null | undefined): LearnerDef | undefined {
  if (!id) return undefined
  return LEARNERS.find((l) => l.demo_id === id)
}

/** Prefer canonical course names (Саша / Платон) over raw profile/email. */
export function canonicalDisplayName(
  emailOrProfile: string | Pick<Profile, 'email' | 'display_name' | 'id'> | null | undefined,
  fallback = 'Участник',
): string {
  if (!emailOrProfile) return fallback
  if (typeof emailOrProfile === 'string') {
    return learnerByEmail(emailOrProfile)?.display_name ?? fallback
  }
  const byEmail = learnerByEmail(emailOrProfile.email)
  if (byEmail) return byEmail.display_name
  const byId = learnerById(emailOrProfile.id)
  if (byId) return byId.display_name
  const name = emailOrProfile.display_name?.trim()
  if (name && name !== 'США') return name
  return emailOrProfile.email?.split('@')[0] || fallback
}

export function otherLearner(email: string): LearnerDef | undefined {
  const me = learnerByEmail(email)
  if (!me) return LEARNERS[0]
  return LEARNERS.find((l) => l.key !== me.key)
}
