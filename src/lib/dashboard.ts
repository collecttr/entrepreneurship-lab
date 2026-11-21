import { getModule, getWeek } from '@/data/curriculum'
import { SKILLS } from '@/data/skills'
import { authorName, listDiscussions, listMessages } from '@/lib/collab-store'
import {
  assignmentsForProfile,
  getSkillProgress,
  getUnlockedWeek,
  listSubmissions,
  progressPercent,
} from '@/lib/progress-store'
import { isDemoAuth, supabase } from './supabase'
import type { DashboardData, Profile, ProgramSettings } from './types'

async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data as Profile | null
}

function buildFromCurriculum(profile: Profile): DashboardData {
  const unlocked = getUnlockedWeek()
  const week = getWeek(unlocked) ?? getWeek(1)!
  const mod = getModule(week.week_number)
  const skills = getSkillProgress(profile.id).map((s) => {
    const meta = SKILLS.find((x) => x.id === s.skill_id)
    return {
      skill_id: s.skill_id,
      title_ru: meta?.title_ru ?? s.skill_id,
      category: meta?.category ?? 'other',
      score_ema: s.score_ema,
      evidence_count: s.evidence_count,
      last_updated: s.last_updated,
    }
  })
  const weakSkills = [...skills].sort((a, b) => a.score_ema - b.score_ema).slice(0, 3)
  const items = assignmentsForProfile(profile).filter((i) => i.week === unlocked)
  const tasksToday = items
    .filter((i) => !i.submission || i.submission.status === 'draft')
    .slice(0, 3)
    .map((i) => ({
      id: i.assignment.code,
      title: i.assignment.title_ru,
      due_label: `неделя ${i.week} · ≤${i.assignment.max_minutes} мин`,
      status: 'today' as const,
      kind: i.assignment.participant_slot === 'both' ? 'совместное' : 'задание',
    }))
  const overdue = listSubmissions(profile.id)
    .filter((s) => s.status === 'draft' && s.week_number < unlocked)
    .map((s) => ({
      id: s.id,
      title: s.assignment_code,
      due_label: `черновик · неделя ${s.week_number}`,
      status: 'overdue' as const,
      kind: 'задание',
    }))

  const settings: ProgramSettings = {
    id: 1,
    current_unlocked_week: unlocked,
    program_start_date: '2026-11-17',
    hours_per_week_target: 240,
    ai_spend_lock: true,
    ai_monthly_budget_tokens: 0,
    updated_at: new Date().toISOString(),
  }

  return {
    profile,
    settings,
    currentWeek: {
      id: `week-${week.week_number}`,
      week_number: week.week_number,
      title_ru: week.title_ru,
      summary_ru: week.summary_ru,
      is_unlocked: true,
      module_title_ru: mod.title_ru,
    },
    overallProgressPct: progressPercent(profile.id, profile.participant_slot),
    skillProgress: skills,
    tasksToday,
    tasksOverdue: overdue,
    nextJoint: {
      title: week.joint.title_ru,
      when: `неделя ${week.week_number}`,
      href: `/assignments/${week.joint.code}`,
    },
    recentMessages: (() => {
      const msgs = listMessages()
        .filter((m) => m.sender_id !== profile.id)
        .slice(-3)
        .reverse()
      if (msgs.length === 0) {
        const topics = listDiscussions().slice(0, 2)
        return topics.map((t) => ({
          id: t.id,
          title: t.title,
          meta: `Форум · ${authorName(t.author_id)}`,
          at: t.updated_at.slice(0, 10),
        }))
      }
      return msgs.map((m) => ({
        id: m.id,
        title: `Сообщение от ${authorName(m.sender_id)}`,
        meta: m.body_md.slice(0, 80),
        at: m.created_at.slice(0, 10),
      }))
    })(),

    recentResults: listSubmissions(profile.id)
      .filter((s) => s.status === 'submitted' || s.status === 'graded')
      .slice(-3)
      .reverse()
      .map((s) => ({
        id: s.id,
        title: `Сдано: ${s.assignment_code}`,
        meta: s.status,
        at: s.submitted_at?.slice(0, 10) ?? '—',
      })),
    weakSkills,
    recommendationsTomorrow: [
      {
        id: 'rec-overdue',
        title: overdue[0] ? `Закрыть ${overdue[0].title}` : 'Сдать текущее задание слота',
        reason: overdue[0] ? 'Правило: просроченные черновики первыми' : 'Правило: текущая unlocked неделя',
      },
      {
        id: 'rec-weak',
        title: `Практика: ${weakSkills[0]?.title_ru ?? 'навык'}`,
        reason: `Слабый навык (${weakSkills[0]?.score_ema ?? 0})`,
      },
      {
        id: 'rec-source',
        title: 'Обязательный источник текущей недели',
        reason: week.sources.find((s) => s.is_mandatory)?.source_id ?? 'источник',
      },
    ],
    calendarDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((label, i) => ({
      date: `2026-11-${17 + i}`,
      label,
      completed: i < 2 ? 1 : 0,
      total: 2,
    })),
    // Curriculum-backed; chat/calendar still partial
    isDemoData: false,
  }
}

/** Load dashboard from curriculum + local progress (demo) or Supabase when available. */
export async function loadDashboard(profile: Profile): Promise<DashboardData> {
  if (isDemoAuth || !supabase) {
    return buildFromCurriculum(profile)
  }

  try {
    const liveProfile = (await fetchProfile(profile.id)) ?? profile
    // Until remote seed is applied, still use curriculum pack for content
    return { ...buildFromCurriculum(liveProfile), profile: liveProfile }
  } catch (err) {
    console.warn('dashboard live load failed:', err)
    return buildFromCurriculum(profile)
  }
}
