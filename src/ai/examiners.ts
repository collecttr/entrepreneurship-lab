import { getWeek, type WeekDef } from '@/data/curriculum'
import { getUnlockedWeek, getSkillProgress, applyTrainerSkillBump } from '@/lib/progress-store'
import { SKILLS } from '@/data/skills'
import { listDocumentGroups, latestVersion } from '@/lib/document-store'
import type { TrainerSlug } from '@/lib/ai-config'
import { recordUsage } from '@/lib/ai-usage'
import {
  analyzeAgainstWeekSources,
  claimStatusRu,
  groundingOverall,
  type ClaimNote,
  type SourceGroundingResult,
} from '@/ai/local-evidence'

export interface RubricScore {
  id: string
  label: string
  score: number
  max: number
  note: string
}

export interface ExaminerClaimRow {
  excerpt: string
  status_ru: 'поддержка' | 'противоречие' | 'недостаточно'
  note_ru: string
}

export interface ExaminerResult {
  mode: 'local_examiner'
  title: string
  overall: number
  rubrics: RubricScore[]
  strengths: string[]
  gaps: string[]
  next_actions: string[]
  reply_md: string
  refused_weak_agreement?: boolean
  claim_rows?: ExaminerClaimRow[]
  honesty_note_ru?: string
}

function claimRowsFrom(g: SourceGroundingResult): ExaminerClaimRow[] {
  return g.claims.slice(0, 8).map((c: ClaimNote) => ({
    excerpt: c.excerpt,
    status_ru: claimStatusRu(c.verdict),
    note_ru: c.note_ru,
  }))
}

function withGrounding(
  result: Omit<ExaminerResult, 'mode'>,
  g: SourceGroundingResult,
): Omit<ExaminerResult, 'mode'> {
  return {
    ...result,
    claim_rows: claimRowsFrom(g),
    honesty_note_ru: g.honesty_ru,
  }
}

function weekContext(weekNumber?: number): WeekDef {
  const n = weekNumber ?? getUnlockedWeek()
  return getWeek(n) ?? getWeek(1)!
}

function scoreText(text: string, needles: string[], weight: number): number {
  const t = text.toLowerCase()
  const hits = needles.filter((n) => t.includes(n.toLowerCase())).length
  if (needles.length === 0) return 0
  return Math.round((hits / needles.length) * weight)
}

function lengthBonus(text: string, min = 80, good = 220): number {
  const n = text.trim().length
  if (n < 40) return 5
  if (n < min) return 15
  if (n < good) return 25
  return 30
}

function finish(
  userId: string,
  slug: TrainerSlug,
  skills: string[],
  result: Omit<ExaminerResult, 'mode'>,
): ExaminerResult {
  applyTrainerSkillBump(userId, skills, result.overall)
  recordUsage({
    user_id: userId,
    trainer_slug: slug,
    tokens_in: 0,
    tokens_out: 0,
    cost_units: 0,
    mode: 'local_examiner',
  })
  return { mode: 'local_examiner', ...result }
}

