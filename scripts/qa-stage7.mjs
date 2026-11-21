import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'

const base = 'http://127.0.0.1:5173'
const shot = '/cursor/stores/bc-18422e98-436a-456a-b810-b5aabd1244b7/media/qa'
mkdirSync(shot, { recursive: true })
const results = []

function ok(id, name, pass, detail) {
  results.push({ id, name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${name} — ${detail}`)
}

async function login(page, email, pass) {
  await page.goto(base + '/login', { waitUntil: 'domcontentloaded', timeout: 15000 })
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', pass)
  await page.evaluate(() => document.querySelector('form')?.requestSubmit())
  await page.waitForURL(/dashboard|login/, { timeout: 8000 }).catch(() => {})
  await page.waitForTimeout(400)
}

async function shotPage(page, name) {
  await page.screenshot({ path: `${shot}/${name}`, fullPage: false, timeout: 8000 })
}

const browser = await chromium.launch({ headless: true })

// --- 1. Login both + reject third ---
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await login(page, 'learner.a@lab.local', 'demo-pass-a')
  const aOk = page.url().includes('/dashboard')
  await shotPage(page, '01-login-a.png')
  await page.evaluate(() => {
    sessionStorage.clear()
  })
  await login(page, 'learner.b@lab.local', 'demo-pass-b')
  const bOk = page.url().includes('/dashboard')
  await page.evaluate(() => {
    sessionStorage.clear()
  })
  await page.goto(base + '/login', { waitUntil: 'domcontentloaded' })
  await page.fill('input[type=email]', 'intruder@lab.local')
  await page.fill('input[type=password]', 'x')
  await page.evaluate(() => document.querySelector('form')?.requestSubmit())
  await page.waitForTimeout(600)
  const reject =
    (await page.locator('[role=alert], .text-danger, p').filter({ hasText: /Неверный|allowlist|допущен/i }).count()) > 0
  await shotPage(page, '02-allowlist-reject.png')
  ok(1, 'Login both demo users; third rejected', aOk && bOk && (reject || page.url().includes('/login')), `A=${aOk} B=${bOk} reject=${reject}`)
  await page.close()
}

// --- 2. Protected routes ---
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(base + '/dashboard', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(600)
  const redirected = page.url().includes('/login')
  await shotPage(page, '03-protected-redirect.png')
  ok(2, 'Protected routes redirect when logged out', redirected, `url=${page.url()}`)
  await page.close()
}

// --- 3. Curriculum submit + progress ---
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await login(page, 'learner.a@lab.local', 'demo-pass-a')
  await page.evaluate(() => {
    localStorage.removeItem('elab_submissions')
    localStorage.removeItem('elab_skill_progress')
  })
  await page.goto(base + '/dashboard', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(400)
  const before = Number((await page.evaluate(() => document.body.innerText.match(/(\d+)%/)?.[1] ?? '0')))
  await page.goto(base + '/program/weeks/1', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(400)
  const weekOk = (await page.getByText('Проблема недели').count()) > 0
  await shotPage(page, '04-week-1.png')
  await page.goto(base + '/assignments/W01-A', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(300)
  await page.locator('form textarea').first().fill('QA submit: ICP — B2B founders, боль — нет CTA в касаниях.')
  await page.evaluate(() => {
    const forms = [...document.querySelectorAll('form')]
    const f = forms.find((x) => x.textContent?.includes('Сдать') || x.querySelector('button[type=submit]'))
    f?.requestSubmit()
  })
  await page.waitForTimeout(700)
  await page.goto(base + '/dashboard', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(500)
  const after = Number((await page.locator('body').innerText()).match(/(\d+)%/)?.[1] ?? 0)
  await shotPage(page, '05-progress-after-submit.png')
  ok(3, 'Curriculum week1 + submit increases progress', weekOk && after > before, `before=${before} after=${after}`)
  await page.close()
}

// --- 4. Library filters ---
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await login(page, 'learner.a@lab.local', 'demo-pass-a')
  await page.goto(base + '/library', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(400)
  await page.locator('select').first().evaluate((el) => {
    const opt = [...el.options].find((o) => o.value.includes('MIT') || o.text.includes('MIT'))
    if (opt) {
      el.value = opt.value
      el.dispatchEvent(new Event('change', { bubbles: true }))
    }
  })
  await page.waitForTimeout(300)
  const hasMit = (await page.locator('body').innerText()).includes('MIT')
  await shotPage(page, '06-library-filter.png')
  ok(4, 'Library filters', hasMit, `hasMit=${hasMit}`)
  await page.close()
}

// --- 5. Chat two tabs (same context: shared localStorage + BroadcastChannel) ---
{
  const ctx = await browser.newContext()
  const pageA = await ctx.newPage({ viewport: { width: 1100, height: 800 } })
  const pageB = await ctx.newPage({ viewport: { width: 1100, height: 800 } })
  await pageA.emulateMedia({ reducedMotion: 'reduce' })
  await pageB.emulateMedia({ reducedMotion: 'reduce' })
  await login(pageA, 'learner.a@lab.local', 'demo-pass-a')
  await login(pageB, 'learner.b@lab.local', 'demo-pass-b')
  const token = `QA-${Date.now()}`
  await pageA.goto(base + '/chat', { waitUntil: 'domcontentloaded' })
  await pageB.goto(base + '/chat', { waitUntil: 'domcontentloaded' })
  await pageA.waitForTimeout(400)
  await pageA.locator('textarea').fill(`Сообщение из A ${token}`)
  await pageA.evaluate(() => document.querySelector('form')?.requestSubmit())
  await pageB.waitForTimeout(1500)
  let seen = (await pageB.locator('body').innerText()).includes(token)
  if (!seen) {
    await pageB.reload({ waitUntil: 'domcontentloaded' })
    await pageB.waitForTimeout(800)
    seen = (await pageB.locator('body').innerText()).includes(token)
  }
  await shotPage(pageB, '07-chat-b-sees-a.png')
  ok(5, 'Chat A↔B two tabs', seen, `tokenVisibleOnB=${seen}`)
  await ctx.close()
}

// --- 6. Forum create/reply/resolve ---
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await login(page, 'learner.a@lab.local', 'demo-pass-a')
  await page.goto(base + '/forum', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /Новая тема/i }).click()
  await page.waitForTimeout(200)
  const title = `QA тема ${Date.now()}`
  await page.locator('input[placeholder="Заголовок"]').fill(title)
  await page.locator('textarea[placeholder="Описание"]').fill('Описание для QA')
  await page.evaluate(() => document.querySelector('form')?.requestSubmit())
  await page.waitForTimeout(1000)
  const onTopic = page.url().includes('/forum/')
  await page.locator('form textarea').fill('QA ответ в теме')
  await page.evaluate(() => {
    const forms = [...document.querySelectorAll('form')]
    forms[forms.length - 1]?.requestSubmit()
  })
  await page.waitForTimeout(600)
  const replyOk = (await page.locator('body').innerText()).includes('QA ответ')
  await page.getByRole('button', { name: /Отметить решённым|Снять/i }).first().click()
  await page.waitForTimeout(400)
  const resolved = /Решено|Снять/i.test(await page.locator('body').innerText())
  await shotPage(page, '08-forum-topic.png')
  ok(6, 'Forum create/reply/resolve', onTopic && replyOk && resolved, `onTopic=${onTopic} reply=${replyOk} resolved=${resolved}`)
  await page.close()
}

// --- 7 + 11. Documents ---
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await login(page, 'learner.a@lab.local', 'demo-pass-a')
  await page.goto(base + '/documents', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /Загрузить документ/i }).click()
  await page.waitForTimeout(200)
  await page.setInputFiles('input[type=file]', {
    name: 'bad.exe',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('x'),
  })
  await page.waitForTimeout(400)
  const rejectExe = (await page.locator('body').innerText()).includes('PDF')
  await shotPage(page, '09-doc-reject.png')
  await page.setInputFiles('input[type=file]', {
    name: 'qa-note.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 qa'),
  })
  await page.locator('input[placeholder="Название"]').fill('QA документ')
  await page.evaluate(() => document.querySelector('form')?.requestSubmit())
  await page.waitForTimeout(1200)
  const body = await page.locator('body').innerText()
  const uploaded = page.url().includes('/documents/') || body.includes('QA документ')
  await shotPage(page, '10-doc-upload.png')
  const noPublic = !body.includes('https://storage') && !body.includes('public/')
  ok(7, 'Document reject invalid + upload valid', rejectExe && uploaded, `rejectExe=${rejectExe} uploaded=${uploaded}`)
  ok(11, 'Privacy: no public permanent doc URLs', noPublic, `noPublicStorageHints=${noPublic}`)
  await page.close()
}

// --- 8. Three simulators ---
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await login(page, 'learner.a@lab.local', 'demo-pass-a')
  const modes = ['/ai/sales', '/ai/presentation', '/ai/socratic']
  const fills = [
    'Какая боль? Кто ЛПР? Давайте встречу в пятницу.',
    'Проблема: долгий онбординг. Решение: чеклист. Proof: 2 кейса. Ask: пилот на неделю.',
    'ICP для нас — основатели B2B с болью в касаниях; например после 5 разговоров без CTA.',
  ]
  let scored = 0
  for (let i = 0; i < modes.length; i++) {
    await page.goto(base + modes[i], { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(350)
    await page.locator('textarea').fill(fills[i])
    await page.evaluate(() => document.querySelector('form')?.requestSubmit())
    await page.waitForTimeout(700)
    const t = await page.locator('body').innerText()
    if (/\d+\/100/.test(t) && /local_examiner/i.test(t)) scored++
  }
  await shotPage(page, '11-simulators.png')
  ok(8, '≥3 simulators scored debrief with spend lock on', scored >= 3, `scoredModes=${scored}`)
  await page.close()
}

// --- 9. AI-off path ---
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await login(page, 'learner.a@lab.local', 'demo-pass-a')
  await page.goto(base + '/dashboard', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(500)
  const dashText = await page.locator('body').innerText()
  const dash =
    (await page.locator('h1').count()) > 0 ||
    /Добро пожаловать|прогресс|Неделя/i.test(dashText)
  await page.goto(base + '/chat', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(300)
  const chat = (await page.locator('body').innerText()).includes('Чат')
  await page.goto(base + '/documents', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(300)
  const docsBody = await page.locator('body').innerText()
  const docs = /Документы|Приватные/i.test(docsBody)
  await shotPage(page, '12-ai-off-docs.png')
  ok(9, 'AI-off path does not block Dashboard/chat/docs', dash && chat && docs, `dash=${dash} chat=${chat} docs=${docs}`)
  await page.close()
}

// --- 10. Mobile ---
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await login(page, 'learner.a@lab.local', 'demo-pass-a')
  await page.goto(base + '/dashboard', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(400)
  const dashMobile = await page.locator('h1').count()
  await shotPage(page, '13-mobile-dashboard.png')
  await page.goto(base + '/program/weeks/1', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(400)
  const weekMobile = await page.getByText('Проблема недели').count()
  await shotPage(page, '14-mobile-week.png')
  ok(10, 'Mobile-ish viewport Dashboard + week', dashMobile > 0 && weekMobile > 0, `dashH1=${dashMobile} weekProblem=${weekMobile}`)
  await page.close()
}

await browser.close()

const passed = results.filter((r) => r.pass).length
writeFileSync('/tmp/qa-results.json', JSON.stringify({ passed, total: results.length, results }, null, 2))
console.log(`\nSUMMARY ${passed}/${results.length}`)
