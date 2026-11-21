/**
 * AI / examiner configuration.
 * Spend lock ON by default — no paid provider calls from the client.
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

export interface TrainerMeta {
  slug: TrainerSlug
  title_ru: string
  blurb_ru: string
  skills: string[]
}

export const TRAINERS: TrainerMeta[] = [
  {
    slug: 'sales',
    title_ru: 'Симулятор продаж',
    blurb_ru: 'Сценарии и типы клиентов; разбор по рубрике после раунда.',
    skills: ['sales', 'psychology'],
  },
  {
    slug: 'negotiation',
    title_ru: 'Симулятор переговоров',
    blurb_ru: 'Сначала стратегия (цель, BATNA, интересы), затем раунд; оценка процесса.',
    skills: ['negotiation'],
  },
  {
    slug: 'presentation',
    title_ru: 'Экзаменатор презентаций',
    blurb_ru: 'Структура проблема→proof→ask; без оценки «харизмы».',
    skills: ['presentation', 'speaking'],
  },
  {
    slug: 'socratic',
    title_ru: 'Сократический экзаменатор',
    blurb_ru: 'Вопросы по понятиям текущей недели; не соглашается с пустыми ответами.',
    skills: ['entrepreneurial'],
  },
  {
    slug: 'business-case',
    title_ru: 'Симулятор бизнес-кейса',
    blurb_ru: 'Диагноз → варианты → рекомендация на кейсе недели.',
    skills: ['entrepreneurial', 'ops'],
  },
  {
    slug: 'writing-evaluator',
    title_ru: 'Оценка текста',
    blurb_ru: 'Структура/аргументы/ясность по документу; без полной переписи.',
    skills: ['presentation', 'entrepreneurial'],
  },
  {
    slug: 'voice-practice',
    title_ru: 'Практика речи',
    blurb_ru: 'Запись или транскрипт; анализ структуры и слов-паразитов — без фейкового pitch/tempo.',
    skills: ['speaking'],
  },
  {
    slug: 'skill-map',
    title_ru: 'Пояснение карты навыков',
    blurb_ru: 'Rule-based разбор gaps и что тренировать дальше.',
    skills: ['entrepreneurial'],
  },
  {
    slug: 'adaptive',
    title_ru: 'Адаптивные упражнения',
    blurb_ru: 'Короткие задания по слабым навыкам (optional / замена optional work).',
    skills: ['entrepreneurial'],
  },
]

/** App-level spend lock. Default TRUE — paid/live AI blocked. */
export function isSpendLockOn(): boolean {
  const fromEnv = import.meta.env.VITE_AI_SPEND_LOCK
  if (fromEnv === 'false') {
    // Still require explicit unlock flag; env alone is not enough for live calls
    const unlocked = import.meta.env.VITE_AI_LIVE_UNLOCK === 'true'
    return !unlocked
  }
  return true
}

/** Live provider configured? Key must never be in VITE_*; only a public "configured" flag for UI honesty. */
export function isLiveAiConfigured(): boolean {
  return import.meta.env.VITE_AI_LIVE_CONFIGURED === 'true'
}

export type ExaminerMode = 'local_examiner' | 'live_blocked' | 'live_available'

export function resolveExaminerMode(): ExaminerMode {
  if (isSpendLockOn()) {
    return isLiveAiConfigured() ? 'live_blocked' : 'local_examiner'
  }
  if (!isLiveAiConfigured()) return 'local_examiner'
  return 'live_available'
}

export function examinerBanner(): { tone: 'ok' | 'warn'; text: string } {
  const mode = resolveExaminerMode()
  if (mode === 'local_examiner') {
    return {
      tone: 'ok',
      text: 'Локальный экзаменатор (rule-based). Live AI не вызывается. Spend lock = ON.',
    }
  }
  if (mode === 'live_blocked') {
    return {
      tone: 'warn',
      text: 'Режим без платного AI: spend lock включён. Провайдер помечен как настроенный, но вызовы заблокированы. Работает локальный экзаменатор.',
    }
  }
  return {
    tone: 'warn',
    text: 'Live AI theoretically unlocked — в этом MVP клиент всё равно использует локальный экзаменатор; proxy Functions появятся при деплое секретов.',
  }
}