/** Sales simulator debrief */
export function examineSales(
  userId: string,
  input: { clientType: string; transcript: string; weekNumber?: number },
): ExaminerResult {
  const week = weekContext(input.weekNumber)
  const t = input.transcript
  const diagnosis = scoreText(t, ['боль', 'проблем', 'сейчас', 'как решаете', 'кто'], 25)
  const nextStep = scoreText(t, ['следующ', 'встреч', 'пилот', 'давайте', 'когда', 'cta'], 25)
  const noPitchFirst = t.toLowerCase().includes('наш продукт') && !t.toLowerCase().includes('?') ? 5 : 20
  const len = lengthBonus(t)
  const overall = Math.min(100, diagnosis + nextStep + noPitchFirst + Math.min(len, 20))

  return finish(userId, 'sales', ['sales', 'psychology'], {
    title: `Продажи · ${input.clientType} · неделя ${week.week_number}`,
    overall,
    rubrics: [
      { id: 'diag', label: 'Диагностика', score: diagnosis, max: 25, note: 'Вопросы о боли и контексте клиента' },
      {
        id: 'cta',
        label: 'Следующий шаг',
        score: nextStep,
        max: 25,
        note: 'Явная договорённость: встреча, дата или пилот (CTA)',
      },
      {
        id: 'discipline',
        label: 'Не начинать с презентации продукта',
        score: noPitchFirst,
        max: 20,
        note: week.sales_drill_ru.slice(0, 80),
      },
      { id: 'substance', label: 'Содержательность', score: Math.min(len, 20), max: 20, note: 'Длина и конкретика' },
    ],
    strengths: [
      diagnosis >= 15 ? 'Есть попытка диагностики' : '',
      nextStep >= 15 ? 'Есть намёк на следующий шаг' : '',
    ].filter(Boolean),
    gaps: [
      diagnosis < 15 ? 'Мало вопросов о боли клиента' : '',
      nextStep < 15 ? 'Нет конкретного следующего шага (встреча / дата / пилот)' : '',
      ...week.error_watchlist.slice(0, 2),
    ].filter(Boolean),
    next_actions: [week.sales_drill_ru, `Сценарий недели: ${week.simulation_ru}`],
    reply_md: `Контекст недели: **${week.title_ru}**.\n\nСценарий: ${week.simulation_ru}\n\nПрактика продаж: ${week.sales_drill_ru}`,
  })
}

export function examineNegotiation(
  userId: string,
  input: {
    goal: string
    reservation: string
    batna: string
    interests: string
    concessions: string
    roundNotes: string
    weekNumber?: number
  },
): ExaminerResult {
  const week = weekContext(input.weekNumber)
  const prep =
    scoreText(input.goal, ['цель', 'хочу', 'нужно'], 10) +
    (input.batna.trim().length > 20 ? 20 : input.batna.trim().length > 5 ? 10 : 0) +
    (input.interests.trim().length > 20 ? 20 : 8) +
    (input.reservation.trim().length > 5 ? 15 : 5)
  const process =
    scoreText(input.roundNotes, ['интерес', 'пакет', 'обмен', 'если', 'то', 'вариант'], 25) +
    scoreText(input.concessions, ['взамен', 'обмен', 'если', 'при условии'], 15)
  const overall = Math.min(100, Math.round(prep * 0.55 + process * 0.55))

  return finish(userId, 'negotiation', ['negotiation'], {
    title: `Переговоры · процесс · неделя ${week.week_number}`,
    overall,
    rubrics: [
      {
        id: 'prep',
        label: 'Подготовка (запасной план и интересы)',
        score: Math.min(prep, 65),
        max: 65,
        note: 'Оцениваем ход подготовки, не только «кто выиграл»',
      },
      {
        id: 'process',
        label: 'Обмен вместо односторонней уступки',
        score: Math.min(process, 35),
        max: 35,
        note: 'Есть ли пакет «если…, то…»',
      },
    ],
    strengths: [input.batna.trim() ? 'Запасной план (BATNA) зафиксирован' : ''].filter(Boolean),
    gaps: [
      input.batna.trim().length < 10 ? 'Запасной план (BATNA) слишком слабый или пустой' : '',
      !input.roundNotes.toLowerCase().includes('обмен') &&
      !input.roundNotes.toLowerCase().includes('если')
        ? 'В раунде мало обмена — риск односторонних уступок'
        : '',
    ].filter(Boolean),
    next_actions: [
      'Допишите 2 варианта взаимной выгоды до следующего раунда',
      week.simulation_ru,
    ],
    reply_md: `Кейс недели: ${week.case_ru}`,
  })
}

