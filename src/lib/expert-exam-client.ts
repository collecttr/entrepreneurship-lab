import type { ExaminerResult, RubricScore } from '@/ai/examiners'
import type { TrainerSlug } from '@/lib/ai-config'
import { EXPERT_TRAINER_SLUGS, isExpertExamConfigured } from '@/lib/ai-config'
import { applyTrainerSkillBump } from '@/lib/progress-store'
import { recordUsage, monthlyExpertRequests } from '@/lib/ai-usage'
import { getWeek } from '@/data/curriculum'
import { getUnlockedWeek } from '@/lib/progress-store'

export type ExpertTrainerSlug = (typeof EXPERT_TRAINER_SLUGS)[number]

export interface ExpertWeekContext {
  week_number?: number
  title_ru?: string
  research_question_ru?: string
  concepts?: string[]
  case_ru?: string
  simulation_ru?: string
  sales_drill_ru?: string
  feedback_guide_ru?: string
  error_watchlist?: string[]
}

export interface ExpertExamRequest {
  userId: string
  trainerSlug: ExpertTrainerSlug | TrainerSlug
  learnerText: string
  weekNumber?: number
  extraFields?: Record<string, string>
  skills?: string[]
}

export interface ExpertExamError {
  ok: false
  error: string
  message_ru: string
}

export type ExpertExamOutcome =
  | { ok: true; result: ExaminerResult }
  | ExpertExamError

const CLIENT_MONTHLY_SOFT_CAP = 80

function weekPayload(weekNumber?: number): ExpertWeekContext {
  const week = getWeek(weekNumber ?? getUnlockedWeek()) ?? getWeek(1)
  if (!week) return {}
  return {
    week_number: week.week_number,
    title_ru: week.title_ru,
    research_question_ru: week.research_question_ru,
    concepts: week.concepts,
    case_ru: week.case_ru,
    simulation_ru: week.simulation_ru,
    sales_drill_ru: week.sales_drill_ru,
    feedback_guide_ru: week.feedback_guide_ru,
    error_watchlist: week.error_watchlist,
  }
}

function coerceResult(raw: Record<string, unknown>, fallbackTitle: string): ExaminerResult {
  const rubrics = (Array.isArray(raw.rubrics) ? raw.rubrics : []) as RubricScore[]
  return {
    mode: 'expert_llm',
    title: String(raw.title || fallbackTitle),
    overall: Math.max(0, Math.min(100, Number(raw.overall) || 0)),
    rubrics: rubrics.map((r, i) => ({
      id: String(r.id || `r${i}`),
      label: String(r.label || `Критерий ${i + 1}`),
      score: Number(r.score) || 0,
      max: Number(r.max) || 20,
      note: String(r.note || ''),
    })),
    strengths: (Array.isArray(raw.strengths) ? raw.strengths : []).map(String),
    gaps: (Array.isArray(raw.gaps) ? raw.gaps : []).map(String),
    next_actions: (Array.isArray(raw.next_actions) ? raw.next_actions : []).map(String),
    reply_md: String(raw.reply_md || ''),
    honesty_note_ru: String(
      raw.honesty_note_ru ||
        'Эксперт (LLM, free tier). Мнение ментора — не замена локальной сверке с источниками.',
    ),
    provider: raw.provider ? String(raw.provider) : undefined,
    model: raw.model ? String(raw.model) : undefined,
  }
}

const SKILL_BY_SLUG: Partial<Record<TrainerSlug | ExpertTrainerSlug, string[]>> = {
  'writing-evaluator': ['presentation', 'entrepreneurial'],
  socratic: ['entrepreneurial'],
  presentation: ['presentation', 'speaking'],
  'business-case': ['entrepreneurial', 'ops'],
  'week-report': ['presentation', 'entrepreneurial'],
}

/** Local empty/structure gate before spending a free-tier LLM call. */
export function localGateOk(text: string, min = 40): { ok: true } | { ok: false; message_ru: string } {
  const t = text.trim()
  if (t.length < min) {
    return {
      ok: false,
      message_ru: 'Сначала локальный гейт: текст слишком короткий для экспертной проверки.',
    }
  }
  if (/^(да|нет|ок|хорошо|согласен|верно)[.!]?$/i.test(t) || t.split(/\s+/).length < 8) {
    return {
      ok: false,
      message_ru: 'Сначала локальный гейт: слишком короткий/пустой ответ — раскройте мысль.',
    }
  }
  return { ok: true }
}

export async function requestExpertExam(input: ExpertExamRequest): Promise<ExpertExamOutcome> {
  if (!isExpertExamConfigured()) {
    return {
      ok: false,
      error: 'not_configured',
      message_ru:
        'Экспертная проверка не настроена. Нужны ключи на Vercel и VITE_AI_LIVE_CONFIGURED=true + VITE_AI_EXPERT_ENABLED=true.',
    }
  }

  const slug = input.trainerSlug
  if (!EXPERT_TRAINER_SLUGS.includes(slug as ExpertTrainerSlug)) {
    return {
      ok: false,
      error: 'bad_slug',
      message_ru: 'Эксперт доступен для оценки текста, сократики, презентации, кейса и отчёта недели.',
    }
  }

  const gate = localGateOk(input.learnerText)
  if (!gate.ok) return { ok: false, error: 'local_gate', message_ru: gate.message_ru }

  if (monthlyExpertRequests(input.userId) >= CLIENT_MONTHLY_SOFT_CAP) {
    return {
      ok: false,
      error: 'client_monthly_cap',
      message_ru: `Локальный месячный лимит (~${CLIENT_MONTHLY_SOFT_CAP} экспертных запросов) исчерпан. Остаётся локальная проверка.`,
    }
  }

  let res: Response
  try {
    res = await fetch('/api/expert-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: input.userId,
        trainer_slug: slug,
        learner_text: input.learnerText,
        week_context: weekPayload(input.weekNumber),
        extra_fields: input.extraFields ?? {},
      }),
    })
  } catch {
    return {
      ok: false,
      error: 'network',
      message_ru:
        'Не удалось вызвать /api/expert-exam (нужен деплой на Vercel). Локальная проверка доступна всегда.',
    }
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    return {
      ok: false,
      error: String(data.error || `http_${res.status}`),
      message_ru: String(
        data.message_ru || 'Экспертная проверка недоступна. Используйте локальную проверку.',
      ),
    }
  }

  const rawResult = (data.result || {}) as Record<string, unknown>
  const result = coerceResult(rawResult, `Эксперт · ${slug}`)
  const usage = (data.usage || {}) as Record<string, number>
  const usageSlug: TrainerSlug =
    slug === 'week-report' ? 'writing-evaluator' : (slug as TrainerSlug)

  recordUsage({
    user_id: input.userId,
    trainer_slug: usageSlug,
    tokens_in: Number(usage.tokens_in) || 0,
    tokens_out: Number(usage.tokens_out) || 0,
    cost_units: Number(usage.cost_units) || 1,
    mode: 'live_proxy',
  })

  const skills = input.skills ?? SKILL_BY_SLUG[slug] ?? ['entrepreneurial']
  applyTrainerSkillBump(input.userId, skills, result.overall)

  return { ok: true, result }
}
