# Лаборатория предпринимательства

Закрытая образовательная платформа для двух участников (React + TypeScript + Tailwind + Supabase).

Этапы 2–6: auth/shell, 26-недельная программа, чат/форум, приватные документы, AI-тренажёры (spend lock ON + local examiners).  
Этапы 7–8: QA + runbook. UI: Apple-comfort (system fonts, soft neutrals / system blue).

## Быстрый старт (демо)

```bash
cd /home/ubuntu/entrepreneurship-lab
cp .env.example .env   # VITE_DEMO_AUTH=true
npm install
npm run dev
```

Откройте http://127.0.0.1:5173

| Email | Пароль | Роль |
|-------|--------|------|
| `learner.a@lab.local` | `demo-pass-a` | участник, слот A |
| `learner.b@lab.local` | `demo-pass-b` | админ, слот B |

Публичной регистрации нет.

## Хостинг (free)

- **Primary: Vercel** (`npm run build` → `dist`, SPA via `vercel.json`)
- Fallback: Netlify / Render Static
- Data: **Supabase** Auth/DB/Storage/Realtime
- Serverless: Vercel Functions — **не** Cloudflare Workers/Pages

Полный runbook: [`docs/runbook.md`](./docs/runbook.md). Deploy notes: [`docs/deploy-stage2.md`](./docs/deploy-stage2.md). QA: [`docs/qa-checklist.md`](./docs/qa-checklist.md).

## Supabase (боевой режим)

1. Free-проект; Sign ups выключены.
2. Миграции `001`–`006` + seed.
3. `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEMO_AUTH=false`.
4. `node scripts/bootstrap-users.mjs` с service role (только локально/CI).

## Скрипты

- `npm run dev` / `build` / `preview`
- `node scripts/qa-stage7.mjs` — авто-QA (нужен dev-сервер)