export function examinePresentation(
  userId: string,
  input: { script: string; weekNumber?: number; pageSnippets?: Record<string, string> },
): ExaminerResult {
  const week = weekContext(input.weekNumber)
  const t = input.script
  const g = analyzeAgainstWeekSources(t, week, input.pageSnippets)
  const problem = Math.min(20, scoreText(t, ['проблема', 'боль', 'слушател', 'клиент'], 20))
  const proof = Math.min(25, Math.round(g.scores.grounding * 0.55) + Math.round(g.scores.epistemic * 0.15))
  const ask = Math.min(25, scoreText(t, ['ask', 'прошу', 'встреч', 'пилот', 'реши'], 25))
  const flow = Math.min(30, lengthBonus(t, 120, 400))
  const overall = Math.min(100, problem + proof + ask + flow)

  return finish(
    userId,
    'presentation',
    ['presentation', 'speaking'],
    withGrounding(
      {
        title: `Презентация · неделя ${week.week_number}`,
        overall,
        rubrics: [
          {
            id: 'problem',
            label: 'Проблема аудитории',
            score: problem,
            max: 20,
            note: 'Боль слушателя, не «мы компания»',
          },
          {
            id: 'proof',
            label: 'Тезисы vs источники недели',
            score: proof,
            max: 25,
            note: 'поддержка / противоречие / недостаточно',
          },
          {
            id: 'ask',
            label: 'Просьба о следующем шаге',
            score: ask,
            max: 25,
            note: 'Конкретный ask: встреча, пилот, решение',
          },
          { id: 'flow', label: 'Связность', score: flow, max: 30, note: '' },
        ],
        strengths: g.strengths_ru,
        gaps: [
          !/(ask|прошу|давайте|встреч|пилот)/i.test(t) ? 'Нет явной просьбы о следующем шаге' : '',
          /^мы\s/i.test(t.trim()) ? 'Начало с «мы…» — начните с проблемы слушателя' : '',
          ...g.gaps_ru,
        ].filter(Boolean),
        next_actions: [
          'Сократите до 5 минут',
          'Одна чёткая просьба в конце',
          ...g.next_ru.slice(0, 2),
        ],
        reply_md: `Сценарий недели: ${week.simulation_ru}\n\n${g.reply_md}`,
      },
      g,
    ),
  )
}

export function examineSocratic(
  userId: string,
  input: { answer: string; weekNumber?: number; pageSnippets?: Record<string, string> },
): ExaminerResult {
  const week = weekContext(input.weekNumber)
  const concept = week.concepts[0] ?? 'гипотеза'
  const t = input.answer.trim()
  const weak =
    t.length < 40 ||
    /^(да|нет|ок|хорошо|согласен|верно)[.!]?$/i.test(t) ||
    t.split(/\s+/).length < 8

  if (weak) {
    return finish(userId, 'socratic', ['entrepreneurial', ...week.assignment_a.skill_slugs.slice(0, 1)], {
      title: `Сократический разбор · неделя ${week.week_number}`,
      overall: 18,
      rubrics: [
        {
          id: 'depth',
          label: 'Глубина мысли',
          score: 8,
          max: 30,
          note: 'Слишком короткий или соглашательский ответ',
        },
        {
          id: 'grounding',
          label: 'Сверка с источниками недели',
          score: 4,
          max: 40,
          note: 'Нет материала для сверки',
        },
        {
          id: 'epistemic',
          label: 'Доказательство / гипотеза / пробелы',
          score: 4,
          max: 30,
          note: 'Нужны явные пометки',
        },
      ],
      strengths: [],
      gaps: ['Локальный экзаменатор не принимает пустой ответ — изложите мысль своими словами'],
      next_actions: [
        'Ответьте на вопрос недели с опорой на 1–2 источника из списка',
        'Пометьте: доказательство / гипотеза / недостаточно данных',
      ],
      reply_md: `Не принимаю ответ как достаточный.\n\nВопрос недели: ${week.research_question_ru}\nПонятие-ориентир: **${concept}**.\n\nСформулируйте свой вывод, привяжите к источнику недели и скажите, где **доказательство**, где **гипотеза**, где **недостаточно данных**.\n\n_${analyzeAgainstWeekSources('', week).honesty_ru}_`,
      refused_weak_agreement: true,
    })
  }

  const g = analyzeAgainstWeekSources(t, week, input.pageSnippets)
  const overall = groundingOverall(g)

  return finish(
    userId,
    'socratic',
    ['entrepreneurial', ...week.assignment_a.skill_slugs.slice(0, 1)],
    withGrounding(
      {
        title: `Сократический разбор · неделя ${week.week_number}`,
        overall,
        rubrics: [
          {
            id: 'grounding',
            label: 'Тезисы vs источники недели',
            score: g.scores.grounding,
            max: 40,
            note:
              g.matched_sources[0] != null
                ? `Ближе всего: ${g.matched_sources[0].title_ru}`
                : 'Пересечений с карточками источников мало',
          },
          {
            id: 'answer',
            label: 'Ответ на вопрос (не пересказ)',
            score: g.scores.answer,
            max: 30,
            note: g.retell_without_answer
              ? 'Риск пересказа без вывода'
              : week.research_question_ru.slice(0, 100),
          },
          {
            id: 'epistemic',
            label: 'Доказательство / гипотеза / пробелы',
            score: g.scores.epistemic,
            max: 30,
            note: 'поддержка / противоречие / недостаточно',
          },
        ],
        strengths: g.strengths_ru,
        gaps: g.gaps_ru,
        next_actions: g.next_ru.slice(0, 3),
        reply_md: g.reply_md,
        refused_weak_agreement: false,
      },
      g,
    ),
  )
}

