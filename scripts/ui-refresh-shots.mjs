import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const base = 'http://127.0.0.1:5173'
const out = '/cursor/stores/bc-18422e98-436a-456a-b810-b5aabd1244b7/media/ui-refresh'
mkdirSync(out, { recursive: true })

async function login(page, email, pass) {
  await page.goto(base + '/login', { waitUntil: 'networkidle', timeout: 20000 })
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', pass)
  await page.evaluate(() => document.querySelector('form')?.requestSubmit())
  await page.waitForURL(/dashboard/, { timeout: 10000 })
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto(base + '/login', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.screenshot({ path: `${out}/01-login.png`, fullPage: false })

await login(page, 'learner.a@lab.local', 'demo-pass-a')
await page.waitForTimeout(600)
await page.screenshot({ path: `${out}/02-dashboard.png`, fullPage: false })

await page.goto(base + '/program/weeks/1', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.screenshot({ path: `${out}/03-week-1.png`, fullPage: false })

await page.goto(base + '/ai/sales', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.screenshot({ path: `${out}/04-ai-sales.png`, fullPage: false })

// dark preference
await page.emulateMedia({ colorScheme: 'dark' })
await page.goto(base + '/dashboard', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.screenshot({ path: `${out}/05-dashboard-dark.png`, fullPage: false })

await browser.close()
console.log('UI refresh screenshots written to', out)
