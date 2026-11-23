/**
 * Vercel Serverless proxy for free-tier expert exam (Gemini → Groq → OpenRouter).
 * Provider API keys stay server-side — never VITE_* / never in the browser.
 *
 * Env (server only):
 *   GEMINI_API_KEY
 *   GROQ_API_KEY
 *   OPENROUTER_API_KEY
 *   AI_EXPERT_ENABLED=true
 *   AI_MONTHLY_REQUEST_CAP=120
 *   AI_MONTHLY_TOKEN_BUDGET=400000
 *   AI_SPEND_LOCK=true          — refuses if set to force-block (optional hard kill)
 *   SUPABASE_URL               — optional metering
 *   SUPABASE_SERVICE_ROLE_KEY  — optional metering (never expose to client)
 */

const ALLOWED_SLUGS = new Set([
  'writing-evaluator',
  'socratic',
  'presentation',
  'business-case',
  'week-report',
])

const FREE_CHAIN = [
  {
    id: 'gemini',
    model: 'gemini-2.0-flash',
    keyEnv: 'GEMINI_API_KEY',
  },
  {
    id: 'groq',
    model: 'llama-3.3-70b-versatile',
    keyEnv: 'GROQ_API_KEY',
  },
  {
    id: 'openrouter',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    keyEnv: 'OPENROUTER_API_KEY',
  },
]

/** Best-effort counter for warm instances when Supabase metering is absent. */
const memoryHits = new Map()

function monthKey() {
  return new Date().toISOString().slice(0, 7)
}

function envInt(name, fallback) {
  const raw = process.env[name]
  if (raw == null || raw === '') return fallback
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body)
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function mentorSystemPrompt(slug) {
  const role =
    slug === 'presentation'
      ? 'ментор по презентациям и питчам'
      : slug === 'business-case'
        ? 'ментор по бизнес-кейсам и принятию решений'
        : slug === 'socratic'
          ? 'ментор по предпринимательскому мышлению (сократический стиль)'
          : 'ментор по продажам, переговорам и предпринимательству'

  return `Ты — опытный ${role} для двух учеников лаборатории предпринимательства.
Отвечай ТОЛЬКО на русском. Оценивай идеи, принципы и коммерческую логику ученика — не ограничивайся совпадением ключевых слов с источниками недели.
Будь честным: не соглашайся с пустыми или слабыми ответами. Не переписывай работу целиком — дай разбор и конкретные правки.
Верни СТРОГО один JSON-объект (без markdown-ограждений) со схемой:
{
  "overall": число 0-100,
  "rubrics": [{"id":"string","label":"string","score":number,"max":number,"note":"string"}],
  "strengths": ["string"],
  "gaps": ["string"],
  "next_actions": ["string"],
  "reply_md": "развёрнутый разбор markdown на русском"
}
Рубрики: 3–5 штук, max суммы около 100. overall согласован с рубриками.`
}

function buildUserPrompt(body) {
  const week = body.week_context || {}
  const parts = [
    `Тренажёр: ${body.trainer_slug}`,
    `Неделя: ${week.week_number ?? '?'} — ${week.title_ru ?? ''}`,
    week.research_question_ru ? `Исследовательский вопрос: ${week.research_question_ru}` : '',
    week.concepts?.length ? `Понятия недели: ${week.concepts.join(', ')}` : '',
    week.case_ru ? `Кейс: ${week.case_ru}` : '',
    week.simulation_ru ? `Сценарий: ${week.simulation_ru}` : '',
    week.sales_drill_ru ? `Практика продаж: ${week.sales_drill_ru}` : '',
    week.feedback_guide_ru ? `Гид обратной связи: ${week.feedback_guide_ru}` : '',
    week.error_watchlist?.length ? `Типичные ошибки: ${week.error_watchlist.join('; ')}` : '',
    '',
    'Работа ученика:',
    String(body.learner_text || '').slice(0, 12000),
  ]
  if (body.extra_fields && typeof body.extra_fields === 'object') {
    parts.push('', 'Доп. поля:')
    for (const [k, v] of Object.entries(body.extra_fields)) {
      if (v) parts.push(`${k}: ${String(v).slice(0, 2000)}`)
    }
  }
  return parts.filter(Boolean).join('\n')
}

function extractJson(text) {
  const trimmed = String(text || '').trim()
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const raw = fence ? fence[1].trim() : trimmed
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('no_json')
  return JSON.parse(raw.slice(start, end + 1))
}

