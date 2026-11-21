-- Stage 3 curriculum seed — generated from src/data/*
-- Demo app reads TypeScript pack directly; this SQL is for Supabase projects.

insert into public.modules (slug, title_ru, order_index, description_ru, estimated_hours)
values ('sales-psychology', 'Продажи и психология покупателя', 1, 'Воронка, диагностика, карта ЛПР, еженедельная практика продаж.', 16)
on conflict (slug) do update set title_ru = excluded.title_ru, order_index = excluded.order_index, description_ru = excluded.description_ru, estimated_hours = excluded.estimated_hours;

insert into public.modules (slug, title_ru, order_index, description_ru, estimated_hours)
values ('negotiation', 'Переговоры', 2, 'Интересы vs позиции, BATNA, сложные сделки, симуляции.', 16)
on conflict (slug) do update set title_ru = excluded.title_ru, order_index = excluded.order_index, description_ru = excluded.description_ru, estimated_hours = excluded.estimated_hours;

insert into public.modules (slug, title_ru, order_index, description_ru, estimated_hours)
values ('presentation-speaking', 'Презентации и публичные выступления', 3, 'Структура питча, слайды, защита, голос и присутствие.', 16)
on conflict (slug) do update set title_ru = excluded.title_ru, order_index = excluded.order_index, description_ru = excluded.description_ru, estimated_hours = excluded.estimated_hours;

insert into public.modules (slug, title_ru, order_index, description_ru, estimated_hours)
values ('marketing-discovery', 'Маркетинг и customer discovery', 4, 'Сегменты, позиционирование, research, inbound-эксперименты.', 16)
on conflict (slug) do update set title_ru = excluded.title_ru, order_index = excluded.order_index, description_ru = excluded.description_ru, estimated_hours = excluded.estimated_hours;

insert into public.modules (slug, title_ru, order_index, description_ru, estimated_hours)
values ('ops-economics', 'Операции и экономика', 5, 'Послепродажный процесс, CAC/LTV-рамки, исполнение обязательств.', 16)
on conflict (slug) do update set title_ru = excluded.title_ru, order_index = excluded.order_index, description_ru = excluded.description_ru, estimated_hours = excluded.estimated_hours;

insert into public.modules (slug, title_ru, order_index, description_ru, estimated_hours)
values ('systems-leadership', 'Системы и предпринимательское лидерство', 6, 'Бизнес-модель, команды влияния, масштабирование практики продаж.', 16)
on conflict (slug) do update set title_ru = excluded.title_ru, order_index = excluded.order_index, description_ru = excluded.description_ru, estimated_hours = excluded.estimated_hours;

insert into public.modules (slug, title_ru, order_index, description_ru, estimated_hours)
values ('final-attestation', 'Финальная аттестация', 7, 'Итоговый кейс, защита, портфолио работ за курс.', 8)
on conflict (slug) do update set title_ru = excluded.title_ru, order_index = excluded.order_index, description_ru = excluded.description_ru, estimated_hours = excluded.estimated_hours;

insert into public.skills (slug, title_ru, category) values ('sales', 'Продажи', 'sales')
on conflict (slug) do update set title_ru = excluded.title_ru, category = excluded.category;
insert into public.skills (slug, title_ru, category) values ('negotiation', 'Переговоры', 'negotiation')
on conflict (slug) do update set title_ru = excluded.title_ru, category = excluded.category;
insert into public.skills (slug, title_ru, category) values ('presentation', 'Презентации', 'presentation')
on conflict (slug) do update set title_ru = excluded.title_ru, category = excluded.category;
insert into public.skills (slug, title_ru, category) values ('psychology', 'Психология покупателя', 'psychology')
on conflict (slug) do update set title_ru = excluded.title_ru, category = excluded.category;
insert into public.skills (slug, title_ru, category) values ('entrepreneurial', 'Предпринимательское мышление', 'entrepreneurial')
on conflict (slug) do update set title_ru = excluded.title_ru, category = excluded.category;
insert into public.skills (slug, title_ru, category) values ('marketing', 'Маркетинг', 'marketing')
on conflict (slug) do update set title_ru = excluded.title_ru, category = excluded.category;
insert into public.skills (slug, title_ru, category) values ('ops', 'Операции и экономика', 'ops')
on conflict (slug) do update set title_ru = excluded.title_ru, category = excluded.category;
insert into public.skills (slug, title_ru, category) values ('speaking', 'Публичные выступления', 'speaking')
on conflict (slug) do update set title_ru = excluded.title_ru, category = excluded.category;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('yc-sales-playbook', 'YC: The Sales Playbook For Founders', 'The Sales Playbook For Founders', 'YC Library', 'https://www.ycombinator.com/library/Mo-the-sales-playbook-for-founders', 'Бесплатно на YC Startup Library', true, false, 45, 'en', '2026-11-21', 'Практический каркас продаж для основателя без отдела продаж.', 'Весь материал плейбука; конспект воронки и следующего шага сделки.', 'Как формулировать оффер, кого звать первым и как закрывать следующий шаг.', '["Кто ваш идеальный первый покупатель и почему именно он?","Какой следующий конкретный шаг вы просите после звонка?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('yc-startup-ideas', 'YC: How to get startup ideas', 'How to get startup ideas', 'YC Library', 'https://www.ycombinator.com/library/8g-how-to-get-startup-ideas', 'Бесплатно на YC Startup Library', true, false, 35, 'en', '2026-11-21', 'Отделяет «идею ради идеи» от реальной боли пользователя.', 'Эссе целиком; выписать 5 критериев сильной идеи.', 'Почему «solution looking for a problem» проваливается.', '["Какую острую проблему вы видите лучше других?","Какие «tar pit» идеи вы сознательно отбрасываете?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('yc-sales-marketing-talk', 'YC: Sales and Marketing (How to Start a Startup)', 'How to Start a Startup: Sales and Marketing; How to Talk to Investors', 'YC Library', 'https://www.ycombinator.com/library/dc-how-to-start-a-startup-sales-and-marketing-how-to-talk-to-investors', 'Бесплатно на YC Startup Library', true, false, 50, 'en', '2026-11-21', 'Связка продаж и маркетинга на ранней стадии.', 'Секция про sales/marketing; конспект каналов и метрик.', 'Чем ранние продажи отличаются от «масштабируемого маркетинга».', '["Какой канал даст 10 разговоров на этой неделе?","Какую метрику вы будете смотреть ежедневно?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('hubspot-inbound-sales', 'HubSpot Academy: Inbound Sales', 'Inbound Sales Course', 'HubSpot Academy', 'https://academy.hubspot.com/courses/inbound-sales', 'Бесплатный курс HubSpot Academy (требуется бесплатный аккаунт)', true, false, 90, 'en', '2026-11-21', 'Структурированный процесс квалификации и ведения сделки.', 'Модули Identify → Connect → Explore → Advise; практические шаблоны.', 'Как вести разговор вокруг проблем покупателя, а не вокруг фич.', '["Какие сигналы показывают, что лид готов к Explore?","Как вы сформулируете рекомендацию (Advise) без давления?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('hubspot-inbound-marketing', 'HubSpot Academy: Inbound Marketing', 'Inbound Marketing Course', 'HubSpot Academy', 'https://academy.hubspot.com/courses/inbound-marketing', 'Бесплатный курс HubSpot Academy', true, false, 90, 'en', '2026-11-21', 'База привлечения через полезный контент и воронку.', 'Attract / Engage / Delight; выбрать один канал для эксперимента.', 'Как связать контент с этапом покупательского пути.', '["Какой один контент-актив вы сделаете за 2 часа?","Как измерите, что он привёл к разговору, а не только к просмотрам?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('mit-entrepreneurial-marketing', 'MIT OCW: Entrepreneurial Marketing (15.835)', 'Entrepreneurial Marketing', 'MIT OCW', 'https://ocw.mit.edu/courses/15-835-entrepreneurial-marketing-spring-2002/', 'MIT OpenCourseWare — свободный доступ к материалам курса', true, false, 60, 'en', '2026-11-21', 'Маркетинг при ограниченных ресурсах стартапа.', 'Lecture notes: Market Research, Segmentation and Targeting, Positioning Tools.', 'Как выбрать сегмент и позиционирование без большого бюджета.', '["Какой сегмент вы выберете первым и почему?","Какое позиционирование отличимо от 2 конкурентов?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('mit-new-enterprises', 'MIT OCW: New Enterprises (15.390)', 'New Enterprises', 'MIT OCW', 'https://ocw.mit.edu/courses/15-390-new-enterprises-spring-2013/', 'MIT OpenCourseWare — свободный доступ', true, false, 70, 'en', '2026-11-21', 'От идеи до go-to-market и unit-экономики.', 'Notes: Target customer, Competition, Sales and distribution, COCA.', 'Связка customer research → CAC → модель захвата ценности.', '["Как клиент узнаёт о продукте и покупает его?","Какой грубый CAC вы оцениваете для первого канала?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('mit-marketing-management', 'MIT OCW: Marketing Management (15.810)', 'Marketing Management: Analytics, Frameworks, and Applications', 'MIT OCW', 'https://ocw.mit.edu/courses/15-810-marketing-management-analytics-frameworks-and-applications-fall-2015/', 'MIT OpenCourseWare — свободный доступ', true, false, 55, 'en', '2026-11-21', 'Аналитические рамки маркетинговых решений.', 'Обзор курса + выбранные assignments/frameworks из syllabus.', 'Как принимать маркетинговые решения на данных, а не на ощущениях.', '["Какое решение вы сейчас принимаете «на глаз»?","Какой минимальный набор данных его улучшит?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('openstax-entrepreneurship', 'OpenStax: Entrepreneurship', 'Entrepreneurship', 'OpenStax', 'https://openstax.org/details/books/entrepreneurship', 'OpenStax CC BY — бесплатный учебник', true, false, 50, 'en', '2026-11-21', 'Системное введение в предпринимательство без платного учебника.', 'Главы про opportunity recognition и business models (см. ToC на сайте).', 'Базовый словарь: возможность, модель, ценность, риски.', '["Какую возможность вы формулируете в одном предложении?","Какие 3 риска самые критичные на старте?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('openstax-principles-marketing', 'OpenStax: Principles of Marketing', 'Principles of Marketing', 'OpenStax', 'https://openstax.org/details/books/principles-marketing', 'OpenStax CC BY — бесплатный учебник', true, false, 50, 'en', '2026-11-21', 'Классика маркетинга: сегментация, 4P, покупательское поведение.', 'Главы про consumer behavior и segmentation (по ToC).', 'Как описать путь решения покупателя до покупки.', '["Какие этапы проходит ваш покупатель до решения?","Где в пути возникает наибольшее трение?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('openstax-intro-business', 'OpenStax: Introduction to Business', 'Introduction to Business', 'OpenStax', 'https://openstax.org/details/books/introduction-business', 'OpenStax CC BY — бесплатный учебник', true, false, 45, 'en', '2026-11-21', 'Операции, финансы и структура бизнеса на простом языке.', 'Главы про management/operations и financial basics.', 'Как связаны продажи, операционка и денежный поток.', '["Какой операционный bottleneck мешает продажам?","Где в процессе теряется время после «да» клиента?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('openstax-organizational-behavior', 'OpenStax: Organizational Behavior', 'Organizational Behavior', 'OpenStax', 'https://openstax.org/details/books/organizational-behavior', 'OpenStax CC BY — бесплатный учебник', true, false, 45, 'en', '2026-11-21', 'Психология влияния, мотивации и переговоров в организациях.', 'Главы про communication, power/influence, conflict.', 'Как интересы и статусы влияют на решение «купить / согласиться».', '["Кто неформально влияет на решение у вашего клиента?","Какой конфликт интересов вы должны назвать вслух?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('pon-harvard-home', 'Harvard PON: Program on Negotiation', 'Program on Negotiation at Harvard Law School', 'Harvard PON', 'https://www.pon.harvard.edu/', 'Бесплатные статьи и ресурсы PON (часть материалов платная — берём только free daily/blog)', true, false, 40, 'en', '2026-11-21', 'Авторитетная школа переговоров: интересы vs позиции.', 'Бесплатные Daily Blog материалы про interests, BATNA, preparation.', 'BATNA, резервная цена, подготовка к переговорам.', '["Какая у вас BATNA до разговора?","Какие интересы скрываются за заявленной позицией контрагента?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('pon-negotiation-skills', 'Harvard PON: Negotiation skills (Daily)', 'Top Negotiation Skills — PON Daily', 'Harvard PON', 'https://www.pon.harvard.edu/daily/negotiation-skills-daily/top-10-negotiation-skills/', 'Бесплатная статья PON Daily', true, false, 25, 'en', '2026-11-21', 'Короткий чеклист навыков подготовки и ведения переговоров.', 'Статья целиком; выбрать 3 навыка для тренировки на неделе.', 'Какие навыки тренируются действием, а не чтением.', '["Какие 3 навыка вы отработаете на симуляции?","Как измерите улучшение после тренировки?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('strategyzer-library', 'Strategyzer Library', 'Strategyzer Business Strategy Library', 'Strategyzer', 'https://www.strategyzer.com/library', 'Бесплатные обзоры инструментов (Business Model / Value Proposition Canvas). Книги — optional paid.', true, false, 40, 'en', '2026-11-21', 'Визуальные инструменты модели и ценностного предложения.', 'Страницы Business Model Canvas и Value Proposition Canvas + 1 статья из library.', 'Как связать jobs/pains/gains с блоками модели.', '["Какой Job-to-be-done у вашего сегмента?","Какой блок модели самый слабый прямо сейчас?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('strategyzer-bmc', 'Strategyzer: Business Model Canvas', 'The Business Model Canvas', 'Strategyzer', 'https://www.strategyzer.com/canvas/business-model-canvas', 'Официальная страница инструмента Strategyzer; шаблон доступен бесплатно для личного использования', true, false, 30, 'en', '2026-11-21', 'Стандарт описания бизнес-модели на одном листе.', 'Описание 9 блоков; заполнить canvas для своего кейса.', 'Как гипотезы о клиентах стыкуются с каналами и доходами.', '["Какие 2 гипотезы в canvas самые рискованные?","Что вы проверите разговорами на этой неделе?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('sba-business-guide', 'SBA: Business Guide', 'SBA Business Guide', 'SBA', 'https://www.sba.gov/business-guide', 'Официальные бесплатные материалы U.S. Small Business Administration', true, false, 40, 'en', '2026-11-21', 'Практический чеклист запуска и управления малым бизнесом.', 'Разделы Plan / Launch / Manage — выбрать релевантные подкейсу.', 'Какие операционные шаги обязательны после первых продаж.', '["Какой шаг из Manage вы пропустите ценой риска?","Что нужно formalize после 5-й продажи?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('sba-write-business-plan', 'SBA: Write your business plan', 'Write your business plan', 'SBA', 'https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan', 'Официальный бесплатный гайд SBA', true, false, 35, 'en', '2026-11-21', 'Структура плана без «воды» и шаблонных абзацев.', 'Секции market analysis, organization, financial projections overview.', 'Какие разделы плана нужны инвестору/партнёру vs себе.', '["Какой раздел у вас пустой из-за отсутствия данных?","Какой эксперимент закроет этот пробел за неделю?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('sba-market-research', 'SBA: Market research and competitive analysis', 'Market research and competitive analysis', 'SBA', 'https://www.sba.gov/business-guide/plan-your-business/market-research-competitive-analysis', 'Официальный бесплатный гайд SBA', true, false, 35, 'en', '2026-11-21', 'Как делать market research без покупки дорогих отчётов.', 'Методы primary/secondary research из гайда.', 'Чем отличается мнение знакомых от проверяемой гипотезы рынка.', '["Какой primary research вы сделаете на этой неделе?","Каких 3 конкурентов сравните по 5 критериям?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('optional-getting-to-yes', 'Optional: Getting to Yes (книга)', 'Getting to Yes — Fisher, Ury, Patton', 'Harvard PON', 'https://www.pon.harvard.edu/', 'Платная книга — только optional recommendation; покупать легально. В программу не входит файл.', false, true, 0, 'en', '2026-11-21', 'Классика principled negotiation — углубление после free PON.', 'Необязательно; при наличии легальной копии — главы про interests/options.', 'Углублённая практика интересов вместо позиций.', '[]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 1, 'Старт: мышление продавца', true, 'Основатели избегают продаж и путают «рассказать о продукте» с закрытием следующего шага.', '["Собрать карту идеального первого покупателя","Провести 3 разговора по скрипту диагностики","Зафиксировать один измеримый следующий шаг сделки"]'::jsonb, 'Основатели избегают продаж и путают «рассказать о продукте» с закрытием следующего шага.', '["Собрать карту идеального первого покупателя","Провести 3 разговора по скрипту диагностики","Зафиксировать один измеримый следующий шаг сделки"]'::jsonb, '["ICP","следующий шаг","диагностика vs питч","founder-led sales"]'::jsonb, 'Можно ли масштабировать маркетинг до того, как основатель лично закрыл 10 сделок?', 'B2B-сервис: 0 продаж, много «интересно» в чатах. Что меняете в первую неделю?', 'Звонок скептичному ЛПР: у вас 8 минут, цель — календарная встреча, не «рассказ о компании».', '["Где вы избегали прямого запроса следующего шага?","Какой вопрос из discovery оказался самым сильным?"]'::jsonb, '["Питч фич вместо диагностики","Список контактов из «воображаемых компаний»","Нет конкретного CTA в сообщении"]'::jsonb, 'Сделайте 5 исходящих касаний по списку ICP и запишите ответы.'
from public.modules m where m.slug = 'sales-psychology'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 2, 'Психология решения о покупке', false, 'Продавец говорит с одним человеком, а решение принимает система интересов.', '["Построить карту влияния (ЛПР, чемпион, блокировщик)","Связать возражения с интересами, а не с «отмазками»","Провести 1 разговор с фокусом на интересы стейкхолдеров"]'::jsonb, 'Продавец говорит с одним человеком, а решение принимает система интересов.', '["Построить карту влияния (ЛПР, чемпион, блокировщик)","Связать возражения с интересами, а не с «отмазками»","Провести 1 разговор с фокусом на интересы стейкхолдеров"]'::jsonb, '["карта ЛПР","интересы","возражения","покупательский путь"]'::jsonb, 'Всегда ли нужно «отработать возражение» сразу или иногда лучше вернуться к диагностике?', 'Чемпион внутри клиента говорит «да», CFO молчит. Ваш план на 10 дней.', 'Встреча с двумя ролями: энтузиаст и скептик-финансист. Цель — согласованный критерий решения.', '["Чью боль вы игнорировали?","Какое возражение оказалось интересом, а не отказом?"]'::jsonb, '["Персонализация одного контакта как всей компании","Скидка как первая реакция на «дорого»"]'::jsonb, 'В одном реальном/учебном разговоре явно назовите 2 стейкхолдеров и спросите, как они решают.'
from public.modules m where m.slug = 'sales-psychology'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 3, 'Квалификация и следующий шаг', false, 'Воронка забита «тёплыми» лидами без критериев квалификации.', '["Задать критерии go/no-go для лида","Провести 2 квалифицирующих разговора","Отделить nurture от active pipeline"]'::jsonb, 'Воронка забита «тёплыми» лидами без критериев квалификации.', '["Задать критерии go/no-go для лида","Провести 2 квалифицирующих разговора","Отделить nurture от active pipeline"]'::jsonb, '["квалификация","pipeline hygiene","BANT/аналоги","следующий шаг"]'::jsonb, 'Лучше 3 квалифицированных сделки или 20 «интересных» лидов?', 'CRM полна контактов без активности 30 дней. Что удаляете и почему?', 'Лид тянет время. За 6 минут получите либо дату решения, либо честный no-go.', '["Кого вы держали в pipeline из страха пустоты?","Какой критерий оказался лишним?"]'::jsonb, '["Квалификация после демо, а не до","CTA «ну давайте ещё подумаем»"]'::jsonb, 'Закройте один лид как no-go письменно с причиной.'
from public.modules m where m.slug = 'sales-psychology'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 4, 'Midterm 1: продажи и психология', false, 'Нужна проверка, что практика продаж недели 1–3 дала измеримый навык, а не конспекты.', '["Сдать midterm-пакет: ICP, скрипт, карта стейкхолдеров, 2 разговора","Защитить позицию в коротком oral defense","Получить фидбек по рубрике"]'::jsonb, 'Нужна проверка, что практика продаж недели 1–3 дала измеримый навык, а не конспекты.', '["Сдать midterm-пакет: ICP, скрипт, карта стейкхолдеров, 2 разговора","Защитить позицию в коротком oral defense","Получить фидбек по рубрике"]'::jsonb, '["аттестация","портфолио продаж","защита"]'::jsonb, 'Что важнее на midterm: идеальный документ или доказательства реальных разговоров?', 'Кандидат много читал, но не сделал ни одного CTA. Оценка?', 'Защита перед «жёстким» ревьюером: 8 минут + 4 минуты вопросов.', '["Какой пробел вскрыл midterm?","Что вы перенесёте в недели 5–8?"]'::jsonb, '["Пересказ источников без своей практики","Нет артефактов разговоров"]'::jsonb, 'В защите явно назовите одну сделку/разговор и её статус.'
from public.modules m where m.slug = 'sales-psychology'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 5, 'Интересы вместо позиций', false, 'Переговоры скатываются в торг ценой без понимания интересов.', '["Разложить позицию на интересы","Подготовить BATNA до разговора","Предложить 2 опции, создающие ценность"]'::jsonb, 'Переговоры скатываются в торг ценой без понимания интересов.', '["Разложить позицию на интересы","Подготовить BATNA до разговора","Предложить 2 опции, создающие ценность"]'::jsonb, '["интересы","позиции","BATNA","опции"]'::jsonb, 'Всегда ли раскрывать свою BATNA?', 'Клиент требует −30% «потому что так решил директор». Ваш ход без немедленной скидки.', 'Переговоры о сроках и объёме: нельзя соглашаться на цену в первые 5 минут.', '["Где вы уступили без обмена?","Какой вопрос лучше всего вскрыл интерес?"]'::jsonb, '["Торг без подготовки","Скрывать отсутствие BATNA от себя"]'::jsonb, 'В продажном разговоре спросите: «Что для вас важнее — срок, риск или цена?»'
from public.modules m where m.slug = 'negotiation'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 6, 'Подготовка и процесс переговоров', false, 'Сильная позиция разваливается без повестки и критериев соглашения.', '["Собрать prep-пакет переговоров","Вести повестку и фиксировать договорённости","Отделить уступку от обмена"]'::jsonb, 'Сильная позиция разваливается без повестки и критериев соглашения.', '["Собрать prep-пакет переговоров","Вести повестку и фиксировать договорённости","Отделить уступку от обмена"]'::jsonb, '["повестка","критерии","обмен","протокол"]'::jsonb, 'Нужен ли жёсткий протокол в «дружеских» партнёрских переговорах?', 'Партнёр кивает, но ничего не фиксирует письменно. Риск и ваш процесс.', 'Встреча 15 минут: повестка из 3 пунктов, итог — письменные next steps.', '["Какую уступку вы дали бесплатно?","Помог ли prep-пакет?"]'::jsonb, '["Устные «договорились» без owners","Повестка только у одной стороны"]'::jsonb, 'После демо пришлите письмо с 3 пунктами договорённостей в тот же день.'
from public.modules m where m.slug = 'negotiation'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 7, 'Сложные сделки и многосторонние переговоры', false, 'В сделке несколько сторон с разными BATNA — линейный скрипт не работает.', '["Смоделировать 3 стороны сделки","Найти коалицию/блокер","Предложить пакетное соглашение"]'::jsonb, 'В сделке несколько сторон с разными BATNA — линейный скрипт не работает.', '["Смоделировать 3 стороны сделки","Найти коалицию/блокер","Предложить пакетное соглашение"]'::jsonb, '["многосторонность","коалиции","пакеты","эскалация"]'::jsonb, 'Эскалация — признак слабости или инструмент процесса?', 'Интегратор, клиент и ваш стартап спорят о SLA. Соберите пакет.', '15 минут: две стороны + «тихий» блокер, которого нужно выявить вопросами.', '["Кого вы не пригласили в процесс вовремя?","Какой пакет создал ценность?"]'::jsonb, '["Давить на чемпиона вместо работы с блокером","Один issue за раз без пакета"]'::jsonb, 'В сложной сделке назначьте отдельный разговор с каждым ключевым стейкхолдером.'
from public.modules m where m.slug = 'negotiation'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 8, 'Midterm 2: переговоры', false, 'Проверка умения готовиться и вести переговоры на интересах.', '["Сдать prep + протокол + разбор симуляции","Показать обмен вместо односторонних уступок","Защитить решение по кейсу"]'::jsonb, 'Проверка умения готовиться и вести переговоры на интересах.', '["Сдать prep + протокол + разбор симуляции","Показать обмен вместо односторонних уступок","Защитить решение по кейсу"]'::jsonb, '["midterm","BATNA","пакеты"]'::jsonb, 'Можно ли считать переговоры успешными, если цена не изменилась, но риски снизились?', 'Сделка спасена пакетом сроков/объёма без скидки. Разберите механику.', 'Финальная симуляция midterm с таймером и запретом на «подумаем».', '["Какой навык просел под давлением времени?","Что улучшите в prep?"]'::jsonb, '["Нет BATNA","Протокол после встречи «из головы»"]'::jsonb, 'Свяжите итог переговоров с конкретным этапом pipeline.'
from public.modules m where m.slug = 'negotiation'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 9, 'Структура убеждающего выступления', false, 'Презентации начинаются с компании, а не с проблемы слушателя.', '["Собрать структуру: проблема → stakes → proof → ask","Сократить питч до 5 минут","Получить фидбек по ясности"]'::jsonb, 'Презентации начинаются с компании, а не с проблемы слушателя.', '["Собрать структуру: проблема → stakes → proof → ask","Сократить питч до 5 минут","Получить фидбек по ясности"]'::jsonb, '["нарратив","ask","доказательства","аудитория"]'::jsonb, 'Нужны ли слайды на первом питче клиенту?', 'Фаундер 12 минут рассказывает историю компании — сделка не двигается. Перепишите структуру.', 'Питч инвестору-скептику: 5 минут + 3 жёстких вопроса.', '["Где вы потеряли внимание?","Был ли ask достаточно конкретным?"]'::jsonb, '["Начало с «мы команда…»","Ask «поддержите нас» без действия"]'::jsonb, 'В конце питча назовите дату/формат следующего шага и спросите согласие.'
from public.modules m where m.slug = 'presentation-speaking'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 10, 'Слайды, доказательства, анти-шум', false, 'Слайды перегружены текстом; доказательства слабые или нерелевантные.', '["Сделать колоду ≤8 слайдов","Каждый слайд — один тезис","Подобрать proof под аудиторию"]'::jsonb, 'Слайды перегружены текстом; доказательства слабые или нерелевантные.', '["Сделать колоду ≤8 слайдов","Каждый слайд — один тезис","Подобрать proof под аудиторию"]'::jsonb, '["визуальная иерархия","доказательства","один тезис"]'::jsonb, 'Лучше один сильный кейс или пять слабых логотипов «клиентов»?', 'В колоде 22 слайда. Сократите до 7, сохранив ask.', 'Показ слайдов без чтения текста со слайда вслух.', '["Какой слайд можно удалить без потери смысла?","Какой proof самый слабый?"]'::jsonb, '["Стена текста","Proof, не связанный с утверждением"]'::jsonb, 'Один слайд посвятите риску клиента и как вы его снижаете.'
from public.modules m where m.slug = 'presentation-speaking'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 11, 'Публичная защита и голос', false, 'Даже сильный текст проваливается из-за темпа, глаз и неуверенного ask.', '["Отработать темп и паузы","Выдержать Q&A без ухода в оправдания","Записать и разобрать прогон"]'::jsonb, 'Даже сильный текст проваливается из-за темпа, глаз и неуверенного ask.', '["Отработать темп и паузы","Выдержать Q&A без ухода в оправдания","Записать и разобрать прогон"]'::jsonb, '["присутствие","пауза","Q&A","голос"]'::jsonb, 'Стоит ли признавать незнание вслух на защите?', 'Спикер теряет нить после вопроса о unit-экономике. Восстановление за 30 секунд.', 'Защита стоя: без чтения со слайдов, таймер на Q&A.', '["Какой вопрос выбивает вас чаще всего?","Помогла ли пауза перед ответом?"]'::jsonb, '["Заполнение пауз словами-паразитами","Спор с вопрошающим"]'::jsonb, 'На встрече после возражения сделайте паузу 2 секунды, затем уточняющий вопрос.'
from public.modules m where m.slug = 'presentation-speaking'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 12, 'Midterm 3: презентации', false, 'Аттестация умения убеждать структурой, proof и голосом.', '["Сдать колоду + скрипт + запись","Пройти timed defense","Получить оценку по рубрике выступления"]'::jsonb, 'Аттестация умения убеждать структурой, proof и голосом.', '["Сдать колоду + скрипт + запись","Пройти timed defense","Получить оценку по рубрике выступления"]'::jsonb, '["midterm","питч","защита"]'::jsonb, 'Может ли отличный спикер закрыть слабый оффер?', 'Сильный голос, слабый ask. Итоговая оценка midterm?', 'Финальный питч midterm с неожиданным вопросом про риск.', '["Что улучшилось с недели 9?","Какой блок всё ещё сырой?"]'::jsonb, '["Чтение слайдов","Нет ask"]'::jsonb, 'В ask midterm должен быть коммерческий следующий шаг, не «спасибо за внимание».'
from public.modules m where m.slug = 'presentation-speaking'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 13, 'Сегментация и позиционирование', false, '«Наш продукт для всех» убивает сообщение и продажи.', '["Выбрать один beachhead-сегмент","Сформулировать позиционирование в 1 фразе","Проверить сообщение на 3 людях"]'::jsonb, '«Наш продукт для всех» убивает сообщение и продажи.', '["Выбрать один beachhead-сегмент","Сформулировать позиционирование в 1 фразе","Проверить сообщение на 3 людях"]'::jsonb, '["сегмент","позиционирование","beachhead","сообщение"]'::jsonb, 'Уже ли сужать сегмент, если «рынок большой»?', 'Два фаундера тянут продукт в разные сегменты. Критерий решения.', 'Объясните позиционирование за 60 секунд незнакомому человеку.', '["Что вы исключили из ICP и почему?","Какое сообщение зашло лучше?"]'::jsonb, '["Сегмент = демография без боли","Позиционирование через фичи"]'::jsonb, 'Все касания недели только в выбранный beachhead.'
from public.modules m where m.slug = 'marketing-discovery'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 14, 'Customer discovery на практике', false, 'Интервью превращаются в скрытый питч.', '["Провести 4 discovery-интервью по правилам","Отделить факты от интерпретаций","Обновить гипотезы после разговоров"]'::jsonb, 'Интервью превращаются в скрытый питч.', '["Провести 4 discovery-интервью по правилам","Отделить факты от интерпретаций","Обновить гипотезы после разговоров"]'::jsonb, '["гипотеза","интервью","факт vs мнение","Mom Test-принципы (без пиратства книги)"]'::jsonb, 'Можно ли считать друзей валидными респондентами на старте?', 'Все кивают «круто», но никто не даёт время/деньги. Диагноз.', 'Интервью, где собеседник уводит в питч — верните к прошлому поведению.', '["Где вы продавали вместо исследования?","Какая цитата изменила гипотезу?"]'::jsonb, '["Наводящие вопросы","Выводы без цитат"]'::jsonb, 'После discovery попросите интро к тому, у кого боль острее.'
from public.modules m where m.slug = 'marketing-discovery'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 15, 'Каналы и inbound-эксперимент', false, 'Маркетинг без эксперимента = бесконечный контент без лидов.', '["Выбрать 1 канал на 7 дней","Запустить мини-эксперимент с метрикой","Связать лид с разговором, не с лайком"]'::jsonb, 'Маркетинг без эксперимента = бесконечный контент без лидов.', '["Выбрать 1 канал на 7 дней","Запустить мини-эксперимент с метрикой","Связать лид с разговором, не с лайком"]'::jsonb, '["канал","эксперимент","конверсия в разговор","inbound"]'::jsonb, 'Нужен ли блог до первых 10 продаж?', '1000 просмотров, 0 разговоров. Что меняете завтра?', 'За 20 минут придумайте оффер-лидмагнит, ведущий к созвону.', '["Метрика была про тщеславие или про продажи?","Хватило ли фокуса на одном канале?"]'::jsonb, '["5 каналов сразу","Оптимизация просмотров"]'::jsonb, 'Каждый лид из эксперимента получает личное касание в 24 часа.'
from public.modules m where m.slug = 'marketing-discovery'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 16, 'Midterm 4: маркетинг и discovery', false, 'Проверка, что сегмент, discovery и канал связаны с продажами.', '["Сдать пакет: сегмент, интервью, эксперимент","Защитить beachhead","Показать связь маркетинга и pipeline"]'::jsonb, 'Проверка, что сегмент, discovery и канал связаны с продажами.', '["Сдать пакет: сегмент, интервью, эксперимент","Защитить beachhead","Показать связь маркетинга и pipeline"]'::jsonb, '["midterm","beachhead","эксперимент"]'::jsonb, 'Что важнее на midterm: красивый canvas или 4 жёстких цитаты клиентов?', 'Эксперимент «почти сработал». Iterate или kill?', 'Защита beachhead перед оппонентом, который предлагает другой сегмент.', '["Какая гипотеза умерла?","Что переносите в операции?"]'::jsonb, '["Маркетинг без связи с разговорами","Сегмент не сужен"]'::jsonb, 'Покажите в midterm хотя бы 3 квалифицированных касания из beachhead.'
from public.modules m where m.slug = 'marketing-discovery'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 17, 'После «да»: операционное исполнение', false, 'Продажа закрыта, но onboarding и delivery разваливают доверие.', '["Описать процесс от оплаты до первой ценности","Найти bottleneck","Связать SLA обещаний с продажным скриптом"]'::jsonb, 'Продажа закрыта, но onboarding и delivery разваливают доверие.', '["Описать процесс от оплаты до первой ценности","Найти bottleneck","Связать SLA обещаний с продажным скриптом"]'::jsonb, '["onboarding","время до ценности","handoff sales→ops"]'::jsonb, 'Кто виноват в churn на 2-й неделе — продажи или ops?', 'Продавец пообещал кастом, ops не может. Как чинить систему?', 'Kickoff с недовольным клиентом после overpromise.', '["Какое обещание продаж вы бы запретили?","Где теряется время до ценности?"]'::jsonb, '["Продажа без capacity","Нет владельца onboarding"]'::jsonb, 'В оффере назовите срок first value и что нужно от клиента.'
from public.modules m where m.slug = 'ops-economics'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 18, 'Unit-экономика для разговора о цене', false, 'Цена ставится «как у конкурентов» без понимания вклада сделки.', '["Оценить грубый CAC и вклад сделки","Связать скидку с экономикой","Подготовить ценовой разговор на фактах"]'::jsonb, 'Цена ставится «как у конкурентов» без понимания вклада сделки.', '["Оценить грубый CAC и вклад сделки","Связать скидку с экономикой","Подготовить ценовой разговор на фактах"]'::jsonb, '["CAC","вклад","скидка как инвестиция","payback"]'::jsonb, 'Можно ли продавать ниже вклада ради логотипа?', 'Большой бренд просит −40%. Посчитайте и решите.', 'Ценовой звонок: у вас есть floor и 2 пакета обмена.', '["Какое допущение в модели самое хрупкое?","Где скидка была страхом?"]'::jsonb, '["Скидка без обмена","CAC «из головы» без лога касаний"]'::jsonb, 'Перед скидкой назовите ценность в деньгах/риске клиента.'
from public.modules m where m.slug = 'ops-economics'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 19, 'Качество исполнения и обратная связь клиента', false, 'Нет системы сбора сигналов после продажи — проблемы всплывают как churn.', '["Ввести короткий feedback-цикл","Связать NPS/сигналы с улучшениями","Закрыть 1 операционный дефект"]'::jsonb, 'Нет системы сбора сигналов после продажи — проблемы всплывают как churn.', '["Ввести короткий feedback-цикл","Связать NPS/сигналы с улучшениями","Закрыть 1 операционный дефект"]'::jsonb, '["feedback loop","качество","закрытие дефекта"]'::jsonb, 'Нужен ли NPS на 5 клиентах или достаточно качественных интервью?', 'Клиент «всё ок», но не продлевает. Какие вопросы вы не задали?', 'Звонок сбора фидбека без перехода в upsell первые 8 минут.', '["Какой сигнал вы раньше игнорировали?","Дефект реально закрыт?"]'::jsonb, '["Сбор фидбека без владельца фикса","Upsell вместо слушания"]'::jsonb, 'Добавьте в CRM поле «риск churn» и заполните его после kickoff.'
from public.modules m where m.slug = 'ops-economics'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 20, 'Midterm 5: операции и экономика', false, 'Проверка связки продажи → delivery → экономика.', '["Сдать process map + модель экономики + политику скидок","Защитить ценовое решение","Показать устранение дефекта"]'::jsonb, 'Проверка связки продажи → delivery → экономика.', '["Сдать process map + модель экономики + политику скидок","Защитить ценовое решение","Показать устранение дефекта"]'::jsonb, '["midterm","CAC","delivery"]'::jsonb, 'Что чинить первым: CAC или время до ценности?', 'Рост продаж при росте churn. Диагноз midterm.', 'Клиент: «у конкурента дешевле». Ответ пакетом ценности.', '["Где модель расходится с реальностью?","Какой процесс всё ещё держится на геройстве?"]'::jsonb, '["Экономика без логов","Процесс только на слайде"]'::jsonb, 'В midterm покажите одну сделку с посчитанным вкладом.'
from public.modules m where m.slug = 'ops-economics'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 21, 'Бизнес-модель как система', false, 'Отдельные навыки не складываются в работающую модель.', '["Заполнить Business Model Canvas честно","Пометить 3 самых рискованных гипотезы","Связать блоки canvas с продажами недели"]'::jsonb, 'Отдельные навыки не складываются в работающую модель.', '["Заполнить Business Model Canvas честно","Пометить 3 самых рискованных гипотезы","Связать блоки canvas с продажами недели"]'::jsonb, '["BMC","гипотезы","риск","система"]'::jsonb, 'Canvas — стратегия или список wishful thinking?', 'Красивый canvas, 0 платящих. Что выкидываете первым?', 'Объясните модель за 3 минуты инвестору, затем за 3 минуты клиенту.', '["Какой блок вы заполняли фантазией?","Какой тест самый дешёвый?"]'::jsonb, '["Пустые каналы «SMM»","Доходы без подтверждённой цены"]'::jsonb, 'Один блок Channels должен вести к конкретным касаниям на этой неделе.'
from public.modules m where m.slug = 'systems-leadership'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 22, 'Система продаж основателя', false, 'Продажи зависят от настроения, а не от ритма.', '["Собрать weekly sales operating rhythm","Определить leading indicators","Провести неделю по ритму"]'::jsonb, 'Продажи зависят от настроения, а не от ритма.', '["Собрать weekly sales operating rhythm","Определить leading indicators","Провести неделю по ритму"]'::jsonb, '["ритм","leading indicators","pipeline review"]'::jsonb, 'Нормы активности мотивируют или превращают продажи в спам?', 'Неделя «занят продуктом» — pipeline встал. Как ритм это ловит?', 'Pipeline review, где один лид «висит» 3 недели — решение сейчас.', '["Какой leading indicator вы игнорировали?","Ритм реалистичен?"]'::jsonb, '["Только revenue как метрика недели","Нет времени на prospecting"]'::jsonb, 'Выполните норму касаний 5 дней подряд и сдайте лог.'
from public.modules m where m.slug = 'systems-leadership'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 23, 'Лидерство влияния без формальной власти', false, 'Нужно двигать сделки и решения через людей, которые вам не подчиняются.', '["Составить карту влияния в клиенте/команде","Запросить помощь/интро без давления","Провести сложный разговор о риске"]'::jsonb, 'Нужно двигать сделки и решения через людей, которые вам не подчиняются.', '["Составить карту влияния в клиенте/команде","Запросить помощь/интро без давления","Провести сложный разговор о риске"]'::jsonb, '["влияние","социальный капитал","трудный разговор"]'::jsonb, 'Можно ли «продавить» сделку через чемпиона в обход блокера?', 'Внутренний спонсор пропал. Ваш план восстановления влияния.', 'Просьба об интро у занятого контакта — 90 секунд.', '["Где вы манипулировали вместо ясности?","Какой кредит доверия вы уже заработали?"]'::jsonb, '["Обход стейкхолдера втихую","Размытая просьба"]'::jsonb, 'Запросите одно интро с чёткой формулировкой ценности для обеих сторон.'
from public.modules m where m.slug = 'systems-leadership'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 24, 'Midterm 6: системы и лидерство', false, 'Проверка целостности модели, ритма продаж и влияния.', '["Сдать BMC + sales rhythm + карта влияния","Защитить систему целиком","Показать доказательства исполнения ритма"]'::jsonb, 'Проверка целостности модели, ритма продаж и влияния.', '["Сдать BMC + sales rhythm + карта влияния","Защитить систему целиком","Показать доказательства исполнения ритма"]'::jsonb, '["midterm","система","ритм"]'::jsonb, 'Система без харизмы продавца — достаточна ли?', 'Ритм соблюдён, конверсия падает. Что диагностируете?', 'Защита системы перед «советом» из двух ролей.', '["Какой блок системы всё ещё на геройстве?","Готовы ли к финалу?"]'::jsonb, '["Canvas без логов продаж","Метрики без порогов"]'::jsonb, 'В защите покажите живой pipeline и следующий шаг по топ-3 сделкам.'
from public.modules m where m.slug = 'systems-leadership'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 25, 'Финальная аттестация — сборка портфолио', false, 'Нужно собрать доказательную базу курса, а не «ещё один эссе».', '["Собрать портфолио артефактов недель 1–24","Выбрать финальный коммерческий кейс","Закрыть пробелы в доказательствах"]'::jsonb, 'Нужно собрать доказательную базу курса, а не «ещё один эссе».', '["Собрать портфолио артефактов недель 1–24","Выбрать финальный коммерческий кейс","Закрыть пробелы в доказательствах"]'::jsonb, '["портфолио","доказательства","финальный кейс"]'::jsonb, 'Что важнее в финале: рост метрик или качество мышления о провалах?', 'У участника мало «побед», но сильный разбор ошибок. Как оценивать?', 'Чёрный ящик вопросов по любому модулю курса.', '["Какой артефакт самый сильный?","Где вы всё ещё имитируете прогресс?"]'::jsonb, '["Портфолио из конспектов без практики","Нет сквозного кейса"]'::jsonb, 'В кейсе должна быть линия реальных/учебных касаний с датами.'
from public.modules m where m.slug = 'final-attestation'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.weeks (module_id, week_number, title_ru, is_unlocked, summary_ru, learning_goals, problem_ru, outcomes, concepts, debate_ru, case_ru, simulation_ru, reflection, error_watchlist, sales_drill_ru)
select m.id, 26, 'Финальная аттестация — защита', false, 'Итоговая защита: связать продажи, переговоры, маркетинг, ops и модель.', '["Сдать финальный пакет","Пройти защиту 15+10","Зафиксировать план практики на 30 дней после курса"]'::jsonb, 'Итоговая защита: связать продажи, переговоры, маркетинг, ops и модель.', '["Сдать финальный пакет","Пройти защиту 15+10","Зафиксировать план практики на 30 дней после курса"]'::jsonb, '["final","защита","план после курса"]'::jsonb, 'Курс успешен, если изменилось поведение в продажах — согласны?', 'Итог: что считать выпускным стандартом для обоих участников.', 'Финальная защита с эскалацией сложных вопросов по всем модулям.', '["Какое поведение изменилось устойчиво?","Что продолжите измерять?"]'::jsonb, '["Защита без цифр и дат","План на 30 дней из общих слов"]'::jsonb, 'Назовите 3 сделки/разговора следующего месяца и первый шаг по каждой.'
from public.modules m where m.slug = 'final-attestation'
on conflict (week_number) do update set title_ru = excluded.title_ru, summary_ru = excluded.summary_ru, problem_ru = excluded.problem_ru, outcomes = excluded.outcomes, concepts = excluded.concepts, debate_ru = excluded.debate_ru, case_ru = excluded.case_ru, simulation_ru = excluded.simulation_ru, reflection = excluded.reflection, error_watchlist = excluded.error_watchlist, sales_drill_ru = excluded.sales_drill_ru;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 45, 1
from public.weeks w, public.sources s where w.week_number = 1 and s.slug = 'yc-sales-playbook'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 60, 2
from public.weeks w, public.sources s where w.week_number = 1 and s.slug = 'hubspot-inbound-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 0, 3
from public.weeks w, public.sources s where w.week_number = 1 and s.slug = 'optional-getting-to-yes'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W01-A', 'A', 'Карта ICP и 10 контактов', 'Опишите идеального покупателя (роль, боль, триггер). Составьте список из 10 реальных контактов и черновик первого сообщения. Сдайте текст 400–700 слов + список.', 'text', 70
from public.weeks w where w.week_number = 1
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W01-B', 'B', 'Скрипт диагностики на 5 вопросов', 'Напишите скрипт discovery-звонка: открытие, 5 вопросов, резюме боли, запрос следующего шага. Прогоните вслух 2 раза и приложите самозаметки.', 'text', 70
from public.weeks w where w.week_number = 1
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W01-JOINT', 'both', 'Разбор двух скриптов', 'Обсудите скрипты A и B: где давление, где ясность, какой следующий шаг сильнее. Зафиксируйте общую версию v1.', 'text', 40
from public.weeks w where w.week_number = 1
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 50, 1
from public.weeks w, public.sources s where w.week_number = 2 and s.slug = 'openstax-principles-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 45, 2
from public.weeks w, public.sources s where w.week_number = 2 and s.slug = 'openstax-organizational-behavior'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W02-A', 'A', 'Карта стейкхолдеров по кейсу', 'Выберите реальный или учебный B2B-кейс. Нарисуйте карту: роли, интересы, риски, влияние. 1 страница + легензии.', 'text', 75
from public.weeks w where w.week_number = 2
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W02-B', 'B', 'Разбор 5 возражений', 'Соберите 5 типичных возражений. Для каждого: скрытый интерес, уточняющий вопрос, ответ без скидки «в пустоту».', 'text', 75
from public.weeks w where w.week_number = 2
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W02-JOINT', 'both', 'Совместная карта сделки', 'Сведите карты A/B в одну: кто блокирует, кто ускоряет, какой следующий разговор нужен.', 'text', 35
from public.weeks w where w.week_number = 2
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 50, 1
from public.weeks w, public.sources s where w.week_number = 3 and s.slug = 'hubspot-inbound-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 50, 2
from public.weeks w, public.sources s where w.week_number = 3 and s.slug = 'yc-sales-marketing-talk'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W03-A', 'A', 'Критерии квалификации v1', 'Опишите 6 критериев квалификации под ваш кейс и таблицу: лид → статус → причина → следующий шаг.', 'text', 70
from public.weeks w where w.week_number = 3
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W03-B', 'B', '2 разговора + заметки', 'Проведите 2 discovery (реальные или ролевые с таймером). Сдайте заметки: боль, критерии, статус, CTA.', 'text', 80
from public.weeks w where w.week_number = 3
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W03-JOINT', 'both', 'Чистка pipeline', 'Совместно пройдитесь по 8 вымышленным/учебным лидам и решите: active / nurture / drop.', 'text', 35
from public.weeks w where w.week_number = 3
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 1
from public.weeks w, public.sources s where w.week_number = 4 and s.slug = 'yc-sales-playbook'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 2
from public.weeks w, public.sources s where w.week_number = 4 and s.slug = 'openstax-principles-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W04-A', 'A', 'Midterm A: портфолио продавца', 'Соберите пакет: ICP, сообщения, скрипт, карта стейкхолдеров, лог касаний. Самооценка по рубрике.', 'doc', 90
from public.weeks w where w.week_number = 4
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W04-B', 'B', 'Midterm B: oral defense 8 мин', 'Подготовьте защиту: гипотеза покупателя, доказательства из разговоров, следующий эксперимент. Сдайте структуру + запись/заметки прогона.', 'defense', 90
from public.weeks w where w.week_number = 4
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W04-JOINT', 'both', 'Взаимное ревью midterm', 'Обменяйтесь пакетами, дайте фидбек по 4 критериям рубрики, без переписывания чужой работы.', 'text', 40
from public.weeks w where w.week_number = 4
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 1
from public.weeks w, public.sources s where w.week_number = 5 and s.slug = 'pon-harvard-home'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 2
from public.weeks w, public.sources s where w.week_number = 5 and s.slug = 'pon-negotiation-skills'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 3
from public.weeks w, public.sources s where w.week_number = 5 and s.slug = 'openstax-organizational-behavior'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W05-A', 'A', 'Подготовка: интересы и BATNA', 'Для учебного кейса: ваша позиция, 3 интереса, BATNA, резерв, 2 опции win-win. Таблица на 1 стр.', 'text', 70
from public.weeks w where w.week_number = 5
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W05-B', 'B', 'Карта интересов контрагента', 'Смоделируйте интересы другой стороны и вопросы для проверки гипотез. Не придумывайте «магические» уступки.', 'text', 70
from public.weeks w where w.week_number = 5
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W05-JOINT', 'both', 'Симуляция 12 минут', 'Сыграйте кейс по ролям A/B, затем разберите: где ушли в позиции, где нашли опцию.', 'text', 45
from public.weeks w where w.week_number = 5
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 1
from public.weeks w, public.sources s where w.week_number = 6 and s.slug = 'pon-negotiation-skills'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 2
from public.weeks w, public.sources s where w.week_number = 6 and s.slug = 'sba-business-guide'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 3
from public.weeks w, public.sources s where w.week_number = 6 and s.slug = 'yc-sales-playbook'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W06-A', 'A', 'Prep-пакет переговоров', 'Шаблон: цели, красные линии, вопросы, пакет обмена (если/то), критерии успеха встречи.', 'text', 75
from public.weeks w where w.week_number = 6
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W06-B', 'B', 'Протокол договорённостей', 'После симуляции оформите протокол: что согласовано, что открыто, владельцы, даты.', 'text', 65
from public.weeks w where w.week_number = 6
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W06-JOINT', 'both', 'Переговоры с обменом', 'Симуляция: каждая уступка только в паре с встречным условием. Разбор записи/заметок.', 'text', 45
from public.weeks w where w.week_number = 6
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 1
from public.weeks w, public.sources s where w.week_number = 7 and s.slug = 'pon-harvard-home'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 45, 2
from public.weeks w, public.sources s where w.week_number = 7 and s.slug = 'mit-new-enterprises'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 3
from public.weeks w, public.sources s where w.week_number = 7 and s.slug = 'openstax-organizational-behavior'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W07-A', 'A', 'Модель трёхсторонней сделки', 'Опишите стороны, интересы, BATNA, возможные коалиции. Предложите пакет условий.', 'text', 75
from public.weeks w where w.week_number = 7
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W07-B', 'B', 'План эскалации', 'Когда эскалировать, к кому, с каким пакетом фактов. Скрипт эскалационного письма.', 'text', 70
from public.weeks w where w.week_number = 7
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W07-JOINT', 'both', 'Симуляция трёх ролей', 'Один ведёт, второй — вторая сторона, третий — наблюдатель с чеклистом ошибок. Ротация.', 'text', 45
from public.weeks w where w.week_number = 7
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 1
from public.weeks w, public.sources s where w.week_number = 8 and s.slug = 'pon-negotiation-skills'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 2
from public.weeks w, public.sources s where w.week_number = 8 and s.slug = 'pon-harvard-home'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W08-A', 'A', 'Midterm A: negotiation dossier', 'Пакет: prep, карта интересов, BATNA, опции, протокол симуляции, самооценка.', 'doc', 95
from public.weeks w where w.week_number = 8
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W08-B', 'B', 'Midterm B: live negotiation defense', '10-минутная симуляция + 5 минут разбора своих ошибок. Сдайте план и заметки наблюдателя.', 'defense', 95
from public.weeks w where w.week_number = 8
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W08-JOINT', 'both', 'Кросс-ревью midterm', 'Оцените пакет партнёра по рубрике; один must-fix на следующую фазу.', 'text', 35
from public.weeks w where w.week_number = 8
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 50, 1
from public.weeks w, public.sources s where w.week_number = 9 and s.slug = 'mit-entrepreneurial-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 2
from public.weeks w, public.sources s where w.week_number = 9 and s.slug = 'yc-startup-ideas'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 3
from public.weeks w, public.sources s where w.week_number = 9 and s.slug = 'strategyzer-library'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W09-A', 'A', 'Скрипт 5-минутного питча', 'Текст питча с таймингами по блокам. Ask должен быть конкретным (встреча/пилот/интро).', 'text', 75
from public.weeks w where w.week_number = 9
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W09-B', 'B', 'Карта аудитории', 'Для 2 аудиторий (клиент / партнёр) опишите заботы, возражения, какой proof нужен.', 'text', 70
from public.weeks w where w.week_number = 9
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W09-JOINT', 'both', 'Прогон питчей', 'Каждый выступает 5 минут, партнер даёт фидбек только по структуре и ask.', 'text', 45
from public.weeks w where w.week_number = 9
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 45, 1
from public.weeks w, public.sources s where w.week_number = 10 and s.slug = 'mit-marketing-management'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 55, 2
from public.weeks w, public.sources s where w.week_number = 10 and s.slug = 'hubspot-inbound-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W10-A', 'A', 'Колода питча v1', '8 слайдов max. На каждом: заголовок-тезис. Сдайте outline + заметки спикера.', 'slides', 85
from public.weeks w where w.week_number = 10
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W10-B', 'B', 'Матрица доказательств', 'Таблица: утверждение → тип proof → источник/факт → риск недоверия.', 'text', 70
from public.weeks w where w.week_number = 10
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W10-JOINT', 'both', 'Редактура колоды', 'Вычеркните вместе 30% текста. Проверьте, что ask на последнем слайде ясен.', 'text', 40
from public.weeks w where w.week_number = 10
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 1
from public.weeks w, public.sources s where w.week_number = 11 and s.slug = 'yc-sales-playbook'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 2
from public.weeks w, public.sources s where w.week_number = 11 and s.slug = 'pon-negotiation-skills'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 3
from public.weeks w, public.sources s where w.week_number = 11 and s.slug = 'openstax-entrepreneurship'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W11-A', 'A', 'Запись прогона 5 мин', 'Запишите питч (аудио/видео). Саморазбор: темп, паразиты, ясность ask. Список 3 правок.', 'audio_note', 80
from public.weeks w where w.week_number = 11
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W11-B', 'B', 'Банк ответов на 8 вопросов', 'Подготовьте короткие ответы на типовые жёсткие вопросы (цена, конкуренты, риски, сроки).', 'text', 75
from public.weeks w where w.week_number = 11
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W11-JOINT', 'both', 'Q&A-спарринг', 'По очереди задавайте неудобные вопросы 7 минут. Запрещены оправдания длиннее 40 секунд.', 'text', 45
from public.weeks w where w.week_number = 11
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 1
from public.weeks w, public.sources s where w.week_number = 12 and s.slug = 'mit-entrepreneurial-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 2
from public.weeks w, public.sources s where w.week_number = 12 and s.slug = 'strategyzer-bmc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W12-A', 'A', 'Midterm A: pitch package', 'Колода ≤8, скрипт, матрица proof, самооценка.', 'slides', 95
from public.weeks w where w.week_number = 12
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W12-B', 'B', 'Midterm B: live pitch + Q&A', '5+5 минут. Сдайте план и лист фидбека партнёра.', 'defense', 95
from public.weeks w where w.week_number = 12
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W12-JOINT', 'both', 'Жюри друг для друга', 'Оцените по рубрике; один комплимент и один must-fix.', 'text', 40
from public.weeks w where w.week_number = 12
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 55, 1
from public.weeks w, public.sources s where w.week_number = 13 and s.slug = 'mit-entrepreneurial-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 2
from public.weeks w, public.sources s where w.week_number = 13 and s.slug = 'sba-market-research'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 3
from public.weeks w, public.sources s where w.week_number = 13 and s.slug = 'strategyzer-library'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W13-A', 'A', 'Выбор beachhead', 'Сравните 3 сегмента по боли, доступности, платежеспособности. Выберите один и обоснуйте.', 'text', 75
from public.weeks w where w.week_number = 13
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W13-B', 'B', 'Позиционирование и тест сообщения', '1 фраза позиционирования + 3 варианта сообщения. Протестируйте на 3 людях, сдайте заметки.', 'text', 80
from public.weeks w where w.week_number = 13
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W13-JOINT', 'both', 'Согласование сегмента', 'Выберите общий beachhead на 4 недели и список 15 контактов в нём.', 'text', 35
from public.weeks w where w.week_number = 13
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 1
from public.weeks w, public.sources s where w.week_number = 14 and s.slug = 'yc-startup-ideas'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 50, 2
from public.weeks w, public.sources s where w.week_number = 14 and s.slug = 'mit-new-enterprises'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 3
from public.weeks w, public.sources s where w.week_number = 14 and s.slug = 'sba-market-research'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W14-A', 'A', 'Гид интервью', '10 вопросов, которые нельзя заменить питчем. Цель каждого вопроса. Запрещённые формулировки.', 'text', 65
from public.weeks w where w.week_number = 14
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W14-B', 'B', '4 интервью + синтез', 'Проведите 4 разговора (реальные/ролевые). Таблица: цитата → факт → гипотеза → решение.', 'text', 80
from public.weeks w where w.week_number = 14
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W14-JOINT', 'both', 'Обновление гипотез', 'Какие гипотезы умерли? Какие усилили? Что меняете в оффере на следующей неделе?', 'text', 35
from public.weeks w where w.week_number = 14
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 70, 1
from public.weeks w, public.sources s where w.week_number = 15 and s.slug = 'hubspot-inbound-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 2
from public.weeks w, public.sources s where w.week_number = 15 and s.slug = 'yc-sales-marketing-talk'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W15-A', 'A', 'Дизайн эксперимента', 'Гипотеза, канал, актив, метрика (разговоры), критерий успеха/провала, бюджет времени.', 'text', 70
from public.weeks w where w.week_number = 15
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W15-B', 'B', 'Запуск и лог', 'Запустите актив, ведите лог касаний/ответов 5 дней. Итог: что сработало.', 'text', 90
from public.weeks w where w.week_number = 15
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W15-JOINT', 'both', 'Разбор эксперимента', 'Решите: scale / iterate / kill. Один следующий тест.', 'text', 35
from public.weeks w where w.week_number = 15
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 1
from public.weeks w, public.sources s where w.week_number = 16 and s.slug = 'strategyzer-bmc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 2
from public.weeks w, public.sources s where w.week_number = 16 and s.slug = 'sba-market-research'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 3
from public.weeks w, public.sources s where w.week_number = 16 and s.slug = 'mit-entrepreneurial-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W16-A', 'A', 'Midterm A: discovery & segment dossier', 'Сегмент, позиционирование, 4 интервью, обновлённые гипотезы.', 'doc', 95
from public.weeks w where w.week_number = 16
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W16-B', 'B', 'Midterm B: channel experiment defense', 'Защита эксперимента: метрики, выводы, следующий тест, влияние на продажи.', 'defense', 90
from public.weeks w where w.week_number = 16
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W16-JOINT', 'both', 'Согласование go-to-market на модуль 5', 'Общий beachhead + канал + sales motion на следующие 4 недели.', 'text', 40
from public.weeks w where w.week_number = 16
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 1
from public.weeks w, public.sources s where w.week_number = 17 and s.slug = 'sba-business-guide'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 2
from public.weeks w, public.sources s where w.week_number = 17 and s.slug = 'openstax-intro-business'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 3
from public.weeks w, public.sources s where w.week_number = 17 and s.slug = 'mit-new-enterprises'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W17-A', 'A', 'Карта процесса delivery', 'Шаги от yes до first value, владельцы, SLA, точки фейла. 1 схема + комментарии.', 'text', 75
from public.weeks w where w.week_number = 17
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W17-B', 'B', 'Скрипт handoff', 'Что продавец передаёт в delivery: данные, ожидания, риски. Чеклист kickoff-звонка.', 'text', 70
from public.weeks w where w.week_number = 17
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W17-JOINT', 'both', 'Разбор срыва onboarding', 'Кейс: клиент не активировался 14 дней. Найдите 3 причины и 3 фикса.', 'text', 35
from public.weeks w where w.week_number = 17
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 45, 1
from public.weeks w, public.sources s where w.week_number = 18 and s.slug = 'mit-new-enterprises'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 2
from public.weeks w, public.sources s where w.week_number = 18 and s.slug = 'sba-write-business-plan'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 3
from public.weeks w, public.sources s where w.week_number = 18 and s.slug = 'openstax-intro-business'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W18-A', 'A', 'Грубая модель экономики', 'Оцените CAC канала, средний чек, вклад, payback. Покажите допущения явно.', 'text', 80
from public.weeks w where w.week_number = 18
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W18-B', 'B', 'Прайс и политика скидок', 'Прайс-лист v1 + правила скидок (когда можно/нельзя) + скрипт ценового разговора.', 'text', 75
from public.weeks w where w.week_number = 18
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W18-JOINT', 'both', 'Ценовая симуляция', 'Клиент давит на скидку. Используйте пакет (срок/объём/условия), не «−20% сразу».', 'text', 40
from public.weeks w where w.week_number = 18
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 1
from public.weeks w, public.sources s where w.week_number = 19 and s.slug = 'hubspot-inbound-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 2
from public.weeks w, public.sources s where w.week_number = 19 and s.slug = 'sba-business-guide'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 3
from public.weeks w, public.sources s where w.week_number = 19 and s.slug = 'strategyzer-library'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W19-A', 'A', 'Дизайн feedback-цикла', 'Когда спрашиваем, какие 3 вопроса, кто отвечает, куда пишем, SLA реакции.', 'text', 70
from public.weeks w where w.week_number = 19
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W19-B', 'B', 'Фикс одного дефекта', 'Выберите дефект delivery/sales handoff. До/после, метрика, проверка с клиентом/ролью.', 'text', 85
from public.weeks w where w.week_number = 19
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W19-JOINT', 'both', 'Ревью дефектов', 'Приоритизируйте backlog дефектов по влиянию на деньги и доверие.', 'text', 35
from public.weeks w where w.week_number = 19
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 1
from public.weeks w, public.sources s where w.week_number = 20 and s.slug = 'mit-new-enterprises'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 2
from public.weeks w, public.sources s where w.week_number = 20 and s.slug = 'openstax-intro-business'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W20-A', 'A', 'Midterm A: ops & economics dossier', 'Процесс, экономика, скидки, feedback-цикл, один закрытый дефект.', 'doc', 100
from public.weeks w where w.week_number = 20
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W20-B', 'B', 'Midterm B: pricing defense', 'Защита цены и пакета на симуляции с давлением скидки.', 'defense', 90
from public.weeks w where w.week_number = 20
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W20-JOINT', 'both', 'Согласование коммерческой политики', 'Общие правила: floor цены, скидки, обещания SLA в продажах.', 'text', 40
from public.weeks w where w.week_number = 20
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 1
from public.weeks w, public.sources s where w.week_number = 21 and s.slug = 'strategyzer-bmc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 2
from public.weeks w, public.sources s where w.week_number = 21 and s.slug = 'strategyzer-library'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 45, 3
from public.weeks w, public.sources s where w.week_number = 21 and s.slug = 'openstax-entrepreneurship'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W21-A', 'A', 'BMC v1 с рисками', 'Заполните 9 блоков. Красным — гипотезы без доказательств. План проверки на 14 дней.', 'text', 80
from public.weeks w where w.week_number = 21
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W21-B', 'B', 'Value Proposition Canvas', 'Jobs/pains/gains ↔ продукты/pain relievers/gain creators. Разрывы и фиксы.', 'text', 80
from public.weeks w where w.week_number = 21
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W21-JOINT', 'both', 'Выбор 3 тестов', 'Выберите 3 теста гипотез на 2 недели: метод, метрика, kill-критерий.', 'text', 40
from public.weeks w where w.week_number = 21
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 1
from public.weeks w, public.sources s where w.week_number = 22 and s.slug = 'yc-sales-playbook'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 50, 2
from public.weeks w, public.sources s where w.week_number = 22 and s.slug = 'hubspot-inbound-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 3
from public.weeks w, public.sources s where w.week_number = 22 and s.slug = 'sba-write-business-plan'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W22-A', 'A', 'Sales rhythm design', 'Календарь недели: prospecting, разговоры, follow-up, review. Нормы активности.', 'text', 70
from public.weeks w where w.week_number = 22
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W22-B', 'B', 'Dashboard ведущих метрик', '5 leading metrics + определение каждой + пороги «красная зона».', 'text', 70
from public.weeks w where w.week_number = 22
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W22-JOINT', 'both', 'Pipeline review 20 мин', 'Проведите review по правилам: статус, риск, следующий шаг, просьба помощи.', 'text', 40
from public.weeks w where w.week_number = 22
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 45, 1
from public.weeks w, public.sources s where w.week_number = 23 and s.slug = 'openstax-organizational-behavior'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 2
from public.weeks w, public.sources s where w.week_number = 23 and s.slug = 'pon-harvard-home'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 3
from public.weeks w, public.sources s where w.week_number = 23 and s.slug = 'yc-startup-ideas'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W23-A', 'A', 'Карта влияния', 'Для ключевой сделки/инициативы: кто влияет, чем мотивирован, как вы строите кредит доверия.', 'text', 75
from public.weeks w where w.week_number = 23
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W23-B', 'B', 'Скрипт трудного разговора', 'Разговор о сорванном сроке/риске: факты, влияние, просьба, следующий шаг. Прогон вслух.', 'text', 75
from public.weeks w where w.week_number = 23
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W23-JOINT', 'both', 'Симуляция трудного разговора', 'Роли: вы и контрагент. Наблюдатель отмечает давление vs ясность.', 'text', 45
from public.weeks w where w.week_number = 23
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 1
from public.weeks w, public.sources s where w.week_number = 24 and s.slug = 'strategyzer-bmc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 2
from public.weeks w, public.sources s where w.week_number = 24 and s.slug = 'yc-sales-playbook'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 3
from public.weeks w, public.sources s where w.week_number = 24 and s.slug = 'openstax-entrepreneurship'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W24-A', 'A', 'Midterm A: system dossier', 'BMC, VPC, ритм, метрики, карта влияния, лог недели.', 'doc', 100
from public.weeks w where w.week_number = 24
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W24-B', 'B', 'Midterm B: system defense', '12 минут: как система приводит к сделкам; ответы на атаки по слабым блокам.', 'defense', 95
from public.weeks w where w.week_number = 24
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W24-JOINT', 'both', 'Стресс-тест системы', 'Партнёр атакует 3 слабых гипотезы. Зафиксируйте патчи.', 'text', 40
from public.weeks w where w.week_number = 24
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 1
from public.weeks w, public.sources s where w.week_number = 25 and s.slug = 'sba-write-business-plan'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 2
from public.weeks w, public.sources s where w.week_number = 25 and s.slug = 'strategyzer-bmc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 3
from public.weeks w, public.sources s where w.week_number = 25 and s.slug = 'yc-sales-playbook'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W25-A', 'A', 'Портфолио A: артефакты и кейс', 'Индекс артефактов + выбранный кейс + пробелы. План закрытия пробелов за неделю 26.', 'doc', 100
from public.weeks w where w.week_number = 25
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W25-B', 'B', 'Портфолио B: narrative защиты', 'Скрипт итоговой защиты 12 минут: проблема, практика, результаты, чему научились, ask.', 'defense', 95
from public.weeks w where w.week_number = 25
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W25-JOINT', 'both', 'Репетиция финала', 'Полный прогон защиты + список дыр в доказательствах.', 'text', 50
from public.weeks w where w.week_number = 25
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 1
from public.weeks w, public.sources s where w.week_number = 26 and s.slug = 'mit-new-enterprises'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 2
from public.weeks w, public.sources s where w.week_number = 26 and s.slug = 'pon-negotiation-skills'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 3
from public.weeks w, public.sources s where w.week_number = 26 and s.slug = 'hubspot-inbound-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W26-A', 'A', 'Final A: полный пакет', 'Кейс, экономика, pipeline, BMC, 3 сильных артефакта, план на 30 дней.', 'doc', 100
from public.weeks w where w.week_number = 26
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W26-B', 'B', 'Final B: defense 15+10', 'Защита и Q&A. Сдайте запись/протокол и ответы на 5 заранее неизвестных типов вопросов.', 'defense', 100
from public.weeks w where w.week_number = 26
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;
insert into public.assignments (week_id, code, participant_slot, title_ru, brief_md, deliverable_type, max_minutes)
select w.id, 'W26-JOINT', 'both', 'Взаимная аттестация', 'Оценка по финальной рубрике + одно обязательство практики на месяц.', 'text', 40
from public.weeks w where w.week_number = 26
on conflict (code) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md, max_minutes = excluded.max_minutes, participant_slot = excluded.participant_slot;

insert into public.exams (week_number, kind, title_ru, brief_md)
values (4, 'midterm', 'Промежуточная аттестация 1 — продажи и психология', 'Портфолио ICP/скрипт/стейкхолдеры + oral defense.')
on conflict (week_number, kind) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md;
insert into public.exams (week_number, kind, title_ru, brief_md)
values (8, 'midterm', 'Промежуточная аттестация 2 — переговоры', 'Negotiation dossier + live negotiation defense.')
on conflict (week_number, kind) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md;
insert into public.exams (week_number, kind, title_ru, brief_md)
values (12, 'midterm', 'Промежуточная аттестация 3 — презентации', 'Pitch package + live pitch/Q&A.')
on conflict (week_number, kind) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md;
insert into public.exams (week_number, kind, title_ru, brief_md)
values (16, 'midterm', 'Промежуточная аттестация 4 — маркетинг и discovery', 'Discovery dossier + channel experiment defense.')
on conflict (week_number, kind) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md;
insert into public.exams (week_number, kind, title_ru, brief_md)
values (20, 'midterm', 'Промежуточная аттестация 5 — операции и экономика', 'Ops/economics dossier + pricing defense.')
on conflict (week_number, kind) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md;
insert into public.exams (week_number, kind, title_ru, brief_md)
values (24, 'midterm', 'Промежуточная аттестация 6 — системы и лидерство', 'System dossier + system defense.')
on conflict (week_number, kind) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md;
insert into public.exams (week_number, kind, title_ru, brief_md)
values (25, 'final', 'Финальная аттестация — сборка портфолио', 'Индекс артефактов курса и narrative защиты.')
on conflict (week_number, kind) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md;
insert into public.exams (week_number, kind, title_ru, brief_md)
values (26, 'final', 'Финальная аттестация — защита', 'Полный пакет + defense 15+10.')
on conflict (week_number, kind) do update set title_ru = excluded.title_ru, brief_md = excluded.brief_md;

update public.program_settings set current_unlocked_week = 1, hours_per_week_target = 240, ai_spend_lock = true where id = 1;