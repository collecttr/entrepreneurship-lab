# Экспертная проверка (LLM): ключи на Vercel

См. полную инструкцию в Project store: `docs/expert-exam-keys.md`  
(зеркало для репо — чтобы был рядом с `runbook.md`).

Free tier. Ключи провайдеров **никогда** не в `VITE_*` / браузере / anon Supabase / git.

## Env names

**Server (Vercel Secret):**

- `AI_EXPERT_ENABLED=true`
- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `OPENROUTER_API_KEY`
- `AI_MONTHLY_REQUEST_CAP` (default 120)
- `AI_MONTHLY_TOKEN_BUDGET` (default 400000)
- `AI_SPEND_LOCK=force` — optional hard kill
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — optional metering

**Client (Vercel Config, after keys are set):**

- `VITE_AI_LIVE_CONFIGURED=true`
- `VITE_AI_EXPERT_ENABLED=true`
- `VITE_AI_SPEND_LOCK=true` (keep ON — blocks paid paths)

Redeploy after saving. Proxy: `POST /api/expert-exam` (Gemini → Groq → OpenRouter).

UI honesty: **локально** vs **эксперт (LLM)**.