export function examineBusinessCase(
  userId: string,
  input: {
    diagnosis: string
    options: string
    recommendation: string
    weekNumber?: number
    pageSnippets?: Record<string, string>
  },
): ExaminerResult {
  const week = weekContext(input.weekNumber)
  const combined = [input.diagnosis, input.options, input.recommendation].join('\n\n')
  const g = analyzeAgainstWeekSources(combined, week, input.pageSnippets)
  const d = Math.min(30, lengthBonus(input.diagnosis, 60, 160) + (g.answers_research_question ? 4 : 0))
  const o =
    scoreText(input.options, ['вариант', '1', '2', 'или', 'либо'], 25) +
    lengthBonus(input.options, 40, 120)
  const rBase =
    scoreText(input.recommendation, ['рекоменд', 'выбира', 'потому', 'риск', 'метр'], 22) +
    lengthBonus(input.recommendation, 40, 100)
  const r = Math.min(35, rBase + Math.round(g.scores.grounding * 0.25))
  const overall = Math.min(100, Math.round((Math.min(d, 30) + Math.min(o, 35) + r) / 1.15))

  return finish(
    userId,
    'business-case',
    ['entrepreneurial', 'ops'],
    withGrounding(
      {
        title: `Кейс · неделя ${week.week_number}`,
        overall,
        rubrics: [
          {
            id: 'diag',
            label: 'Диагноз',
            score: Math.min(d, 30),
            max: 30,
            note: week.case_ru.slice(0, 100),
          },
          {
            id: 'opts',
            label: 'Варианты',
            score: Math.min(o, 35),
            max: 35,
            note: '≥2 осмысленных варианта',
          },
          {
            id: 'rec',
            label: 'Рекомендация + опора на источники',
            score: r,
            max: 35,
            note: 'Выбор с «почему» и сверка тезисов с неделей',
          },
        ],
        strengths: g.strengths_ru,
        gaps: [
          o < 20 ? 'Мало альтернатив' : '',
          r < 20 ? 'Рекомендация без «почему» / слабая опора на источники' : '',
          ...g.gaps_ru,
        ].filter(Boolean),
        next_actions: [
          'Добавьте метрику проверки за 7 дней',
          ...g.next_ru.slice(0, 2),
          week.sales_drill_ru,
        ],
        reply_md: `Кейс: ${week.case_ru}\n\n${g.reply_md}`,
      },
      g,
    ),
  )
}

