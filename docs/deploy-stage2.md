# Deploy / run — Этап 2 (+ хостинг)

## Локально (рекомендуется сначала демо)

```bash
cd /home/ubuntu/entrepreneurship-lab
cp .env.example .env
# убедитесь: VITE_DEMO_AUTH=true
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Preview: `http://127.0.0.1:5173`

### Env vars (клиент)

| Variable | Required | Notes |
|----------|----------|-------|
| `VITE_SUPABASE_URL` | for live auth | Project URL |
| `VITE_SUPABASE_ANON_KEY` | for live auth | Anon/public key only |
| `VITE_DEMO_AUTH` | optional | `true` → local allowlist demo session |

### Env vars (только bootstrap / сервер — НЕ в Vite)

| Variable | Notes |
|----------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API; never ship to browser |
| `SUPABASE_URL` | Same project URL for scripts |
| `LEARNER_A_EMAIL` / `LEARNER_A_PASSWORD` / `LEARNER_A_NAME` | optional overrides |
| `LEARNER_B_EMAIL` / `LEARNER_B_PASSWORD` / `LEARNER_B_NAME` | optional; B defaults to admin |

## Создать Supabase project

1. https://supabase.com → New project (Free).
2. Authentication → Providers → Email: **disable Sign ups**.
3. SQL Editor: выполните миграции `001` → `006` и seed-файлы по порядку.
4. Project Settings → API: скопируйте URL и `anon` key в `.env`.
5. Bootstrap users:

```bash
SUPABASE_URL=https://YOUR.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE \
LEARNER_A_EMAIL=anna@example.com \
LEARNER_A_PASSWORD='...' \
LEARNER_B_EMAIL=igor@example.com \
LEARNER_B_PASSWORD='...' \
node scripts/bootstrap-users.mjs
```

## Хостинг фронтенда (без Cloudflare)

**Primary (free):** [Vercel](https://vercel.com)  
**Fallback:** Netlify или Render Static Site

Cloudflare Workers/Pages **не** являются обязательным путём (ограничения VPN). Не требуйте `*.pages.dev`.

### Vercel

1. Import репозитория (или `vercel` CLI из локальной папки).
2. Framework Preset: Vite.
3. Build: `npm run build` · Output: `dist`.
4. Environment Variables (Production + Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_DEMO_AUTH=false` (боевой) или `true` (демо-preview)
5. SPA rewrite: `vercel.json` с rewrite `/(.*) → /index.html` (см. полный runbook).
6. Serverless / edge helpers (если появятся): **Vercel Serverless Functions** (`api/`), не Cloudflare Workers.

### Netlify / Render (fallback)

- Netlify: build `npm run build`, publish `dist`, SPA redirect `/* → /index.html` 200.
- Render Static: same build/publish; add rewrite rule for SPA.

### Gaps без provisioned Supabase

- Live Auth / RLS smoke против реального проекта — нужен project от владельца.
- Пока используйте демо-режим; UI и миграции уже готовы.
- Публичный deploy URL появится только после подключения репозитория к Vercel владельцем — **не выдумывать** URL.
