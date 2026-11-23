/**
 * Smoke test for local claim status mapping.
 * Run: node scripts/test-claim-sources.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
let failed = 0
function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg)
    failed++
  } else console.log('OK:', msg)
}

const src = fs.readFileSync(path.join(root, 'src/ai/local-evidence.ts'), 'utf8')
assert(src.includes("'contradict'"), 'contradict verdict exists')
assert(src.includes('claimStatusRu'), 'claimStatusRu helper exists')
assert(src.includes('поддержка'), 'RU support label')
assert(src.includes('противоречие'), 'RU contradict label')
assert(src.includes('недостаточно'), 'RU insufficient label')
assert(src.includes('tryFetchSourceSnippet'), 'optional fetch helper')
assert(fs.existsSync(path.join(root, 'src/ai/examiners.ts')), 'examiners.ts present')

if (failed) {
  console.error(`\n${failed} assertion(s) failed`)
  process.exit(1)
}
console.log('\nlocal-evidence smoke OK')
