# Runbook — Лаборатория предпринимательства (этапы 2–8)

Полная инструкция: локальный запуск, Supabase, деплой на **Vercel** (fallback Netlify/Render), демо-аккаунты, AI spend lock, QA.

## 0. Стек

| Слой | Выбор |
|------|--------|
| UI | Vite + React + TypeScript + Tailwind |
| Auth / DB / Storage / Realtime | **Supabase** (free tier) |
| Frontend host | **Vercel** (primary free). Fallback: Netlify, Render Static |
| Serverless | **Vercel Serverless** (`api/`), не Cloudflare Workers/Pages |
| AI (этап 6) | Spend lock **ON** по умолчанию → локальные examiners; внешний LLM только если lock OFF + ключ |

**Не используйте Cloudflare Pages/Workers как обязательный путь.**

## 1. Локальный демо-режим (без Supabase)

```bash
cd entrepreneurship-lab
cp .env.example .env          # VITE_DEMO_AUTH=true
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Откройте http://127.0.0.1:5173

### Демо-аккаунты (allowlist)

| Email | Пароль | Роль |
|-------|--------|------|
| `learner.a@lab.local` | `demo-pass-a` | участник, слот A |
| `learner.b@lab.local` | `demo-pass-b` | админ, слот B |

Третий email → отказ. Публичной регистрации нет.

В демо: прогресс/сдачи → `localStorage`; чат/форум → `localStorage` + `BroadcastChannel`; документы → IndexedDB (приватные blob); AI → `local_examiner` при spend lock ON.

## 2. Боевой режим (Supabase)

1. Создайте free-проект на supabase.com.
2. Auth → Email: **выключите Sign ups**.
3. SQL Editor — по порядку:
   - `supabase/migrations/001_*.sql` … `006_*.sql`
   - `supabase/seed.sql`, `supabase/seed_curriculum.sql` (если есть)
4. В `.env` / хостинг env:

```env
VITE_SUPABASE_URL=https://YOUR.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_DEMO_AUTH=false
```

5. Bootstrap двух пользователей (service role **только** локально / CI secret, никогда в клиент):

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
LEARNER_A_EMAIL=... LEARNER_A_PASSWORD=... \
LEARNER_B_EMAIL=... LEARNER_B_PASSWORD=... \
node scripts/bootstrap-users.mjs
```

6. Storage: приватный bucket для документов; выдача через signed URL (миграция 005).
7. Realtime: канал чата/форума (миграция 004); RLS — только allowlisted profiles.

## 3. Деплой фронтенда на Vercel (primary)

1. Подключите репозиторий к [vercel.com](https://vercel.com) (или `npx vercel` / `VERCEL_TOKEN`).
2. Framework: **Vite** · Build: `npm run build` · Output: `dist`.
3. Env (Production + Preview): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEMO_AUTH`.
4. SPA — файл `vercel.json` в корне (уже в репо).
5. Любые серверные helpers — `api/*.ts` как **Vercel Serverless Functions**. Не Cloudflare Workers.

### Cloud Agent без токенов

- GitHub owner для деплоя: **`collecttr`** (репо `collecttr/entrepreneurship-lab`). **Не** `pbkond`.
- Push требует secret **`GH_TOKEN`** (PAT от collecttr) в Cloud Agents → Secrets; иначе `gh` не залогинен.
- Без `VERCEL_TOKEN`: `npx vercel deploy --temporary` даёт анонимный URL (~60 мин) + **Claim URL** — откройте claim в своём Vercel-аккаунте.
- Актуальный статус: Project store `docs/deploy-report.md`.

### Fallback

| Host | Build | Publish | SPA |
|------|-------|---------|-----|
| Netlify | `npm run build` | `dist` | `/* /index.html 200` |
| Render Static | `npm run build` | `dist` | rewrite → `/index.html` |

Публичный URL появляется только после деплоя владельцем. **Не изобретать** `*.vercel.app` / `*.netlify.app` ссылки в отчётах.

## 4. AI / spend lock

- По умолчанию spend lock **включён** → ответы от `src/ai/examiners.ts` (`provider: local_examiner`), без внешнего API.
- Dashboard / чат / документы работают при «AI off».
- Чтобы включить внешний LLM: выключить lock в UI/admin **и** задать ключ на сервере (не в `VITE_*`).

## 5. QA

Чеклист и результаты: `docs/qa-checklist.md` (в репо) и копия в Project store.  
Автопрогон: `node scripts/qa-stage7.mjs` при запущенном `npm run dev`.  
Скриншоты: Project store `media/qa/`, UI refresh — `media/ui-refresh/`.

## 6. UI / тема

Apple-comfort: системный шрифт (`-apple-system` / SF Pro stack), монохром (чёрный `#1d1d1f` / белый / серый `#86868b` `#f5f5f7`), без blue+gold, calm transitions, dark mode через `prefers-color-scheme`. Русский UI.

## 7. Известные ограничения демо

- Чат между двумя браузерами без общего origin storage не синкается (нужен Realtime).
- Документы в демо — локальный IndexedDB, не переживают другой устройство.
- Без реального Supabase-проекта live Auth/RLS не проверяются end-to-end.
