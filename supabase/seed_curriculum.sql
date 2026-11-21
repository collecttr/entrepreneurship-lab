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
values ('yc-sales-playbook', 'YC: The Sales Playbook For Founders', 'The Sales Playbook For Founders', 'YC Library', 'https://www.ycombinator.com/library/Mo-the-sales-playbook-for-founders', 'Бесплатно на YC Startup Library', true, false, 45, 'en', '2026-11-21', 'Практический каркас продаж для основателя без отдела продаж.', 'Весь материал плейбука; конспект воронки и следующего шага сделки.', 'Как формулировать оффер, кого звать первым и как закрывать следующий шаг.', '["Кто ваш идеальный первый покупатель и почему именно он?", "Какой следующий конкретный шаг вы просите после звонка?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('yc-startup-ideas', 'YC: How to get startup ideas', 'How to get startup ideas', 'YC Library', 'https://www.ycombinator.com/library/8g-how-to-get-startup-ideas', 'Бесплатно на YC Startup Library', true, false, 35, 'en', '2026-11-21', 'Отделяет «идею ради идеи» от реальной боли пользователя.', 'Эссе целиком; выписать 5 критериев сильной идеи.', 'Почему «solution looking for a problem» проваливается.', '["Какую острую проблему вы видите лучше других?", "Какие «tar pit» идеи вы сознательно отбрасываете?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('yc-sales-marketing-talk', 'YC: Sales and Marketing (How to Start a Startup)', 'How to Start a Startup: Sales and Marketing; How to Talk to Investors', 'YC Library', 'https://www.ycombinator.com/library/dc-how-to-start-a-startup-sales-and-marketing-how-to-talk-to-investors', 'Бесплатно на YC Startup Library', true, false, 50, 'en', '2026-11-21', 'Связка продаж и маркетинга на ранней стадии.', 'Секция про sales/marketing; конспект каналов и метрик.', 'Чем ранние продажи отличаются от «масштабируемого маркетинга».', '["Какой канал даст 10 разговоров на этой неделе?", "Какую метрику вы будете смотреть ежедневно?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('hubspot-inbound-sales', 'HubSpot Academy: Inbound Sales', 'Inbound Sales Course', 'HubSpot Academy', 'https://academy.hubspot.com/courses/inbound-sales', 'Бесплатный курс HubSpot Academy (требуется бесплатный аккаунт)', true, false, 90, 'en', '2026-11-21', 'Структурированный процесс квалификации и ведения сделки.', 'Модули Identify → Connect → Explore → Advise; практические шаблоны.', 'Как вести разговор вокруг проблем покупателя, а не вокруг фич.', '["Какие сигналы показывают, что лид готов к Explore?", "Как вы сформулируете рекомендацию (Advise) без давления?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('hubspot-inbound-marketing', 'HubSpot Academy: Inbound Marketing', 'Inbound Marketing Course', 'HubSpot Academy', 'https://academy.hubspot.com/courses/inbound-marketing', 'Бесплатный курс HubSpot Academy', true, false, 90, 'en', '2026-11-21', 'База привлечения через полезный контент и воронку.', 'Attract / Engage / Delight; выбрать один канал для эксперимента.', 'Как связать контент с этапом покупательского пути.', '["Какой один контент-актив вы сделаете за 2 часа?", "Как измерите, что он привёл к разговору, а не только к просмотрам?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('mit-entrepreneurial-marketing', 'MIT OCW: Entrepreneurial Marketing (15.835)', 'Entrepreneurial Marketing', 'MIT OCW', 'https://ocw.mit.edu/courses/15-835-entrepreneurial-marketing-spring-2002/', 'MIT OpenCourseWare — свободный доступ к материалам курса', true, false, 60, 'en', '2026-11-21', 'Маркетинг при ограниченных ресурсах стартапа.', 'Lecture notes: Market Research, Segmentation and Targeting, Positioning Tools.', 'Как выбрать сегмент и позиционирование без большого бюджета.', '["Какой сегмент вы выберете первым и почему?", "Какое позиционирование отличимо от 2 конкурентов?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('mit-new-enterprises', 'MIT OCW: New Enterprises (15.390)', 'New Enterprises', 'MIT OCW', 'https://ocw.mit.edu/courses/15-390-new-enterprises-spring-2013/', 'MIT OpenCourseWare — свободный доступ', true, false, 70, 'en', '2026-11-21', 'От идеи до go-to-market и unit-экономики.', 'Notes: Target customer, Competition, Sales and distribution, COCA.', 'Связка customer research → CAC → модель захвата ценности.', '["Как клиент узнаёт о продукте и покупает его?", "Какой грубый CAC вы оцениваете для первого канала?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('mit-marketing-management', 'MIT OCW: Marketing Management (15.810)', 'Marketing Management: Analytics, Frameworks, and Applications', 'MIT OCW', 'https://ocw.mit.edu/courses/15-810-marketing-management-analytics-frameworks-and-applications-fall-2015/', 'MIT OpenCourseWare — свободный доступ', true, false, 55, 'en', '2026-11-21', 'Аналитические рамки маркетинговых решений.', 'Обзор курса + выбранные assignments/frameworks из syllabus.', 'Как принимать маркетинговые решения на данных, а не на ощущениях.', '["Какое решение вы сейчас принимаете «на глаз»?", "Какой минимальный набор данных его улучшит?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('openstax-entrepreneurship', 'OpenStax: Entrepreneurship', 'Entrepreneurship', 'OpenStax', 'https://openstax.org/details/books/entrepreneurship', 'OpenStax CC BY — бесплатный учебник', true, false, 50, 'en', '2026-11-21', 'Системное введение в предпринимательство без платного учебника.', 'Главы про opportunity recognition и business models (см. ToC на сайте).', 'Базовый словарь: возможность, модель, ценность, риски.', '["Какую возможность вы формулируете в одном предложении?", "Какие 3 риска самые критичные на старте?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('openstax-principles-marketing', 'OpenStax: Principles of Marketing', 'Principles of Marketing', 'OpenStax', 'https://openstax.org/details/books/principles-marketing', 'OpenStax CC BY — бесплатный учебник', true, false, 50, 'en', '2026-11-21', 'Классика маркетинга: сегментация, 4P, покупательское поведение.', 'Главы про consumer behavior и segmentation (по ToC).', 'Как описать путь решения покупателя до покупки.', '["Какие этапы проходит ваш покупатель до решения?", "Где в пути возникает наибольшее трение?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('openstax-intro-business', 'OpenStax: Introduction to Business', 'Introduction to Business', 'OpenStax', 'https://openstax.org/details/books/introduction-business', 'OpenStax CC BY — бесплатный учебник', true, false, 45, 'en', '2026-11-21', 'Операции, финансы и структура бизнеса на простом языке.', 'Главы про management/operations и financial basics.', 'Как связаны продажи, операционка и денежный поток.', '["Какой операционный bottleneck мешает продажам?", "Где в процессе теряется время после «да» клиента?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('openstax-organizational-behavior', 'OpenStax: Organizational Behavior', 'Organizational Behavior', 'OpenStax', 'https://openstax.org/details/books/organizational-behavior', 'OpenStax CC BY — бесплатный учебник', true, false, 45, 'en', '2026-11-21', 'Психология влияния, мотивации и переговоров в организациях.', 'Главы про communication, power/influence, conflict.', 'Как интересы и статусы влияют на решение «купить / согласиться».', '["Кто неформально влияет на решение у вашего клиента?", "Какой конфликт интересов вы должны назвать вслух?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('pon-harvard-home', 'Harvard PON: Program on Negotiation', 'Program on Negotiation at Harvard Law School', 'Harvard PON', 'https://www.pon.harvard.edu/', 'Бесплатные статьи и ресурсы PON (часть материалов платная — берём только free daily/blog)', true, false, 40, 'en', '2026-11-21', 'Авторитетная школа переговоров: интересы vs позиции.', 'Бесплатные Daily Blog материалы про interests, BATNA, preparation.', 'BATNA, резервная цена, подготовка к переговорам.', '["Какая у вас BATNA до разговора?", "Какие интересы скрываются за заявленной позицией контрагента?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('pon-negotiation-skills', 'Harvard PON: Negotiation skills (Daily)', 'Top Negotiation Skills — PON Daily', 'Harvard PON', 'https://www.pon.harvard.edu/daily/negotiation-skills-daily/top-10-negotiation-skills/', 'Бесплатная статья PON Daily', true, false, 25, 'en', '2026-11-21', 'Короткий чеклист навыков подготовки и ведения переговоров.', 'Статья целиком; выбрать 3 навыка для тренировки на неделе.', 'Какие навыки тренируются действием, а не чтением.', '["Какие 3 навыка вы отработаете на симуляции?", "Как измерите улучшение после тренировки?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('strategyzer-library', 'Strategyzer Library', 'Strategyzer Business Strategy Library', 'Strategyzer', 'https://www.strategyzer.com/library', 'Бесплатные обзоры инструментов (Business Model / Value Proposition Canvas). Книги — optional paid.', true, false, 40, 'en', '2026-11-21', 'Визуальные инструменты модели и ценностного предложения.', 'Страницы Business Model Canvas и Value Proposition Canvas + 1 статья из library.', 'Как связать jobs/pains/gains с блоками модели.', '["Какой Job-to-be-done у вашего сегмента?", "Какой блок модели самый слабый прямо сейчас?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('strategyzer-bmc', 'Strategyzer: Business Model Canvas', 'The Business Model Canvas', 'Strategyzer', 'https://www.strategyzer.com/canvas/business-model-canvas', 'Официальная страница инструмента Strategyzer; шаблон доступен бесплатно для личного использования', true, false, 30, 'en', '2026-11-21', 'Стандарт описания бизнес-модели на одном листе.', 'Описание 9 блоков; заполнить canvas для своего кейса.', 'Как гипотезы о клиентах стыкуются с каналами и доходами.', '["Какие 2 гипотезы в canvas самые рискованные?", "Что вы проверите разговорами на этой неделе?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('sba-business-guide', 'SBA: Business Guide', 'SBA Business Guide', 'SBA', 'https://www.sba.gov/business-guide', 'Официальные бесплатные материалы U.S. Small Business Administration', true, false, 40, 'en', '2026-11-21', 'Практический чеклист запуска и управления малым бизнесом.', 'Разделы Plan / Launch / Manage — выбрать релевантные подкейсу.', 'Какие операционные шаги обязательны после первых продаж.', '["Какой шаг из Manage вы пропустите ценой риска?", "Что нужно formalize после 5-й продажи?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('sba-write-business-plan', 'SBA: Write your business plan', 'Write your business plan', 'SBA', 'https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan', 'Официальный бесплатный гайд SBA', true, false, 35, 'en', '2026-11-21', 'Структура плана без «воды» и шаблонных абзацев.', 'Секции market analysis, organization, financial projections overview.', 'Какие разделы плана нужны инвестору/партнёру vs себе.', '["Какой раздел у вас пустой из-за отсутствия данных?", "Какой эксперимент закроет этот пробел за неделю?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('sba-market-research', 'SBA: Market research and competitive analysis', 'Market research and competitive analysis', 'SBA', 'https://www.sba.gov/business-guide/plan-your-business/market-research-competitive-analysis', 'Официальный бесплатный гайд SBA', true, false, 35, 'en', '2026-11-21', 'Как делать market research без покупки дорогих отчётов.', 'Методы primary/secondary research из гайда.', 'Чем отличается мнение знакомых от проверяемой гипотезы рынка.', '["Какой primary research вы сделаете на этой неделе?", "Каких 3 конкурентов сравните по 5 критериям?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('yc-dont-scale', 'YC: Do things that don''t scale', 'Do things that don''t scale', 'YC Library', 'https://www.ycombinator.com/library/96-do-things-that-dont-scale', 'Бесплатно на YC Startup Library', true, false, 30, 'en', '2026-11-21', 'Ранний рост через ручные, «немасштабируемые» действия основателя.', 'Эссе целиком; выписать 5 ручных тактик под свой кейс.', 'Почему ручные продажи и онбординг важнее «автоматизации» на старте.', '["Какое ручное действие даст вам 5 реальных разговоров на этой неделе?", "Что вы сознательно не автоматизируете до product-market fit?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('yc-pricing-101', 'YC: Startup pricing 101', 'Startup pricing 101', 'YC Library', 'https://www.ycombinator.com/library/6h-startup-pricing-101', 'Бесплатно на YC Startup Library', true, false, 35, 'en', '2026-11-21', 'Практика назначения цены без копирования конкурентов «на глаз».', 'Материал целиком; конспект правил теста цены и пакетов.', 'Как связать цену с ценностью и готовностью платить.', '["Какую цену вы поставите в следующем разговоре и почему?", "Какой эксперимент проверит, что цена не занижена из страха?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('yc-pmf', 'YC: The real product-market fit', 'The real product-market fit', 'YC Library', 'https://www.ycombinator.com/library/5z-growth', 'Бесплатно на YC Startup Library', true, false, 30, 'en', '2026-11-21', 'Отделяет настоящий PMF от «всем нравится идея».', 'Материал целиком; список сигналов PMF vs vanity.', 'Какие доказательства показывают, что сегмент и оффер совпали.', '["Какой сигнал PMF у вас уже есть, а какой отсутствует?", "Что вы перестанете делать, пока нет pull от клиентов?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('yc-product-dev', 'YC: Guide to product development', 'Guide to product development', 'YC Library', 'https://www.ycombinator.com/library/4e-product-development-cycle-fundamentals', 'Бесплатно на YC Startup Library', true, false, 35, 'en', '2026-11-21', 'Цикл разработки продукта без лишних фич «на всякий случай».', 'Основы цикла; связать с гипотезами discovery и продажами.', 'Как приоритезировать фичи под реальные разговоры с клиентами.', '["Какую фичу вы отложите, чтобы успеть сделать 5 продаж?", "Какой feedback-цикл связывает delivery и roadmap?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('mit-entrepreneurial-sales', 'MIT OCW: Entrepreneurial Sales (15.387)', 'Entrepreneurial Sales', 'MIT OCW', 'https://ocw.mit.edu/courses/15-387-entrepreneurial-sales-spring-2015/', 'MIT OpenCourseWare — свободный доступ', true, false, 55, 'en', '2026-11-21', 'Академический каркас продаж на ранней стадии компании.', 'Syllabus + выбранные readings/notes про sales process и pipeline.', 'Как строить повторяемый sales motion, а не разовые «подвиги».', '["Какой этап вашего sales process сейчас самый дырявый?", "Какую метрику pipeline вы введёте на этой неделе?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('mit-power-negotiation', 'MIT OCW: Power and Negotiation (15.665)', 'Power and Negotiation', 'MIT OCW', 'https://ocw.mit.edu/courses/15-665-power-and-negotiation-spring-2014/', 'MIT OpenCourseWare — свободный доступ', true, false, 50, 'en', '2026-11-21', 'Власть, влияние и подготовка к переговорам в организациях.', 'Обзор курса + материалы про preparation, power, multiparty.', 'Как сила сторон и структура сделки меняют тактику.', '["Где у вас реальная сила в сделке, а где только иллюзия?", "Какой multiparty-риск вы не заложили в prep?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('openstax-principles-management', 'OpenStax: Principles of Management', 'Principles of Management', 'OpenStax', 'https://openstax.org/details/books/principles-management', 'OpenStax CC BY — бесплатный учебник', true, false, 45, 'en', '2026-11-21', 'Управление процессами, людьми и решениями без платного MBA-учебника.', 'Главы про decision-making, organizing, leadership (по ToC).', 'Как управленческие решения стыкуются с продажами и исполнением.', '["Какое решение вы делегируете, а какое оставляете за собой?", "Какой управленческий bottleneck тормозит сделки?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('pon-batna-examples', 'Harvard PON: BATNA examples', 'BATNA Examples and What You Can Learn From Them', 'Harvard PON', 'https://www.pon.harvard.edu/daily/batna/batna-examples-and-what-you-can-learn-from-them/', 'Бесплатная статья PON Daily', true, false, 25, 'en', '2026-11-21', 'BATNA на примерах — не абстрактный термин, а запасной план.', 'Статья целиком; выписать свою BATNA и BATNA контрагента.', 'Как слабая/сильная BATNA меняет готовность уступать.', '["Какая у вас BATNA до завтрашнего разговора?", "Что улучшит вашу BATNA без эскалации конфликта?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('pon-batna-power', 'Harvard PON: BATNA as a source of power', 'BATNA in Negotiation: A Key Source of Power', 'Harvard PON', 'https://www.pon.harvard.edu/daily/batna/batna-in-negotiation-a-key-source-of-power/', 'Бесплатная статья PON Daily', true, false, 20, 'en', '2026-11-21', 'Связь BATNA и переговорной силы без агрессии.', 'Статья целиком; 3 действия, усиливающие вашу альтернативу.', 'Почему сила растёт от альтернатив, а не от давления.', '["Какое одно действие усилит вашу BATNA за 48 часов?", "Где вы давите, вместо того чтобы усиливать альтернативу?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('pon-hardball-tactics', 'Harvard PON: Hardball tactics in negotiation', '10 Hardball Tactics in Negotiation', 'Harvard PON', 'https://www.pon.harvard.edu/daily/batna/10-hardball-tactics-in-negotiation/', 'Бесплатная статья PON Daily', true, false, 25, 'en', '2026-11-21', 'Распознать жёсткие приёмы и ответить интересами, а не зеркальной агрессией.', 'Статья целиком; выбрать 3 тактики, которые встречали в продажах.', 'Как отвечать на hardball без скидки «в пустоту».', '["Какой hardball вы встречали чаще всего?", "Какой вопрос возвращает разговор к интересам?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('strategyzer-vpc', 'Strategyzer: Value Proposition Canvas', 'The Value Proposition Canvas', 'Strategyzer', 'https://www.strategyzer.com/canvas/value-proposition-canvas', 'Официальная страница инструмента Strategyzer; шаблон доступен бесплатно для личного использования', true, false, 30, 'en', '2026-11-21', 'Связка jobs/pains/gains с тем, что вы реально предлагаете.', 'Описание VPC; заполнить customer profile + value map для beachhead.', 'Где оффер не попадает в боль сегмента.', '["Какой pain вы закрываете доказанно, а какой только обещаете?", "Какой блок VPC проверите интервью на этой неделе?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('sba-marketing-sales', 'SBA: Marketing and sales', 'Marketing and sales', 'SBA', 'https://www.sba.gov/business-guide/manage-your-business/marketing-sales', 'Официальный бесплатный гайд SBA', true, false, 30, 'en', '2026-11-21', 'Практический чеклист маркетинга и продаж малого бизнеса.', 'Раздел Marketing and sales; выбрать 3 действия на неделю.', 'Как связать привлечение с закрытием сделки, а не с «активностью».', '["Какое одно маркетинговое действие ведёт к разговору?", "Что в вашем sales-процессе всё ещё не записано?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('sba-manage-finances', 'SBA: Manage your finances', 'Manage your finances', 'SBA', 'https://www.sba.gov/business-guide/manage-your-business/manage-your-finances', 'Официальный бесплатный гайд SBA', true, false, 30, 'en', '2026-11-21', 'Денежный контур бизнеса: учёт, поток, базовые финансовые решения.', 'Раздел Manage your finances; связать с ценой и CAC.', 'Почему скидка и отсрочка бьют по cash flow.', '["Какой финансовый показатель вы смотрите еженедельно?", "Где продажа «в кредит доверия» рискует кассой?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('sba-startup-costs', 'SBA: Calculate your startup costs', 'Calculate your startup costs', 'SBA', 'https://www.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs', 'Официальный бесплатный гайд SBA', true, false, 25, 'en', '2026-11-21', 'Честная оценка затрат до и после первых продаж.', 'Гайд по расчёту startup costs; таблица one-time vs recurring.', 'Какие затраты обязательны до первой выручки.', '["Какую статью затрат вы занижали?", "Что можно отложить до первой оплаты клиента?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('hubspot-inbound', 'HubSpot Academy: Inbound', 'Inbound Course', 'HubSpot Academy', 'https://academy.hubspot.com/courses/inbound', 'Бесплатный курс HubSpot Academy (требуется бесплатный аккаунт)', true, false, 70, 'en', '2026-11-21', 'Базовый inbound-метод: привлекать полезностью, а не спамом.', 'Ключевые модули про flywheel / buyer journey; один вывод в практику.', 'Как контент и сервис кормят продажи без холодного давления.', '["Какой этап buyer journey у вас пустой?", "Какой полезный актив вы сделаете вместо ещё одного поста «о компании»?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('hubspot-sales-enablement', 'HubSpot Academy: Sales Enablement', 'Sales Enablement Course', 'HubSpot Academy', 'https://academy.hubspot.com/courses/sales-enablement', 'Бесплатный курс HubSpot Academy (требуется бесплатный аккаунт)', true, false, 60, 'en', '2026-11-21', 'Как давать продавцу (себе) материалы, скрипты и proof для сделок.', 'Модули про enablement-процесс; собрать мини-набор для своей недели.', 'Какие артефакты ускоряют сделку, а какие только засоряют диск.', '["Какой один enablement-артефакт нужен вам до следующего звонка?", "Что из «библиотеки» вы ни разу не использовали в разговоре?"]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;

insert into public.sources (slug, title_ru, title_original, provider, url, license_note, is_free, is_optional_paid, estimated_study_minutes, language, verified_at, why_ru, parts_ru, understand_ru, questions_ru)
values ('optional-getting-to-yes', 'Optional: Getting to Yes (книга)', 'Getting to Yes — Fisher, Ury, Patton', 'Harvard PON', 'https://www.pon.harvard.edu/', 'Платная книга — только optional recommendation; покупать легально. В программу не входит файл.', false, true, 0, 'en', '2026-11-21', 'Классика principled negotiation — углубление после free PON.', 'Необязательно; при наличии легальной копии — главы про interests/options.', 'Углублённая практика интересов вместо позиций.', '[]'::jsonb)
on conflict (slug) do update set title_ru = excluded.title_ru, url = excluded.url, estimated_study_minutes = excluded.estimated_study_minutes, why_ru = excluded.why_ru, parts_ru = excluded.parts_ru, understand_ru = excluded.understand_ru, questions_ru = excluded.questions_ru, is_free = excluded.is_free, is_optional_paid = excluded.is_optional_paid, license_note = excluded.license_note;


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
select w.id, s.id, true, 50, 2
from public.weeks w, public.sources s where w.week_number = 1 and s.slug = 'hubspot-inbound-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 3
from public.weeks w, public.sources s where w.week_number = 1 and s.slug = 'sba-marketing-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 30, 4
from public.weeks w, public.sources s where w.week_number = 1 and s.slug = 'yc-dont-scale'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 40, 5
from public.weeks w, public.sources s where w.week_number = 1 and s.slug = 'mit-entrepreneurial-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 0, 6
from public.weeks w, public.sources s where w.week_number = 1 and s.slug = 'optional-getting-to-yes'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 45, 1
from public.weeks w, public.sources s where w.week_number = 2 and s.slug = 'openstax-principles-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 2
from public.weeks w, public.sources s where w.week_number = 2 and s.slug = 'openstax-organizational-behavior'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 3
from public.weeks w, public.sources s where w.week_number = 2 and s.slug = 'yc-dont-scale'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 40, 4
from public.weeks w, public.sources s where w.week_number = 2 and s.slug = 'hubspot-inbound'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 30, 5
from public.weeks w, public.sources s where w.week_number = 2 and s.slug = 'openstax-principles-management'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 45, 1
from public.weeks w, public.sources s where w.week_number = 3 and s.slug = 'hubspot-inbound-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 2
from public.weeks w, public.sources s where w.week_number = 3 and s.slug = 'yc-sales-marketing-talk'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 3
from public.weeks w, public.sources s where w.week_number = 3 and s.slug = 'mit-entrepreneurial-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 35, 4
from public.weeks w, public.sources s where w.week_number = 3 and s.slug = 'hubspot-sales-enablement'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 5
from public.weeks w, public.sources s where w.week_number = 3 and s.slug = 'sba-marketing-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 1
from public.weeks w, public.sources s where w.week_number = 4 and s.slug = 'yc-sales-playbook'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 2
from public.weeks w, public.sources s where w.week_number = 4 and s.slug = 'openstax-principles-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 3
from public.weeks w, public.sources s where w.week_number = 4 and s.slug = 'hubspot-sales-enablement'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 4
from public.weeks w, public.sources s where w.week_number = 4 and s.slug = 'yc-dont-scale'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 30, 5
from public.weeks w, public.sources s where w.week_number = 4 and s.slug = 'mit-entrepreneurial-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 1
from public.weeks w, public.sources s where w.week_number = 5 and s.slug = 'pon-harvard-home'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 2
from public.weeks w, public.sources s where w.week_number = 5 and s.slug = 'pon-negotiation-skills'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 3
from public.weeks w, public.sources s where w.week_number = 5 and s.slug = 'pon-batna-examples'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 4
from public.weeks w, public.sources s where w.week_number = 5 and s.slug = 'openstax-organizational-behavior'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 20, 5
from public.weeks w, public.sources s where w.week_number = 5 and s.slug = 'pon-batna-power'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 35, 6
from public.weeks w, public.sources s where w.week_number = 5 and s.slug = 'mit-power-negotiation'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 1
from public.weeks w, public.sources s where w.week_number = 6 and s.slug = 'pon-negotiation-skills'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 2
from public.weeks w, public.sources s where w.week_number = 6 and s.slug = 'sba-business-guide'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 3
from public.weeks w, public.sources s where w.week_number = 6 and s.slug = 'yc-sales-playbook'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 4
from public.weeks w, public.sources s where w.week_number = 6 and s.slug = 'pon-hardball-tactics'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 30, 5
from public.weeks w, public.sources s where w.week_number = 6 and s.slug = 'mit-power-negotiation'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 1
from public.weeks w, public.sources s where w.week_number = 7 and s.slug = 'pon-harvard-home'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 2
from public.weeks w, public.sources s where w.week_number = 7 and s.slug = 'mit-power-negotiation'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 3
from public.weeks w, public.sources s where w.week_number = 7 and s.slug = 'openstax-organizational-behavior'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 20, 4
from public.weeks w, public.sources s where w.week_number = 7 and s.slug = 'pon-hardball-tactics'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 30, 5
from public.weeks w, public.sources s where w.week_number = 7 and s.slug = 'mit-new-enterprises'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 1
from public.weeks w, public.sources s where w.week_number = 8 and s.slug = 'pon-negotiation-skills'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 2
from public.weeks w, public.sources s where w.week_number = 8 and s.slug = 'pon-harvard-home'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 3
from public.weeks w, public.sources s where w.week_number = 8 and s.slug = 'pon-batna-power'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 4
from public.weeks w, public.sources s where w.week_number = 8 and s.slug = 'pon-batna-examples'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 30, 5
from public.weeks w, public.sources s where w.week_number = 8 and s.slug = 'mit-power-negotiation'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 20, 6
from public.weeks w, public.sources s where w.week_number = 8 and s.slug = 'pon-hardball-tactics'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 1
from public.weeks w, public.sources s where w.week_number = 9 and s.slug = 'mit-entrepreneurial-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 2
from public.weeks w, public.sources s where w.week_number = 9 and s.slug = 'yc-startup-ideas'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 3
from public.weeks w, public.sources s where w.week_number = 9 and s.slug = 'strategyzer-library'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 4
from public.weeks w, public.sources s where w.week_number = 9 and s.slug = 'hubspot-sales-enablement'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 5
from public.weeks w, public.sources s where w.week_number = 9 and s.slug = 'strategyzer-vpc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 1
from public.weeks w, public.sources s where w.week_number = 10 and s.slug = 'mit-marketing-management'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 45, 2
from public.weeks w, public.sources s where w.week_number = 10 and s.slug = 'hubspot-inbound-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 3
from public.weeks w, public.sources s where w.week_number = 10 and s.slug = 'strategyzer-vpc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 40, 4
from public.weeks w, public.sources s where w.week_number = 10 and s.slug = 'hubspot-inbound'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 30, 5
from public.weeks w, public.sources s where w.week_number = 10 and s.slug = 'hubspot-sales-enablement'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 1
from public.weeks w, public.sources s where w.week_number = 11 and s.slug = 'yc-sales-playbook'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 2
from public.weeks w, public.sources s where w.week_number = 11 and s.slug = 'pon-negotiation-skills'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 3
from public.weeks w, public.sources s where w.week_number = 11 and s.slug = 'openstax-entrepreneurship'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 15, 4
from public.weeks w, public.sources s where w.week_number = 11 and s.slug = 'pon-hardball-tactics'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 30, 5
from public.weeks w, public.sources s where w.week_number = 11 and s.slug = 'hubspot-sales-enablement'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 1
from public.weeks w, public.sources s where w.week_number = 12 and s.slug = 'mit-entrepreneurial-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 2
from public.weeks w, public.sources s where w.week_number = 12 and s.slug = 'strategyzer-bmc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 3
from public.weeks w, public.sources s where w.week_number = 12 and s.slug = 'strategyzer-vpc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 30, 4
from public.weeks w, public.sources s where w.week_number = 12 and s.slug = 'hubspot-sales-enablement'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 5
from public.weeks w, public.sources s where w.week_number = 12 and s.slug = 'yc-pmf'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 45, 1
from public.weeks w, public.sources s where w.week_number = 13 and s.slug = 'mit-entrepreneurial-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 2
from public.weeks w, public.sources s where w.week_number = 13 and s.slug = 'sba-market-research'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 3
from public.weeks w, public.sources s where w.week_number = 13 and s.slug = 'strategyzer-vpc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 4
from public.weeks w, public.sources s where w.week_number = 13 and s.slug = 'yc-pmf'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 5
from public.weeks w, public.sources s where w.week_number = 13 and s.slug = 'strategyzer-library'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 1
from public.weeks w, public.sources s where w.week_number = 14 and s.slug = 'yc-startup-ideas'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 2
from public.weeks w, public.sources s where w.week_number = 14 and s.slug = 'mit-new-enterprises'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 3
from public.weeks w, public.sources s where w.week_number = 14 and s.slug = 'sba-market-research'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 4
from public.weeks w, public.sources s where w.week_number = 14 and s.slug = 'yc-dont-scale'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 5
from public.weeks w, public.sources s where w.week_number = 14 and s.slug = 'yc-pmf'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 30, 6
from public.weeks w, public.sources s where w.week_number = 14 and s.slug = 'yc-product-dev'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 45, 1
from public.weeks w, public.sources s where w.week_number = 15 and s.slug = 'hubspot-inbound-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 2
from public.weeks w, public.sources s where w.week_number = 15 and s.slug = 'yc-sales-marketing-talk'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 3
from public.weeks w, public.sources s where w.week_number = 15 and s.slug = 'sba-marketing-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 4
from public.weeks w, public.sources s where w.week_number = 15 and s.slug = 'hubspot-inbound'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 5
from public.weeks w, public.sources s where w.week_number = 15 and s.slug = 'yc-pmf'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 6
from public.weeks w, public.sources s where w.week_number = 15 and s.slug = 'yc-dont-scale'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 1
from public.weeks w, public.sources s where w.week_number = 16 and s.slug = 'strategyzer-bmc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 2
from public.weeks w, public.sources s where w.week_number = 16 and s.slug = 'sba-market-research'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 3
from public.weeks w, public.sources s where w.week_number = 16 and s.slug = 'mit-entrepreneurial-marketing'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 4
from public.weeks w, public.sources s where w.week_number = 16 and s.slug = 'yc-pmf'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 5
from public.weeks w, public.sources s where w.week_number = 16 and s.slug = 'strategyzer-vpc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 35, 6
from public.weeks w, public.sources s where w.week_number = 16 and s.slug = 'hubspot-inbound'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 1
from public.weeks w, public.sources s where w.week_number = 17 and s.slug = 'sba-business-guide'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 2
from public.weeks w, public.sources s where w.week_number = 17 and s.slug = 'openstax-intro-business'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 3
from public.weeks w, public.sources s where w.week_number = 17 and s.slug = 'mit-new-enterprises'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 4
from public.weeks w, public.sources s where w.week_number = 17 and s.slug = 'yc-product-dev'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 30, 5
from public.weeks w, public.sources s where w.week_number = 17 and s.slug = 'openstax-principles-management'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 20, 6
from public.weeks w, public.sources s where w.week_number = 17 and s.slug = 'sba-startup-costs'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 1
from public.weeks w, public.sources s where w.week_number = 18 and s.slug = 'mit-new-enterprises'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 2
from public.weeks w, public.sources s where w.week_number = 18 and s.slug = 'yc-pricing-101'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 3
from public.weeks w, public.sources s where w.week_number = 18 and s.slug = 'sba-manage-finances'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 4
from public.weeks w, public.sources s where w.week_number = 18 and s.slug = 'openstax-intro-business'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 5
from public.weeks w, public.sources s where w.week_number = 18 and s.slug = 'sba-write-business-plan'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 20, 6
from public.weeks w, public.sources s where w.week_number = 18 and s.slug = 'sba-startup-costs'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 1
from public.weeks w, public.sources s where w.week_number = 19 and s.slug = 'hubspot-inbound-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 2
from public.weeks w, public.sources s where w.week_number = 19 and s.slug = 'sba-business-guide'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 3
from public.weeks w, public.sources s where w.week_number = 19 and s.slug = 'yc-product-dev'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 4
from public.weeks w, public.sources s where w.week_number = 19 and s.slug = 'strategyzer-library'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 30, 5
from public.weeks w, public.sources s where w.week_number = 19 and s.slug = 'openstax-principles-management'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 6
from public.weeks w, public.sources s where w.week_number = 19 and s.slug = 'strategyzer-vpc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 1
from public.weeks w, public.sources s where w.week_number = 20 and s.slug = 'mit-new-enterprises'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 2
from public.weeks w, public.sources s where w.week_number = 20 and s.slug = 'openstax-intro-business'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 3
from public.weeks w, public.sources s where w.week_number = 20 and s.slug = 'yc-pricing-101'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 4
from public.weeks w, public.sources s where w.week_number = 20 and s.slug = 'sba-manage-finances'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 20, 5
from public.weeks w, public.sources s where w.week_number = 20 and s.slug = 'sba-startup-costs'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 6
from public.weeks w, public.sources s where w.week_number = 20 and s.slug = 'yc-product-dev'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 1
from public.weeks w, public.sources s where w.week_number = 21 and s.slug = 'strategyzer-bmc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 2
from public.weeks w, public.sources s where w.week_number = 21 and s.slug = 'strategyzer-vpc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 3
from public.weeks w, public.sources s where w.week_number = 21 and s.slug = 'strategyzer-library'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 4
from public.weeks w, public.sources s where w.week_number = 21 and s.slug = 'openstax-entrepreneurship'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 5
from public.weeks w, public.sources s where w.week_number = 21 and s.slug = 'yc-pmf'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 1
from public.weeks w, public.sources s where w.week_number = 22 and s.slug = 'yc-sales-playbook'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 40, 2
from public.weeks w, public.sources s where w.week_number = 22 and s.slug = 'hubspot-inbound-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 3
from public.weeks w, public.sources s where w.week_number = 22 and s.slug = 'mit-entrepreneurial-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 4
from public.weeks w, public.sources s where w.week_number = 22 and s.slug = 'sba-write-business-plan'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 30, 5
from public.weeks w, public.sources s where w.week_number = 22 and s.slug = 'hubspot-sales-enablement'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 6
from public.weeks w, public.sources s where w.week_number = 22 and s.slug = 'yc-dont-scale'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 35, 1
from public.weeks w, public.sources s where w.week_number = 23 and s.slug = 'openstax-organizational-behavior'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 2
from public.weeks w, public.sources s where w.week_number = 23 and s.slug = 'pon-harvard-home'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 3
from public.weeks w, public.sources s where w.week_number = 23 and s.slug = 'openstax-principles-management'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 15, 4
from public.weeks w, public.sources s where w.week_number = 23 and s.slug = 'pon-batna-power'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 5
from public.weeks w, public.sources s where w.week_number = 23 and s.slug = 'yc-startup-ideas'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 30, 6
from public.weeks w, public.sources s where w.week_number = 23 and s.slug = 'mit-power-negotiation'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 1
from public.weeks w, public.sources s where w.week_number = 24 and s.slug = 'strategyzer-bmc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 2
from public.weeks w, public.sources s where w.week_number = 24 and s.slug = 'yc-sales-playbook'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 3
from public.weeks w, public.sources s where w.week_number = 24 and s.slug = 'openstax-entrepreneurship'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 4
from public.weeks w, public.sources s where w.week_number = 24 and s.slug = 'mit-entrepreneurial-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 5
from public.weeks w, public.sources s where w.week_number = 24 and s.slug = 'strategyzer-vpc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 30, 6
from public.weeks w, public.sources s where w.week_number = 24 and s.slug = 'openstax-principles-management'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 30, 1
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
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 4
from public.weeks w, public.sources s where w.week_number = 25 and s.slug = 'strategyzer-vpc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 5
from public.weeks w, public.sources s where w.week_number = 25 and s.slug = 'yc-pmf'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 6
from public.weeks w, public.sources s where w.week_number = 25 and s.slug = 'sba-manage-finances'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 25, 1
from public.weeks w, public.sources s where w.week_number = 26 and s.slug = 'mit-new-enterprises'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 2
from public.weeks w, public.sources s where w.week_number = 26 and s.slug = 'pon-negotiation-skills'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 3
from public.weeks w, public.sources s where w.week_number = 26 and s.slug = 'hubspot-inbound-sales'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, true, 20, 4
from public.weeks w, public.sources s where w.week_number = 26 and s.slug = 'yc-sales-playbook'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 5
from public.weeks w, public.sources s where w.week_number = 26 and s.slug = 'strategyzer-bmc'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 25, 6
from public.weeks w, public.sources s where w.week_number = 26 and s.slug = 'yc-pricing-101'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
insert into public.week_sources (week_id, source_id, is_mandatory, study_minutes_planned, order_index)
select w.id, s.id, false, 20, 7
from public.weeks w, public.sources s where w.week_number = 26 and s.slug = 'pon-batna-examples'
on conflict (week_id, source_id) do update set is_mandatory = excluded.is_mandatory, study_minutes_planned = excluded.study_minutes_planned, order_index = excluded.order_index;
