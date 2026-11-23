import type { WeekDef } from '@/data/curriculum'
import { getInterview } from '@/data/interviews'
import { getSource } from '@/data/sources'

export type ClaimVerdict =
  | 'supported'
  | 'partial'
  | 'unsupported'
  | 'insufficient_data'
  | 'contradict'
  | 'retell_risk'

/** Compact RU status for UI: поддержка / противоречие / недостаточно */
export type ClaimStatusRu = 'поддержка' | 'противоречие' | 'недостаточно'

export function claimStatusRu(v: ClaimVerdict): ClaimStatusRu {
  if (v === 'supported' || v === 'partial') return 'поддержка'
  if (v === 'contradict') return 'противоречие'
  return 'недостаточно'
}

export interface MatchedSource {
  id: string
  title_ru: string
  url: string
  overlap: number
  matched_terms: string[]
}

export interface ClaimNote {
  excerpt: string
  verdict: ClaimVerdict
  note_ru: string
  related_source_ids: string[]
}

export interface SourceGroundingResult {
  week_number: number
  corpus_source_count: number
  live_pages_used: number
  cited_week_urls: string[]
  matched_sources: MatchedSource[]
  claims: ClaimNote[]
  answers_research_question: boolean
  retell_without_answer: boolean
  epistemic: {
    marks_evidence: boolean
    marks_hypothesis: boolean
    marks_insufficient: boolean
  }
  scores: {
    /** 0–40: overlap with trusted week sources / cited URLs */
    grounding: number
    /** 0–30: addresses research question (not pure retell) */
    answer: number
    /** 0–30: evidence / hypothesis / insufficient labels */
    epistemic: number
  }
  strengths_ru: string[]
  gaps_ru: string[]
  next_ru: string[]
  reply_md: string
  /** Honest capability statement — always show to the learner. */
  honesty_ru: string
}

const STOP = new Set([
  'и',
  'в',
  'во',
  'не',
  'на',
  'с',
  'со',
  'по',
  'к',
  'ко',
  'о',
  'об',
  'от',
  'для',
  'это',
  'как',
  'что',
  'а',
  'но',
  'или',
  'же',
  'бы',
  'ли',
  'из',
  'у',
  'за',
  'при',
  'до',
  'то',
  'так',
  'уже',
  'ещё',
  'еще',
  'его',
  'её',
  'ее',
  'их',
  'мы',
  'вы',
  'они',
  'он',
  'она',
  'оно',
  'the',
  'a',
  'an',
  'and',
  'or',
  'of',
  'to',
  'in',
  'on',
  'for',
  'is',
  'are',
  'be',
  'as',
  'with',
  'that',
  'this',
  'from',
  'by',
  'it',
  'you',
  'your',
  'our',
  'we',
])

const HONESTY_RU =
  'Локальный разбор (free tier, без платного API): выделяет тезисы и сверяет их с карточками источников недели (название, «зачем», «что извлечь», вопросы), методичкой и списком типичных ошибок. Статусы: поддержка / противоречие / недостаточно. Это не ChatGPT и не полная проверка «всех публичных фактов в интернете». Живые страницы часто недоступны из‑за CORS — тогда вердикт только по карточке. Платный LLM не вызывается.'

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^\p{L}\p{N}\s/-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(s: string): string[] {
  return normalize(s)
    .split(' ')
    .map((w) => w.trim())
    .filter((w) => w.length >= 4 && !STOP.has(w))
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

function sentenceSplit(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 24)
}

function extractUrls(text: string): string[] {
  const m = text.match(/https?:\/\/[^\s)\]>"']+/gi) ?? []
  return unique(m.map((u) => u.replace(/[.,;]+$/, '')))
}

type CorpusEntry = {
  id: string
  title_ru: string
  url: string
  terms: string[]
}

