import type {
  DashboardData,
  Profile,
  ProgramSettings,
  SkillProgressStub,
  WeekStub,
} from './types'

export const DEMO_USERS = [
  {
    email: 'learner.a@lab.local',
    password: 'demo-pass-a',
    profile: {
      id: 'demo-user-a',
      email: 'learner.a@lab.local',
      display_name: 'Анна Петрова',
      role: 'learner' as const,
      participant_slot: 'A' as const,
      avatar_path: null,
      timezone: 'Europe/Moscow',
      created_at: '2026-11-01T10:00:00Z',
      updated_at: '2026-11-01T10:00:00Z',
    },
  },
  {
    email: 'learner.b@lab.local',
    password: 'demo-pass-b',
    profile: {
      id: 'demo-user-b',
      email: 'learner.b@lab.local',
      display_name: 'Игорь Смирнов',
      role: 'admin' as const,
      participant_slot: 'B' as const,
      avatar_path: null,
      timezone: 'Europe/Moscow',
      created_at: '2026-11-01T10:00:00Z',
      updated_at: '2026-11-01T10:00:00Z',
    },
  },
] as const

export const DEMO_SETTINGS: ProgramSettings = {
  id: 1,
  current_unlocked_week: 1,
  program_start_date: '2026-11-17',
  hours_per_week_target: 240,
  ai_spend_lock: true,
  ai_monthly_budget_tokens: 0,
  updated_at: '2026-11-17T08:00:00Z',
}

export const DEMO_WEEK: WeekStub = {
  id: 'week-1',
  week_number: 1,
  title_ru: 'Старт: мышление продавца',
  summary_ru: 'Базовые модели продаж и карта покупателя. Демо-данные этапа 2.',
  is_unlocked: true,
  module_title_ru: 'Модуль 1 · Продажи и психология',
}

const DEMO_SKILLS: SkillProgressStub[] = [
  {
    skill_id: 'sales',
    title_ru: 'Продажи',
    category: 'sales',
    score_ema: 42,
    evidence_count: 1,
    last_updated: '2026-11-18',
  },
  {
    skill_id: 'negotiation',
    title_ru: 'Переговоры',
    category: 'negotiation',
    score_ema: 28,
    evidence_count: 0,
    last_updated: '2026-11-10',
  },
  {
    skill_id: 'presentation',
    title_ru: 'Презентации',
    category: 'presentation',
    score_ema: 35,
    evidence_count: 1,
    last_updated: '2026-11-19',
  },
  {
    skill_id: 'psychology',
    title_ru: 'Психология покупателя',
    category: 'psychology',
    score_ema: 31,
    evidence_count: 0,
    last_updated: '2026-11-12',
  },
  {
    skill_id: 'entrepreneurial',
    title_ru: 'Предпринимательское мышление',
    category: 'entrepreneurial',
    score_ema: 48,
    evidence_count: 1,
    last_updated: '2026-11-20',
  },
]

export function buildDemoDashboard(profile: Profile): DashboardData {
  const weakSkills = [...DEMO_SKILLS].sort((a, b) => a.score_ema - b.score_ema).slice(0, 3)

  return {
    profile,
    settings: DEMO_SETTINGS,
    currentWeek: DEMO_WEEK,
    overallProgressPct: 4,
    skillProgress: DEMO_SKILLS,
    tasksToday: [
      {
        id: 't1',
        title: 'Прочитать бриф недели 1 (слот ' + (profile.participant_slot ?? '—') + ')',
        due_label: 'сегодня',
        status: 'today',
        kind: 'задание',
      },
      {
        id: 't2',
        title: 'Карточка источника: введение в продажи',
        due_label: 'сегодня · 45 мин',
        status: 'today',
        kind: 'источник',
      },
    ],
    tasksOverdue: [
      {
        id: 't0',
        title: 'Самопроверка: карта покупателя (черновик)',
        due_label: 'просрочено на 1 день',
        status: 'overdue',
        kind: 'задание',
      },
    ],
    nextJoint: {
      title: 'Совместное обсуждение недели 1',
      when: 'вторник, 19:00 (МСК)',
      href: '/forum',
    },
    recentMessages: [
      {
        id: 'm1',
        title: 'Сообщение от партнёра',
        meta: '«Готов обсудить карту покупателя»',
        at: 'вчера',
      },
    ],
    recentResults: [
      {
        id: 'r1',
        title: 'Черновик возвращён с комментариями',
        meta: 'W01 · статус returned',
        at: '2 дня назад',
      },
    ],
    weakSkills,
    recommendationsTomorrow: [
      {
        id: 'rec1',
        title: 'Закрыть просроченный черновик карты покупателя',
        reason: 'Правило: просрочки первыми',
      },
      {
        id: 'rec2',
        title: 'Практика переговоров — короткий сценарий',
        reason: 'Слабый навык: Переговоры (28)',
      },
      {
        id: 'rec3',
        title: 'Источник недели 1 (обязательный)',
        reason: 'Следующий mandatory source',
      },
    ],
    calendarDays: [
      { date: '2026-11-17', label: 'Пн', completed: 1, total: 2 },
      { date: '2026-11-18', label: 'Вт', completed: 2, total: 2 },
      { date: '2026-11-19', label: 'Ср', completed: 0, total: 2 },
      { date: '2026-11-20', label: 'Чт', completed: 1, total: 3 },
      { date: '2026-11-21', label: 'Пт', completed: 0, total: 2 },
      { date: '2026-11-22', label: 'Сб', completed: 0, total: 1 },
      { date: '2026-11-23', label: 'Вс', completed: 0, total: 1 },
    ],
    isDemoData: true,
  }
}
