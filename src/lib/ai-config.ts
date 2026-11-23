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
    blurb_ru: 'Скрипт целиком: проблема → доказательства → просьба о следующем шаге. Харизму не оцениваем.',
    skills: ['presentation', 'speaking'],
  },
  {
    slug: 'socratic',
    title_ru: 'Сократический разбор',
    blurb_ru:
      'Локальная сверка вашей мысли с источниками недели (не ChatGPT). Короткие «да/согласен» не проходят.',
    skills: ['entrepreneurial'],
  },
  {
    slug: 'business-case',
    title_ru: 'Разбор бизнес-кейса',
    blurb_ru: 'Диагноз → варианты → рекомендация на кейсе текущей недели.',
    skills: ['entrepreneurial', 'ops'],
  },
  {
    slug: 'writing-evaluator',
    title_ru: 'Оценка текста',
    blurb_ru:
      'Локально: ответ на вопрос недели + сверка тезисов с доверенными источниками. Перепись текста не делаем.',
    skills: ['presentation', 'entrepreneurial'],
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
      text: 'Локальный разбор на устройстве: сверка с источниками недели. Это не ChatGPT и не платный API.',
    }
  }
  if (mode === 'live_blocked') {
    return {
      tone: 'ok',
      text: 'Spend lock: только локальная сверка с источниками недели (облачный LLM выключен).',
    }
  }
  return {
    tone: 'ok',
    text: 'Локальная сверка доступна всегда; облачный LLM — только при явном ключе и снятом lock.',
  }
}
