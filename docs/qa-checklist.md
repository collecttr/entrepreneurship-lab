# QA Checklist — Этап 7

Автопрогон: `node scripts/qa-stage7.mjs` (нужен `npm run dev` на `:5173`).  
Скриншоты: Project store `media/qa/`. UI refresh: `media/ui-refresh/`.

Дата прогона: 2026-11-21 · Режим: **демо** (`VITE_DEMO_AUTH=true`) · Итог: **11/11 PASS**

| # | Проверка | Результат | Деталь / скрин |
|---|----------|-----------|----------------|
| 1 | Вход обоих демо-пользователей; третий отклонён | **PASS** | `01-login-a.png`, `02-allowlist-reject.png` |
| 2 | Protected routes → `/login` без сессии | **PASS** | `03-protected-redirect.png` |
| 3 | Неделя 1 + сдача повышает прогресс | **PASS** | 0% → 2%; `04-week-1.png`, `05-progress-after-submit.png` |
| 4 | Фильтры библиотеки (MIT) | **PASS** | `06-library-filter.png` |
| 5 | Чат A↔B (две вкладки, общий context) | **PASS** | `07-chat-b-sees-a.png` (исправлен broadcast-loop в `markChatRead`) |
| 6 | Форум: тема / ответ / «решено» | **PASS** | `08-forum-topic.png` |
| 7 | Документ: reject `.exe`, upload PDF | **PASS** | `09-doc-reject.png`, `10-doc-upload.png` |
| 8 | ≥3 симулятора + spend lock → `local_examiner` score | **PASS** | scoredModes=3; `11-simulators.png` |
| 9 | AI-off не блокирует Dashboard / чат / docs | **PASS** | `12-ai-off-docs.png` |
| 10 | Mobile viewport (390×844) Dashboard + week | **PASS** | `13-mobile-dashboard.png`, `14-mobile-week.png` |
| 11 | Privacy: нет публичных permanent doc URL | **PASS** | нет `https://storage` / `public/` в UI |

## Не покрыто этим прогоном

- Live Supabase Auth / RLS / Realtime (нет provisioned project).
- Production deploy smoke на Vercel (URL появляется только после деплоя владельцем).
- Внешний LLM при spend lock OFF.

## Фиксы во время QA

- `markChatRead` больше не шлёт broadcast при каждом echo → убран stack overflow в чате.
- Хостинг в доках: **Vercel** primary (не Cloudflare).
- UI: Apple-comfort tokens (`src/index.css`).