function normalizeResult(parsed, provider, model) {
  const rubrics = Array.isArray(parsed.rubrics)
    ? parsed.rubrics.slice(0, 6).map((r, i) => ({
        id: String(r.id || `r${i + 1}`).slice(0, 40),
        label: String(r.label || `Критерий ${i + 1}`).slice(0, 120),
        score: Math.max(0, Math.min(Number(r.max) || 20, Number(r.score) || 0)),
        max: Math.max(1, Math.min(100, Number(r.max) || 20)),
        note: String(r.note || '').slice(0, 240),
      }))
    : []
  const overallRaw = Number(parsed.overall)
  const fromRubrics = rubrics.length
    ? Math.round(
        (rubrics.reduce((s, r) => s + r.score, 0) / Math.max(1, rubrics.reduce((s, r) => s + r.max, 0))) *
          100,
      )
    : 50
  const overall = Number.isFinite(overallRaw)
    ? Math.max(0, Math.min(100, Math.round(overallRaw)))
    : fromRubrics

  return {
    mode: 'expert_llm',
    title: String(parsed.title || 'Экспертная проверка').slice(0, 160),
    overall,
    rubrics:
      rubrics.length > 0
        ? rubrics
        : [
            {
              id: 'expert',
              label: 'Экспертная оценка',
              score: overall,
              max: 100,
              note: 'Сводка ментора',
            },
          ],
    strengths: (Array.isArray(parsed.strengths) ? parsed.strengths : [])
      .map((s) => String(s).slice(0, 240))
      .filter(Boolean)
      .slice(0, 8),
    gaps: (Array.isArray(parsed.gaps) ? parsed.gaps : [])
      .map((s) => String(s).slice(0, 240))
      .filter(Boolean)
      .slice(0, 8),
    next_actions: (Array.isArray(parsed.next_actions) ? parsed.next_actions : [])
      .map((s) => String(s).slice(0, 240))
      .filter(Boolean)
      .slice(0, 8),
    reply_md: String(parsed.reply_md || '').slice(0, 8000) || 'Разбор получен без текста — повторите запрос.',
    provider,
    model,
    honesty_note_ru: `Эксперт (LLM, free tier · ${provider}/${model}). Это мнение ментора, не замена локальной сверке с источниками недели и не платный ChatGPT API.`,
  }
}

async function callGemini(apiKey, model, system, user) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 2048, responseMimeType: 'application/json' },
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText
    throw new Error(`gemini_${res.status}:${msg}`)
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
  const usage = data?.usageMetadata || {}
  return {
    text,
    tokens_in: Number(usage.promptTokenCount) || 0,
    tokens_out: Number(usage.candidatesTokenCount) || 0,
  }
}

async function callGroq(apiKey, model, system, user) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText
    throw new Error(`groq_${res.status}:${msg}`)
  }
  return {
    text: data?.choices?.[0]?.message?.content || '',
    tokens_in: Number(data?.usage?.prompt_tokens) || 0,
    tokens_out: Number(data?.usage?.completion_tokens) || 0,
  }
}

async function callOpenRouter(apiKey, model, system, user) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://entrepreneurship-lab.vercel.app',
      'X-Title': 'Entrepreneurship Lab Expert Exam',
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText
    throw new Error(`openrouter_${res.status}:${msg}`)
  }
  return {
    text: data?.choices?.[0]?.message?.content || '',
    tokens_in: Number(data?.usage?.prompt_tokens) || 0,
    tokens_out: Number(data?.usage?.completion_tokens) || 0,
  }
}

async function callProvider(provider, system, user) {
  const key = process.env[provider.keyEnv]
  if (!key) throw new Error(`${provider.id}_no_key`)
  if (provider.id === 'gemini') return callGemini(key, provider.model, system, user)
  if (provider.id === 'groq') return callGroq(key, provider.model, system, user)
  return callOpenRouter(key, provider.model, system, user)
}

async function countMonthUsageSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  const monthStart = `${monthKey()}-01T00:00:00.000Z`
  const q = new URL(`${url.replace(/\/$/, '')}/rest/v1/ai_usage`)
  q.searchParams.set('select', 'id,tokens_in,tokens_out,cost_units')
  q.searchParams.set('mode', 'eq.live_proxy')
  q.searchParams.set('created_at', `gte.${monthStart}`)
  const res = await fetch(q.toString(), {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'count=exact',
    },
  })
  if (!res.ok) return null
  const contentRange = res.headers.get('content-range')
  const countMatch = contentRange && contentRange.match(/\/(\d+)/)
  const rows = await res.json().catch(() => [])
  const tokens = Array.isArray(rows)
    ? rows.reduce((s, r) => s + (Number(r.tokens_in) || 0) + (Number(r.tokens_out) || 0), 0)
    : 0
  return {
    requests: countMatch ? Number(countMatch[1]) : Array.isArray(rows) ? rows.length : 0,
    tokens,
  }
}

async function insertUsageSupabase(row) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || !row.user_id) return
  await fetch(`${url.replace(/\/$/, '')}/rest/v1/ai_usage`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      user_id: row.user_id,
      trainer_slug: row.trainer_slug,
      tokens_in: row.tokens_in,
      tokens_out: row.tokens_out,
      cost_units: row.cost_units,
      mode: 'live_proxy',
    }),
  }).catch(() => {})
}

