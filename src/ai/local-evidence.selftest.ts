/**
 * Run: npx --yes vite-node src/ai/local-evidence.selftest.ts
 */
import { getWeek } from '@/data/curriculum'
import { analyzeAgainstWeekSources, claimStatusRu, fetchWeekSourceSnippets } from '@/ai/local-evidence'

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(msg)
}

const week = getWeek(1)
assert(week, 'week 1 exists')

const supported = `
Тезис: основатель должен начинать с диагностики боли ICP, а не с питча продукта.
По материалам YC Sales Playbook следующий конкретный шаг — календарная встреча или пилот.
Факт: без разговора с клиентом гипотеза о сегменте остаётся гипотезой; данных пока недостаточно.
Коммерческое применение: 5 исходящих касаний с явной просьбой о слоте в календаре.
`.trim()

const contradicting = `
Тезис: сразу делаем питч фич вместо диагностики — так быстрее закрываются сделки.
Список контактов из воображаемых компаний тоже нормален на старте.
`.trim()

const a1 = analyzeAgainstWeekSources(supported, week!)
assert(a1.claims.length >= 1, 'extracts claims')
assert(
  a1.claims.some((c) => claimStatusRu(c.verdict) === 'поддержка') ||
    a1.matched_sources.length > 0 ||
    a1.scores.grounding >= 12,
  'supported text gets support or grounding',
)
assert(
  !a1.claims.every((c) => c.verdict === 'contradict'),
  'good thesis must not be all-contradict',
)
assert(a1.honesty_ru.includes('платного') || a1.honesty_ru.includes('ChatGPT'), 'honesty limits')

const a2 = analyzeAgainstWeekSources(contradicting, week!)
assert(
  a2.claims.some((c) => c.verdict === 'contradict' || claimStatusRu(c.verdict) === 'противоречие'),
  'error-like thesis marked contradict',
)

const snippets = await fetchWeekSourceSnippets(week!, 2)
assert(typeof snippets === 'object', 'fetch returns object (may be empty on CORS)')

console.log(
  JSON.stringify(
    {
      support_claims: a1.claims.filter((c) => claimStatusRu(c.verdict) === 'поддержка').length,
      contradict_claims: a2.claims.filter((c) => c.verdict === 'contradict').length,
      live_pages: Object.keys(snippets).length,
      sample: a1.claims.slice(0, 2).map((c) => ({ status: claimStatusRu(c.verdict), excerpt: c.excerpt.slice(0, 70) })),
    },
    null,
    2,
  ),
)
console.log('local-evidence.selftest OK')
