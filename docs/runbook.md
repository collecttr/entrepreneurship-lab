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

### 2.3. Применить миграции 001–011

1. **SQL Editor** → **New query**.
2. По порядку вставьте и **Run** содержимое файлов из репо:
   - `supabase/migrations/001_init_profiles_allowlist.sql`
   - `supabase/migrations/001b_weeks_skeleton_progress_stubs.sql`
   - `supabase/migrations/002_curriculum_core.sql`
   - `supabase/migrations/003_progress.sql`
   - `supabase/migrations/004_collab.sql`
   - `supabase/migrations/005_documents.sql`
   - `supabase/migrations/006_ai_usage.sql`
   - `supabase/migrations/007_auth_allowlist_fix.sql` (JWT allowlist + own-profile SELECT; fixes login bounce)
   - `supabase/migrations/008_exam_attempts_body.sql` (body_md + updated_at для live slug↔UUID sync аттестаций)
   - `supabase/migrations/009_search_allowlisted_users.sql` (поиск собеседника по email среди allowlist + profiles)
   - `supabase/migrations/010_course_start_progress_snapshots.sql` (старт курса 2026-11-23 + `progress_snapshots` + имена Саша/Платон)
   - `supabase/migrations/011_zero_starter_progress_snapshots.sql` (**обязательно при ложных ~4%**: обнуляет снимки прогресса Саши и Платона)
   - `supabase/migrations/012_progress_snapshots_realtime.sql` (Realtime на `progress_snapshots` — доска Саша/Платон без F5)
3. Затем seed (если нужно контент в БД):
   - `supabase/seed.sql`
   - `supabase/seed_curriculum.sql` (большой — можно частями при таймауте; таблица `exams` обязательна для UUID map)
4. **Database** → **Publications** / Realtime: убедитесь, что таблицы `messages`, `discussions`, `discussion_posts`, `progress_snapshots` в publication (миграции 004 и 012).

### 2.3a. Ложные ~4% / навыки «28» без сдач

Клиент после деплоя сам: (1) обнуляет skill EMA без доказательств; (2) один раз чистит `elab_submissions` / skill keys, если нет сдач с даты старта курса `2026-11-23`; (3) пишет 0% в свой `progress_snapshots`.

Петр в Supabase SQL Editor — выполнить `011_zero_starter_progress_snapshots.sql` (оба участника). Админ в UI: **Админ → «Сбросить локальный прогресс до 0%»**.

### 2.3b. Профиль отсутствует (bounce / soft profile)

Если Auth-пользователь есть, а строки в `profiles` нет — клиент больше **не** делает `signOut` после login. Выполните SQL (пример для Петра):

`supabase/snippets/ensure-profile-standkill25.sql`

Или вручную: `allowed_emails` + `profiles` upsert по `auth.users.id` для нужного email.

### 2.3c. Сессия (~24ч)

Клиент: `persistSession` + `autoRefreshToken` + безопасный `localStorage` (`elab-auth`). Access JWT ~1ч, обновляется автоматически. Срок refresh-токена — в Supabase Dashboard → Authentication → Settings (по умолчанию обычно **больше** 24ч; cookieOptions на plain JS-клиенте нет).

Auth boot fail-open ≈ **2с**: если `getSession` / сеть зависает (Safari / PWA / VPN), всегда показывается форма входа. Аварийный URL: `/login?skip_restore=1`.

### 2.3d. iPhone / «На экран Домой» — зависает загрузка

1. Safari → **aA** / настройки сайта → **Очистить данные сайта** для `entrepreneurship-lab.vercel.app` (или Настройки → Safari → Дополнения → данные сайтов).
2. Удалите иконку с Домой → откройте сайт **в Safari** → войдите → снова **Поделиться → На экран «Домой»**.
3. Если снова крутится: откройте `https://entrepreneurship-lab.vercel.app/login?skip_restore=1` и войдите заново.

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

- По умолчанию spend lock **включён** → ответы от `src/ai/examiners.ts` (`mode: local_examiner`).
- Доклад/разбор (`writing-evaluator`, `socratic`, `presentation`, `business-case`) сверяют **тезисы** ученика с карточками источников недели + методичкой (`src/ai/local-evidence.ts`). Статусы: **поддержка / противоречие / недостаточно**. Опциональный `fetch` публичных URL; при CORS/таймауте — только метаданные.
- Это **не** ChatGPT и не проверка «всех фактов интернета». Платный API не вызывается.
- Глобальный баннер в shell / `/ai` говорит об этом прямо.
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
