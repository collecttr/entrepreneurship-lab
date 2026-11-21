export type UserRole = 'learner' | 'admin'
export type ParticipantSlot = 'A' | 'B' | null

export interface Profile {
  id: string
  email: string
  display_name: string
  role: UserRole
  participant_slot: ParticipantSlot
  avatar_path: string | null
  timezone: string
  created_at: string
  updated_at: string
}

export interface ProgramSettings {
  id: number
  current_unlocked_week: number
  program_start_date: string
  hours_per_week_target: number
  ai_spend_lock: boolean
  ai_monthly_budget_tokens: number
  updated_at: string
}

export interface WeekStub {
  id: string
  week_number: number
  title_ru: string
  summary_ru: string
  is_unlocked: boolean
  module_title_ru: string
}

export interface SkillProgressStub {
  skill_id: string
  title_ru: string
  category: string
  score_ema: number
  evidence_count: number
  last_updated: string
}

export interface TaskItem {
  id: string
  title: string
  due_label: string
  status: 'today' | 'overdue' | 'upcoming'
  kind: string
}

export interface RecommendationItem {
  id: string
  title: string
  reason: string
  href?: string
}

export interface ActivityItem {
  id: string
  title: string
  meta: string
  at: string
}

export interface DashboardData {
  profile: Profile
  settings: ProgramSettings
  currentWeek: WeekStub
  overallProgressPct: number
  skillProgress: SkillProgressStub[]
  tasksToday: TaskItem[]
  tasksOverdue: TaskItem[]
  nextJoint: { title: string; when: string; href: string }
  recentMessages: ActivityItem[]
  recentResults: ActivityItem[]
  weakSkills: SkillProgressStub[]
  recommendationsTomorrow: RecommendationItem[]
  calendarDays: { date: string; label: string; completed: number; total: number }[]
  /** Week-by-week progress for unlocked weeks (assignments submitted/graded). */
  weekHistory: {
    week_number: number
    title_ru: string
    completed: number
    total: number
    status_ru: string
  }[]
  isDemoData: boolean
}
