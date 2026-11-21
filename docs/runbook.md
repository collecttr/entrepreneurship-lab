# Runbook — Лаборатория предпринимательства (этапы 2–8)

Полная инструкция: локальный запуск, Supabase (free), деплой на **Vercel**, демо-аккаунты, AI spend lock, QA.

## 0. Стек

| Слой | Выбор |
|------|--------|
| UI | Vite + React + TypeScript + Tailwind · монохром ч/б/серый |
| Auth / DB / Storage / Realtime | **Supabase** (free tier) |
| Frontend host | **Vercel** (primary free). Fallback: Netlify, Render Static |
| Serverless | **Vercel Serverless** (`api/`), не Cloudflare Workers/Pages |
| AI | Spend lock **ON** по умолчанию → локальные examiners; внешний LLM только если lock OFF + ключ |

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

В демо: прогресс/сдачи/аттестации → `localStorage`; чат/форум → `localStorage` + `BroadcastChannel`; документы → IndexedDB; AI → `local_examiner` при spend lock ON.

## 2. Боевой режим — шаги для Петра (Supabase free + Vercel)

**Не вставляйте URL/ключи в чат Cursor.** Только в Dashboard → Environment Variables.

### 2.1. Создать free-проект Supabase

1. Откройте [https://supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Organization → выберите свою → **Create new project**.
3. Name: `entrepreneurship-lab` · Database password: сохраните в менеджере паролей · Region: ближайший · Plan: **Free**.
4. Дождитесь статуса **Project is ready**.

### 2.2. Выключить публичную регистрацию

1. В проекте: **Authentication** → **Providers** → **Email**.
2. **Enable Email provider** — ON.
3. **Confirm email** — можно OFF для закрытого allowlist (пароли выдаёт админ).
4. **Authentication** → **Settings** (или **Sign In / Providers**): отключите **Allow new users to sign up** / Sign ups = **OFF**.
5. OAuth / Magic link — не включать на MVP.

### 2.3. Применить миграции 001–006

1. **SQL Editor** → **New query**.
2. По порядку вставьте и **Run** содержимое файлов из репо:
   - `supabase/migrations/001_init_profiles_allowlist.sql`
   - `supabase/migrations/001b_weeks_skeleton_progress_stubs.sql`
   - `supabase/migrations/002_curriculum_core.sql`
   - `supabase/migrations/003_progress.sql`
   - `supabase/migrations/004_collab.sql`
   - `supabase/migrations/005_documents.sql`
   - `supabase/migrations/006_ai_usage.sql`
3. Затем seed (если нужно контент в БД):
   - `supabase/seed.sql`
   - `supabase/seed_curriculum.sql` (большой — можно частями при таймауте)
4. **Database** → **Publications** / Realtime: убедитесь, что таблицы `messages`, `discussions`, `discussion_posts` в publication (миграция 004 добавляет).

### 2.4. Storage (private documents)

1. **Storage** → bucket `documents` должен быть **private** (миграция 005).
2. Проверьте policies: только authenticated allowlist; скачивание через **signed URL** (клиент: `createSignedDownloadUrl`).

### 2.5. Bootstrap двух пользователей (service role только локально)

1. **Project Settings** → **API**: скопируйте `Project URL`, `anon` `public`, `service_role` **secret**.
2. `service_role` **никогда** не в `VITE_*` и не в чат.
3. Локально:

```bash
export SUPABASE_URL="https://YOUR.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="…service_role…"
export LEARNER_A_EMAIL="you-a@example.com"
export LEARNER_A_PASSWORD="…strong…"
export LEARNER_B_EMAIL="you-b@example.com"
export LEARNER_B_PASSWORD="…strong…"
node scripts/bootstrap-users.mjs
```

Скрипт создаёт Auth users, `allowed_emails`, `profiles` (A learner / B admin).

### 2.6. Vercel env (Production + Preview)

1. [vercel.com](https://vercel.com) → проект `entrepreneurship-lab` → **Settings** → **Environment Variables**.
2. Добавьте (значения только в UI Vercel):

| Name | Notes |
|------|--------|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon public key |
| `VITE_DEMO_AUTH` | `false` |
| `VITE_AI_SPEND_LOCK` | `true` (оставить ON) |

3. **Redeploy** после сохранения env (Deployments → … → Redeploy), иначе Vite не подхватит `VITE_*`.
4. Live: https://entrepreneurship-lab.vercel.app/

После redeploy баннер «Демо-режим» пропадает; вход — реальные allowlist-email.

### 2.7. Если секретов ещё нет

Приложение остаётся в демо-режиме. Код уже переключается на Auth / Realtime / signed Storage, когда env заданы. Не нужно ничего вставлять в чат — только Vercel + Supabase Dashboard.

## 3. Деплой фронтенда на Vercel

1. Репозиторий: **`collecttr/entrepreneurship-lab`** (не `pbkond`).
2. Framework: **Vite** · Build: `npm run build` · Output: `dist`.
3. SPA — `vercel.json` в корне.
4. Push в `main` → автодеплой (если Git connected).

### Fallback

| Host | Build | Publish | SPA |
|------|-------|---------|-----|
| Netlify | `npm run build` | `dist` | `/* /index.html 200` |
| Render Static | `npm run build` | `dist` | rewrite → `/index.html` |

## 4. AI / spend lock

- По умолчанию spend lock **включён** → ответы от `src/ai/examiners.ts` (`provider: local_examiner`).
- Глобальный баннер «Режим без платного AI» в shell.
- Dashboard / чат / документы / навыки / аттестации работают при AI off.
- Внешний LLM: выключить lock в env **и** server secrets (не `VITE_*` ключ провайдера).

## 5. QA

Чеклист: `docs/qa-checklist.md`.  
Автопрогон: `node scripts/qa-stage7.mjs` при `npm run dev`.

## 6. UI / тема

Монохром: чёрный `#1d1d1f` / белый / серый `#86868b` `#f5f5f7`. Без blue+gold. Dark через `prefers-color-scheme`. Русский UI.

## 7. Известные ограничения

- Без env Supabase — демо (localStorage / IndexedDB / BroadcastChannel).
- `exam_attempts` в UI пишет в localStorage; UUID-маппинг к seed-`exams` — follow-up после seed.
- Документы в демо — IndexedDB на устройстве.