export function examineWriting(
  userId: string,
  input: {
    text: string
    documentGroupId?: string
    weekNumber?: number
    pageSnippets?: Record<string, string>
  },
): ExaminerResult {
  const week = weekContext(input.weekNumber)
  const t = input.text
  let versionNote = ''
  if (input.documentGroupId) {
    const doc = listDocumentGroups().find((x) => x.id === input.documentGroupId)
    const latest = doc ? latestVersion(doc.id) : undefined
    versionNote = latest ? `Документ «${doc!.title}» v${latest.version}.` : ''
  }

  const g = analyzeAgainstWeekSources(t, week, input.pageSnippets)
  const structure = scoreText(t, ['1)', '2)', 'вывод', 'итог', 'рекоменд', 'тезис'], 15)
  const clarity = t.includes('  ') || t.split('.').some((s) => s.length > 220) ? 5 : 10
  const overall = Math.min(100, groundingOverall(g) - 5 + Math.round(structure / 3) + clarity)

  return finish(
    userId,
    'writing-evaluator',
    ['presentation', 'entrepreneurial'],
    withGrounding(
      {
        title: `Оценка текста · неделя ${week.week_number}`,
        overall,
        rubrics: [
          {
            id: 'grounding',
            label: 'Тезисы vs источники недели',
            score: g.scores.grounding,
            max: 40,
            note:
              g.matched_sources[0] != null
                ? `Опора: ${g.matched_sources[0].title_ru}`
                : 'Мало пересечений с доверенными карточками',
          },
          {
            id: 'answer',
            label: 'Ответ на вопрос недели',
            score: g.scores.answer,
            max: 30,
            note: g.retell_without_answer
              ? 'Похоже на пересказ без вывода'
              : 'Ищем прямой вывод, не биографию',
          },
          {
            id: 'epistemic',
            label: 'Факты vs гипотезы vs пробелы',
            score: g.scores.epistemic,
            max: 30,
            note: week.feedback_guide_ru.slice(0, 120),
          },
        ],
        strengths: [
          ...g.strengths_ru,
          ...(structure >= 10 ? ['Видна структура (пункты/вывод)'] : []),
        ],
        gaps: [...g.gaps_ru, 'Полную перепись текста не делаем — правьте сами по замечаниям'],
        next_actions: g.next_ru,
        reply_md: [versionNote, g.reply_md, '', week.no_retell_ru].filter(Boolean).join('\n\n'),
      },
      g,
    ),
  )
}

const FILLERS = ['типа', 'как бы', 'короче', 'это самое', 'нуу', 'эээ', 'ммм', 'в общем-то']

export function examineVoice(
  userId: string,
  input: { transcript: string },
): ExaminerResult {
  const t = input.transcript.toLowerCase()
  const words = t.split(/\s+/).filter(Boolean)
  const fillerHits = FILLERS.filter((f) => t.includes(f))
  const fillerPenalty = Math.min(30, fillerHits.length * 8)
  const structure =
    scoreText(t, ['сначала', 'далее', 'итог', 'прошу', 'вывод', 'первый', 'второй'], 35) +
    lengthBonus(input.transcript, 80, 250)
  const overall = Math.max(10, Math.min(100, structure + 40 - fillerPenalty))

  return finish(userId, 'voice-practice', ['speaking'], {
    title: 'Практика речи (транскрипт)',
    overall,
    rubrics: [
      { id: 'structure', label: 'Структура устной речи', score: Math.min(structure, 50), max: 50, note: '' },
      {
        id: 'fillers',
        label: 'Слова-паразиты',
        score: Math.max(0, 40 - fillerPenalty),
        max: 40,
        note: fillerHits.length ? `Найдено: ${fillerHits.join(', ')}` : 'Явных паразитов из списка не найдено',
      },
      { id: 'length', label: 'Объём', score: Math.min(10, words.length > 40 ? 10 : 4), max: 10, note: `${words.length} слов` },
    ],
    strengths: [],
    gaps: [
      'Высоту тона и темп речи здесь не оцениваем — только текст стенограммы',
      fillerHits.length ? 'Сократите слова-паразиты на следующем прогоне' : '',
    ].filter(Boolean),
    next_actions: ['Запишите снова и вставьте стенограмму', 'Пауза 1 сек вместо «эээ»'],
    reply_md: 'Разбор только по тексту стенограммы: структура и слова-паразиты.',
  })
}

