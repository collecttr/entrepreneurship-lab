/**
 * AI / examiner configuration.
 * Spend lock ON by default — blocks paid APIs.
 * Free-tier «Экспертная проверка» is a separate opt-in (server proxy + monthly caps).
 */

export type TrainerSlug =
  | 'sales'
  | 'negotiation'
  | 'presentation'
  | 'socratic'
  | 'business-case'
  | 'writing-evaluator'
  | 'voice-practice'
  | 'skill-map'
  | 'adaptive'

/** Trainers that can request free-tier expert (LLM) review after local gate. */
export const EXPERT_TRAINER_SLUGS = [
  'writing-evaluator',
  'socratic',
  'presentation',
  'business-case',
  'week-report',
] as const

export interface TrainerMeta {
  slug: TrainerSlug
  title_ru: string
  blurb_ru: string
  skills: string[]
  /** Show «Экспертная проверка» when free LLM proxy is configured. */
  supports_expert?: boolean
}

export const TRAINERS: TrainerMeta[] = [
  {
    slug: 'sales',
    title_ru: 'Диалог с клиентом · продажи',
    blurb_ru:
      'Главный режим: фраза за фразой с «клиентом» по типу покупателя. Есть и разбор вставленного текста.',
    skills: ['sales', 'psychology'],
  },
  {
    slug: 'negotiation',
    title_ru: 'Диалог · переговоры',
    blurb_ru:
      'Подготовка (цель, BATNA, интересы), затем диалог с контрагентом или заметки раунда — оценка процесса.',
    skills: ['negotiation'],
  },
  {
    slug: 'presentation',
    title_ru: 'Разбор презентации',
    blurb_ru:
      'Локально: проблема → тезисы vs источники → просьба. Опционально эксперт (LLM): мнение ментора по питчу. Харизму не оцениваем.',
    skills: ['presentation', 'speaking'],
    supports_expert: true,
  },
  {
    slug: 'socratic',
    title_ru: 'Сократический разбор',
    blurb_ru:
      'Локально: тезисы vs источники недели. Опционально эксперт (LLM): разбор идей ментором. Короткие «да/согласен» не проходят.',
    skills: ['entrepreneurial'],
    supports_expert: true,
  },
  {
    slug: 'business-case',
    title_ru: 'Разбор бизнес-кейса',
    blurb_ru:
      'Локально: диагноз → варианты → рекомендация + источники. Опционально эксперт (LLM): ментор по решению.',
    skills: ['entrepreneurial', 'ops'],
    supports_expert: true,
  },
  {
    slug: 'writing-evaluator',
    title_ru: 'Оценка текста',
    blurb_ru:
      'Локально: вопрос недели + тезисы vs источники. Опционально эксперт (LLM): мнение ментора по идеям. Перепись не делаем.',
    skills: ['presentation', 'entrepreneurial'],
    supports_expert: true,
  },
  {
    slug: 'voice-practice',
    title_ru: 'Практика речи',
    blurb_ru: 'Вставьте стенограмму устного ответа: структура и слова-паразиты. Тон голоса здесь не меряем.',
    skills: ['speaking'],
  },
  {
    slug: 'skill-map',
    title_ru: 'Пояснение карты навыков',
    blurb_ru: 'По вашим баллам — где слабые места и что потренировать дальше.',
    skills: ['entrepreneurial'],
  },
  {
    slug: 'adaptive',
    title_ru: 'Адаптивные упражнения',
    blurb_ru: 'Короткие задания по слабым навыкам (по желанию или вместо необязательной работы).',
    skills: ['entrepreneurial'],
  },
]

/** App-level spend lock. Default TRUE — paid provider calls blocked. */
export function isSpendLockOn(): boolean {
  const fromEnv = import.meta.env.VITE_AI_SPEND_LOCK
  if (fromEnv === 'false') {
    // Still require explicit unlock flag; env alone is not enough for live calls
    const unlocked = import.meta.env.VITE_AI_LIVE_UNLOCK === 'true'
    return !unlocked
  }
  return true
}

/**
 * Public UI flag only: Петр sets this after adding server keys on Vercel.
 * Keys themselves must NEVER be VITE_* (they live in /api/expert-exam).
 */
export function isLiveAiConfigured(): boolean {
  return import.meta.env.VITE_AI_LIVE_CONFIGURED === 'true'
}

/**
 * Free-tier expert exam opt-in (Gemini/Groq/OpenRouter via serverless proxy).
 * Independent of spend lock: spend lock still blocks paid paths; expert uses free models only.
 */
export function isExpertExamConfigured(): boolean {
  return (
    import.meta.env.VITE_AI_EXPERT_ENABLED === 'true' &&
    import.meta.env.VITE_AI_LIVE_CONFIGURED === 'true'
  )
}

export function trainerSupportsExpert(slug: TrainerSlug): boolean {
  return Boolean(TRAINERS.find((t) => t.slug === slug)?.supports_expert)
}

export type ExaminerMode =
  | 'local_examiner'
  | 'live_blocked'
  | 'live_available'
  | 'expert_available'

export function resolveExaminerMode(): ExaminerMode {
  if (isExpertExamConfigured()) return 'expert_available'
  if (isSpendLockOn()) {
    return isLiveAiConfigured() ? 'live_blocked' : 'local_examiner'
  }
  if (!isLiveAiConfigured()) return 'local_examiner'
  return 'live_available'
}

export function examinerBanner(): { tone: 'ok' | 'warn'; text: string } {
  const mode = resolveExaminerMode()
  if (mode === 'expert_available') {
    return {
      tone: 'ok',
      text: 'Два режима: «локально» (быстрый гейт / источники недели) и «эксперт (LLM)» — free-tier ментор через серверный proxy, с месячным лимитом.',
    }
  }
  if (mode === 'local_examiner') {
    return {
      tone: 'ok',
      text: 'Локальный разбор: тезисы vs источники недели. Эксперт (LLM) появится после ключей free-провайдеров на Vercel.',
    }
  }
  if (mode === 'live_blocked') {
    return {
      tone: 'ok',
      text: 'Spend lock: платный AI выключен. Локальная сверка работает; эксперт free-tier — включите VITE_AI_EXPERT_ENABLED.',
    }
  }
  return {
    tone: 'ok',
    text: 'Локальная сверка всегда доступна; облачный эксперт — только через Vercel proxy с free-ключами.',
  }
}
