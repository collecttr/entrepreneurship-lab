-- Dev seed: allowlist emails, one module, week 1 unlocked, skill stubs.
-- Profiles rows are created by handle_new_user after Auth users exist (see bootstrap).

insert into public.allowed_emails (email) values
  ('learner.a@example.com'),
  ('learner.b@example.com')
on conflict (email) do nothing;

insert into public.modules (slug, title_ru, order_index, description_ru, estimated_hours)
values (
  'sales-psychology',
  'Модуль 1 · Продажи и психология',
  1,
  'Каркас модуля для этапа 2. Полный контент — этап 3.',
  16
)
on conflict (slug) do nothing;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals)
select
  m.id,
  1,
  'Старт: мышление продавца',
  true,
  'Базовые модели продаж и карта покупателя (seed этапа 2).',
  '["Понять базовую воронку","Собрать карту покупателя"]'::jsonb
from public.modules m
where m.slug = 'sales-psychology'
on conflict (week_number) do update
set title_ru = excluded.title_ru,
    is_unlocked = excluded.is_unlocked,
    summary_ru = excluded.summary_ru;

insert into public.skills (slug, title_ru, category) values
  ('sales', 'Продажи', 'sales'),
  ('negotiation', 'Переговоры', 'negotiation'),
  ('presentation', 'Презентации', 'presentation'),
  ('psychology', 'Психология покупателя', 'psychology'),
  ('entrepreneurial', 'Предпринимательское мышление', 'entrepreneurial')
on conflict (slug) do nothing;

update public.program_settings
set current_unlocked_week = 1,
    program_start_date = '2026-11-23',
    ai_spend_lock = true,
    hours_per_week_target = 240
where id = 1;