export function examineSkillMap(userId: string): ExaminerResult {
  const progress = getSkillProgress(userId)
  const ranked = [...progress].sort((a, b) => a.score_ema - b.score_ema)
  const weak = ranked.slice(0, 3)
  const strong = ranked.slice(-2).reverse()
  const overall = Math.round(progress.reduce((s, p) => s + p.score_ema, 0) / Math.max(1, progress.length))

  return finish(userId, 'skill-map', ['entrepreneurial'], {
    title: 'Карта навыков — пояснение',
    overall,
    rubrics: weak.map((w) => {
      const meta = SKILLS.find((s) => s.id === w.skill_id)
      return {
        id: w.skill_id,
        label: meta?.title_ru ?? w.skill_id,
        score: w.score_ema,
        max: 100,
        note: `доказательств: ${w.evidence_count}`,
      }
    }),
    strengths: strong.map((s) => {
      const meta = SKILLS.find((x) => x.id === s.skill_id)
      return `${meta?.title_ru ?? s.skill_id}: ${s.score_ema}`
    }),
    gaps: weak.map((s) => {
      const meta = SKILLS.find((x) => x.id === s.skill_id)
      return `${meta?.title_ru ?? s.skill_id} — слабое место`
    }),
    next_actions: [
      'Запустите симулятор по самому слабому навыку',
      'Откройте адаптивные упражнения',
    ],
    reply_md:
      'Пояснение по скользящей оценке навыков (среднее с учётом недавних сдач). Платный AI не используется.',
  })
}

export function buildAdaptiveExercises(userId: string): {
  optional: boolean
  skill: string
  exercise: string
  replaces_optional_work: boolean
}[] {
  const progress = getSkillProgress(userId)
  const week = weekContext()
  const weak = [...progress].sort((a, b) => a.score_ema - b.score_ema).slice(0, 3)
  return weak.map((w, i) => {
    const meta = SKILLS.find((s) => s.id === w.skill_id)
    const slug = meta?.slug ?? 'entrepreneurial'
    const exercises: Record<string, string> = {
      sales: `Сделайте 3 касания с явной договорённостью о следующем шаге. Практика: ${week.sales_drill_ru}`,
      negotiation: `Запишите запасной план (BATNA) и 2 варианта обмена для кейса: ${week.case_ru.slice(0, 120)}`,
      presentation: `Сожмите выступление до 90 секунд: проблема → доказательства → просьба (неделя ${week.week_number})`,
      psychology: `Выпишите 3 заинтересованных лиц и их интересы по кейсу недели`,
      entrepreneurial: `Сформулируйте одну проверяемую гипотезу по: ${week.problem_ru.slice(0, 100)}`,
      marketing: `Одно сообщение для первого узкого сегмента + канал на 48 часов`,
      ops: `Нарисуйте 5 шагов от «да» клиента до первой пользы`,
      speaking: `Проговорите ответ на возражение 60 сек и вставьте стенограмму в «Практику речи»`,
    }
    return {
      optional: true,
      skill: meta?.title_ru ?? slug,
      exercise: exercises[slug] ?? exercises.entrepreneurial,
      replaces_optional_work: i === 0,
    }
  })
}

export function examineAdaptive(userId: string, input: { notes: string }): ExaminerResult {
  const items = buildAdaptiveExercises(userId)
  const done = input.notes.trim().length > 60
  const overall = done ? 62 : 28
  const weakSlug =
    SKILLS.find((s) => s.title_ru === items[0]?.skill)?.slug ?? 'entrepreneurial'

  return finish(userId, 'adaptive', [weakSlug], {
    title: 'Адаптивные упражнения',
    overall,
    rubrics: [
      {
        id: 'done',
        label: 'Выполнение короткого упражнения',
        score: done ? 60 : 20,
        max: 60,
        note: items[0]?.exercise.slice(0, 120) ?? '',
      },
      { id: 'focus', label: 'Фокус на слабом навыке', score: 40, max: 40, note: items[0]?.skill ?? '' },
    ],
    strengths: done ? ['Есть отчёт о выполнении'] : [],
    gaps: done ? [] : ['Опишите, что сделали (не лозунг)'],
    next_actions: items.map(
      (i) =>
        `${i.skill}: ${i.exercise}${i.replaces_optional_work ? ' (замена необязательной работы)' : ' (по желанию)'}`,
    ),
    reply_md: items
      .map(
        (i, idx) =>
          `${idx + 1}. **${i.skill}** ${i.replaces_optional_work ? '· замена необязательной работы' : '· по желанию'}\n${i.exercise}`,
      )
      .join('\n\n'),
  })
}