function bumpMemory() {
  const k = monthKey()
  const n = (memoryHits.get(k) || 0) + 1
  memoryHits.set(k, n)
  return n
}

function memoryCount() {
  return memoryHits.get(monthKey()) || 0
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed', message_ru: 'Только POST.' })
    return
  }

  // Optional hard kill-switch (separate from free-tier expert enable)
  if (process.env.AI_SPEND_LOCK === 'force') {
    res.status(403).json({
      error: 'spend_lock',
      message_ru: 'Экспертная проверка отключена (AI_SPEND_LOCK=force).',
    })
    return
  }

  if (process.env.AI_EXPERT_ENABLED !== 'true') {
    res.status(503).json({
      error: 'expert_disabled',
      message_ru:
        'Экспертная проверка выключена. На Vercel задайте AI_EXPERT_ENABLED=true и хотя бы один free-ключ.',
    })
    return
  }

  const available = FREE_CHAIN.filter((p) => Boolean(process.env[p.keyEnv]))
  if (available.length === 0) {
    res.status(503).json({
      error: 'no_provider_keys',
      message_ru:
        'Нет ключей free-провайдеров. Добавьте GEMINI_API_KEY и/или GROQ_API_KEY и/или OPENROUTER_API_KEY.',
    })
    return
  }

  let body
  try {
    body = await readBody(req)
  } catch {
    res.status(400).json({ error: 'bad_json', message_ru: 'Некорректный JSON.' })
    return
  }

  const slug = String(body.trainer_slug || '')
  if (!ALLOWED_SLUGS.has(slug)) {
    res.status(400).json({
      error: 'bad_slug',
      message_ru: 'Эксперт доступен для writing / socratic / presentation / business-case / week-report.',
    })
    return
  }

  const learnerText = String(body.learner_text || '').trim()
  if (learnerText.length < 40) {
    res.status(400).json({
      error: 'too_short',
      message_ru: 'Слишком короткий текст для экспертной проверки — сначала локальный гейт.',
    })
    return
  }

  const requestCap = envInt('AI_MONTHLY_REQUEST_CAP', 120)
  const tokenBudget = envInt('AI_MONTHLY_TOKEN_BUDGET', 400000)
  const usage = await countMonthUsageSupabase()
  const requestsUsed = usage ? usage.requests : memoryCount()
  const tokensUsed = usage ? usage.tokens : 0

  if (requestsUsed >= requestCap) {
    res.status(429).json({
      error: 'monthly_request_cap',
      message_ru: `Месячный лимит запросов (${requestCap}) исчерпан. Остаётся локальная проверка.`,
      requests_used: requestsUsed,
      request_cap: requestCap,
    })
    return
  }
  if (tokensUsed >= tokenBudget) {
    res.status(429).json({
      error: 'monthly_token_budget',
      message_ru: `Месячный бюджет токенов (${tokenBudget}) исчерпан. Остаётся локальная проверка.`,
      tokens_used: tokensUsed,
      token_budget: tokenBudget,
    })
    return
  }

  const system = mentorSystemPrompt(slug)
  const user = buildUserPrompt(body)
  const errors = []

  for (const provider of available) {
    try {
      const raw = await callProvider(provider, system, user)
      const parsed = extractJson(raw.text)
      const result = normalizeResult(parsed, provider.id, provider.model)
      result.title =
        slug === 'week-report'
          ? `Эксперт · отчёт недели ${body.week_context?.week_number ?? ''}`
          : `Эксперт · ${slug} · неделя ${body.week_context?.week_number ?? ''}`

      const costUnits = Math.max(1, Math.round((raw.tokens_in + raw.tokens_out) / 1000))
      bumpMemory()
      await insertUsageSupabase({
        user_id: body.user_id || null,
        trainer_slug: slug === 'week-report' ? 'writing-evaluator' : slug,
        tokens_in: raw.tokens_in,
        tokens_out: raw.tokens_out,
        cost_units: costUnits,
      })

      res.status(200).json({
        ok: true,
        result,
        usage: {
          tokens_in: raw.tokens_in,
          tokens_out: raw.tokens_out,
          cost_units: costUnits,
          provider: provider.id,
          model: provider.model,
          requests_used: requestsUsed + 1,
          request_cap: requestCap,
        },
      })
      return
    } catch (err) {
      errors.push(String(err?.message || err))
    }
  }

  res.status(502).json({
    error: 'all_providers_failed',
    message_ru:
      'Все free-провайдеры недоступны (квота/сеть). Используйте локальную проверку и повторите позже.',
    details: errors.slice(0, 5),
  })
}