function buildWeekCorpus(
  week: WeekDef,
  pageSnippets?: Record<string, string>,
): {
  sources: CorpusEntry[]
  questionTerms: string[]
  theoryTerms: string[]
  errorTerms: { text: string; terms: string[] }[]
  live_pages_used: number
} {
  const sources: CorpusEntry[] = []
  let live_pages_used = 0

  for (const link of week.sources) {
    const s = getSource(link.source_id)
    if (!s) continue
    const live = pageSnippets?.[s.id] ?? pageSnippets?.[s.url] ?? ''
    if (live) live_pages_used += 1
    const blob = [
      s.title_ru,
      s.title_original,
      s.why_ru,
      s.understand_ru,
      s.parts_ru,
      ...s.questions_ru,
      ...s.tags,
      live,
    ].join(' ')
    sources.push({ id: s.id, title_ru: s.title_ru, url: s.url, terms: unique(tokens(blob)) })
  }

  for (const id of week.interview_ids) {
    const i = getInterview(id)
    if (!i) continue
    const live = pageSnippets?.[i.id] ?? pageSnippets?.[i.url] ?? ''
    if (live) live_pages_used += 1
    const blob = [
      i.title_ru,
      i.why_read_ru,
      i.extract_ru,
      i.practical_task_ru,
      ...i.analysis_questions_ru,
      ...i.topics,
      live,
    ].join(' ')
    sources.push({ id: i.id, title_ru: i.title_ru, url: i.url, terms: unique(tokens(blob)) })
  }

  return {
    sources,
    questionTerms: unique(
      tokens(
        `${week.research_question_ru} ${week.practical_task_ru} ${week.compare_prompt_ru} ${week.concepts.join(' ')} ${week.case_ru}`,
      ),
    ),
    theoryTerms: unique(tokens(week.theory_short_ru)),
    errorTerms: week.error_watchlist.map((e) => ({ text: e, terms: unique(tokens(e)) })),
    live_pages_used,
  }
}

function overlapTerms(a: string[], b: Set<string>): string[] {
  return a.filter((t) => b.has(t)).slice(0, 12)
}

function urlMatches(cited: string[], sourceUrl: string): boolean {
  const hostPath = sourceUrl.replace(/^https?:\/\//, '').toLowerCase()
  return cited.some((c) => {
    const n = c.replace(/^https?:\/\//, '').toLowerCase()
    return n.includes(hostPath.slice(0, 40)) || hostPath.includes(n.slice(0, 40))
  })
}

/**
 * Sync local grounding of a learner thesis against the week's trusted source cards.
 * No paid API. Pass optional pageSnippets from tryFetchSourceSnippet when CORS allows.
 */
export function analyzeAgainstWeekSources(
  text: string,
  week: WeekDef,
  pageSnippets?: Record<string, string>,
): SourceGroundingResult {
  const t = text.trim()
  const corpus = buildWeekCorpus(week, pageSnippets)
  const answerTokens = unique(tokens(t))
  const answerSet = new Set(answerTokens)
  const cited = extractUrls(t)
  const citedWeek = cited.filter((u) => corpus.sources.some((s) => urlMatches([u], s.url)))

  const matched_sources: MatchedSource[] = corpus.sources
    .map((s) => {
      const matched_terms = overlapTerms(s.terms, answerSet)
      const urlHit = urlMatches(cited, s.url) ? 8 : 0
      const overlap = Math.min(100, matched_terms.length * 6 + urlHit)
      return {
        id: s.id,
        title_ru: s.title_ru,
        url: s.url,
        overlap,
        matched_terms,
      }
    })
    .filter((m) => m.overlap >= 12 || m.matched_terms.length >= 2)
    .sort((a, b) => b.overlap - a.overlap)

  const qHits = corpus.questionTerms.filter((x) => answerSet.has(x)).length
  const theoryHits = corpus.theoryTerms.filter((x) => answerSet.has(x)).length
  const answers_research_question =
    qHits >= Math.min(3, Math.max(1, Math.floor(corpus.questionTerms.length * 0.12))) ||
    /вывод|поэтому|значит|следовательно|итог|применя/i.test(t)

  const epistemic = {
    marks_evidence: /(факт|источник|данные|доказател|https?:\/\/|согласно|в отчёте|в материале)/i.test(t),
    marks_hypothesis: /(гипотеза|возможно|предполож|если предположить|кажется)/i.test(t),
    marks_insufficient:
      /(недостаточно|не хватает данных|неизвестно|мало данных|нет доказательств|нельзя утверждать)/i.test(t),
  }

  const sentences = sentenceSplit(t).slice(0, 12)
  const claims: ClaimNote[] = sentences.map((excerpt) => {
    const st = unique(tokens(excerpt))
    const stSet = new Set(st)
    const related = corpus.sources
      .map((s) => ({
        id: s.id,
        title_ru: s.title_ru,
        hits: overlapTerms(s.terms, stSet).length,
      }))
      .filter((x) => x.hits >= 2)
      .sort((a, b) => b.hits - a.hits)

    const best = related[0]
    const errorHit = corpus.errorTerms
      .map((e) => ({ text: e.text, hits: overlapTerms(e.terms, stSet).length }))
      .filter((x) => x.hits >= 2)
      .sort((a, b) => b.hits - a.hits)[0]

    const isEpistemicOnly =
      /(недостаточно|гипотеза|возможно|неизвестно)/i.test(excerpt) && related.length === 0
    const looksLikeRetell =
      related.length > 0 &&
      !/(вывод|поэтому|значит|применя|для нас|для сделки|для оффера)/i.test(excerpt) &&
      st.length < 14

    const rejectsErrorPattern =
      /а не\b|не с\b|не дела|избег|вместо питч|не питч|не начина|ошибк/i.test(excerpt)

    let verdict: ClaimVerdict
    let note_ru: string
    if (
      errorHit &&
      !rejectsErrorPattern &&
      errorHit.hits >= 2 &&
      errorHit.hits >= (best?.hits ?? 0) + (best ? 1 : 0)
    ) {
      verdict = 'contradict'
      note_ru = `Противоречие типичной ошибке недели: «${errorHit.text.slice(0, 90)}${errorHit.text.length > 90 ? '…' : ''}».`
    } else if (isEpistemicOnly) {
      verdict = 'insufficient_data'
      note_ru = 'Честно отмечен пробел — хорошо; укажите, какой источник закрыл бы его.'
    } else if (!best) {
      verdict = epistemic.marks_insufficient ? 'insufficient_data' : 'unsupported'
      note_ru = epistemic.marks_insufficient
        ? 'Утверждение без опоры на источники недели — статус «недостаточно».'
        : 'Недостаточно опоры на источники недели. Добавьте цитату/URL или снизьте уверенность.'
    } else if (looksLikeRetell) {
      verdict = 'retell_risk'
      note_ru = `Похоже на пересказ «${best.title_ru}» без вывода к вопросу недели (недостаточно как ответ).`
    } else if (best.hits >= 4) {
      verdict = 'supported'
      note_ru = `Поддержка: согласуется с карточкой «${best.title_ru}» (${best.hits} пересечений).`
    } else {
      verdict = 'partial'
      note_ru = `Поддержка частичная — пересечение с источником недели; усильте ссылкой или цитатой.`
    }

    return {
      excerpt: excerpt.length > 160 ? `${excerpt.slice(0, 157)}…` : excerpt,
      verdict,
      note_ru,
      related_source_ids: related.slice(0, 2).map((r) => r.id),
    }
  })

  const supported = claims.filter((c) => c.verdict === 'supported' || c.verdict === 'partial').length
  const unsupported = claims.filter((c) => c.verdict === 'unsupported').length
  const contradict = claims.filter((c) => c.verdict === 'contradict').length
  const retell = claims.filter((c) => c.verdict === 'retell_risk').length
  const retell_without_answer = retell >= 2 && !answers_research_question

  const grounding = Math.max(
    0,
    Math.min(
      40,
      matched_sources.slice(0, 3).reduce((acc, m) => acc + Math.min(14, Math.round(m.overlap / 5)), 0) +
        citedWeek.length * 8 +
        Math.min(10, supported * 4) -
        contradict * 6,
    ),
  )

  const answer = retell_without_answer
    ? 6
    : Math.min(
        30,
        (answers_research_question ? 16 : 4) +
          Math.min(10, qHits * 2) +
          (unsupported > supported ? 0 : 6) -
          (retell > 0 ? 4 : 0),
      )

  const epistemicScore = Math.min(
    30,
    (epistemic.marks_evidence ? 10 : 0) +
      (epistemic.marks_hypothesis ? 8 : 0) +
      (epistemic.marks_insufficient ? 10 : 0) +
      (theoryHits > 0 && answers_research_question ? 2 : 0),
  )

  const strengths_ru = [
    matched_sources[0]
      ? `Есть опора на источник недели: «${matched_sources[0].title_ru}»`
      : '',
    citedWeek.length > 0 ? `Указан URL из списка недели (${citedWeek.length})` : '',
    answers_research_question ? 'Виден ответ на исследовательский вопрос, не только пересказ' : '',
    epistemic.marks_insufficient ? 'Есть честная пометка «недостаточно данных»' : '',
    epistemic.marks_hypothesis ? 'Гипотезы отделены от фактов' : '',
  ].filter(Boolean)

  const gaps_ru = [
    matched_sources.length === 0
      ? 'Нет явной сверки с доверенными источниками недели (термины/URL карточек)'
      : '',
    contradict > 0
      ? `${contradict} тезис(ов) противоречат типичным ошибкам / анти-паттернам недели`
      : '',
    unsupported > 0
      ? `${unsupported} фрагмент(ов) со статусом «недостаточно» — снизьте уверенность или добавьте доказательство`
      : '',
    retell_without_answer
      ? 'Риск пересказа материалов без ответа на вопрос недели'
      : '',
    !epistemic.marks_evidence ? 'Мало явных маркеров доказательства (факт / источник / URL)' : '',
    !epistemic.marks_insufficient && unsupported > 0
      ? 'Для спорных мест не сказано «недостаточно данных»'
      : '',
    ...week.error_watchlist.slice(0, 1),
  ].filter(Boolean)

  const next_ru = [
    'Привяжите каждый сильный тезис к источнику недели (название или URL)',
    'Явно ответьте на вопрос недели одним абзацем «вывод»',
    'Пометьте: доказательство / гипотеза / недостаточно данных',
    week.find_own_sources
      ? 'Добавьте ≥1 свой источник вне списка + почему ему можно доверять'
      : 'Сверьте вывод с compare-промптом недели',
  ]

  const matchLines =
    matched_sources.length > 0
      ? matched_sources
          .slice(0, 4)
          .map(
            (m) =>
              `- **${m.title_ru}** (пересечение ~${m.overlap}${
                m.matched_terms.length ? `; термины: ${m.matched_terms.slice(0, 5).join(', ')}` : ''
              })`,
          )
          .join('\n')
      : '- Пока нет уверенного пересечения с карточками источников недели.'

  const claimLines = claims
    .slice(0, 6)
    .map(
      (c) =>
        `- **${claimStatusRu(c.verdict)}** (${verdictLabel(c.verdict)}) — _${c.excerpt}_\n  ${c.note_ru}`,
    )
    .join('\n')

  const liveNote =
    corpus.live_pages_used > 0
      ? `Подтянуто живых страниц: ${corpus.live_pages_used} (доп. к карточкам).`
      : 'Живые страницы не подтянулись (часто CORS) — сверка только по карточкам источников недели.'

  const reply_md = [
    `### Сверка с источниками недели ${week.week_number}`,
    `Вопрос: ${week.research_question_ru}`,
    liveNote,
    '',
    '**Совпадения с доверенными карточками:**',
    matchLines,
    '',
    claimLines ? `**Разбор тезисов:**\n${claimLines}` : '',
    '',
    `**Запрет пересказа:** ${week.no_retell_ru}`,
    '',
    `_${HONESTY_RU}_`,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    week_number: week.week_number,
    corpus_source_count: corpus.sources.length,
    live_pages_used: corpus.live_pages_used,
    cited_week_urls: citedWeek,
    matched_sources,
    claims,
    answers_research_question,
    retell_without_answer,
    epistemic,
    scores: {
      grounding,
      answer: Math.max(0, answer),
      epistemic: epistemicScore,
    },
    strengths_ru,
    gaps_ru,
    next_ru,
    reply_md,
    honesty_ru: HONESTY_RU,
  }
}

function verdictLabel(v: ClaimVerdict): string {
  switch (v) {
    case 'supported':
      return 'опора на источник'
    case 'partial':
      return 'частично'
    case 'unsupported':
      return 'без опоры'
    case 'insufficient_data':
      return 'недостаточно данных'
    case 'contradict':
      return 'противоречие ошибке недели'
    case 'retell_risk':
      return 'риск пересказа'
  }
}

export function groundingOverall(g: SourceGroundingResult): number {
  return Math.min(100, g.scores.grounding + g.scores.answer + g.scores.epistemic)
}

/**
 * Optional best-effort fetch of a public source page for extra keywords.
 * Browser CORS often blocks this — callers must treat null as normal.
 */
export async function tryFetchSourceSnippet(
  url: string,
  maxChars = 4000,
): Promise<{ ok: true; text: string } | { ok: false; reason: string }> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 4500)
    const res = await fetch(url, {
      method: 'GET',
      signal: ctrl.signal,
      mode: 'cors',
      credentials: 'omit',
    })
    clearTimeout(timer)
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` }
    const raw = await res.text()
    const text = raw
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxChars)
    if (text.length < 80) return { ok: false, reason: 'empty_or_blocked_body' }
    return { ok: true, text }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'fetch_failed'
    return { ok: false, reason: msg.includes('abort') ? 'timeout' : 'cors_or_network' }
  }
}

/** Best-effort: fetch up to `limit` mandatory week source pages for richer local grounding. */
export async function fetchWeekSourceSnippets(
  week: WeekDef,
  limit = 3,
): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  const mandatory = week.sources.filter((s) => s.is_mandatory).slice(0, limit)
  await Promise.all(
    mandatory.map(async (link) => {
      const s = getSource(link.source_id)
      if (!s) return
      const hit = await tryFetchSourceSnippet(s.url)
      if (hit.ok) out[s.id] = hit.text
    }),
  )
  return out
}
