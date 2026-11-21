import { moduleForWeek, MODULES, type ModuleDef } from './modules'
import { getSource, LIBRARY_SOURCES } from './sources'
import { SKILLS } from './skills'

export interface WeekSourceLink {
  source_id: string
  is_mandatory: boolean
  study_minutes_planned: number
  order_index: number
}

export interface AssignmentDef {
  code: string
  participant_slot: 'A' | 'B' | 'both'
  title_ru: string
  brief_md: string
  deliverable_type: 'text' | 'doc' | 'slides' | 'audio_note' | 'defense'
  max_minutes: number
  skill_slugs: string[]
}

export interface RubricCriterion {
  id: string
  label: string
  max_score: number
  description: string
}

export interface WeekDef {
  week_number: number
  title_ru: string
  summary_ru: string
  problem_ru: string
  outcomes: string[]
  concepts: string[]
  sources: WeekSourceLink[]
  assignment_a: AssignmentDef
  assignment_b: AssignmentDef
  joint: AssignmentDef
  debate_ru: string
  case_ru: string
  simulation_ru: string
  rubric: RubricCriterion[]
  reflection: string[]
  error_watchlist: string[]
  sales_drill_ru: string
  learning_goals: string[]
}

export interface ExamDef {
  id: string
  week_number: number
  kind: 'midterm' | 'final'
  title_ru: string
  brief_md: string
}

function src(
  source_id: string,
  minutes: number,
  mandatory: boolean,
  order: number,
): WeekSourceLink {
  const s = getSource(source_id)
  if (!s) throw new Error(`Unknown source ${source_id}`)
  if (mandatory && s.is_optional_paid) throw new Error(`Paid optional cannot be mandatory: ${source_id}`)
  return { source_id, is_mandatory: mandatory, study_minutes_planned: minutes, order_index: order }
}

function defaultRubric(focus: string): RubricCriterion[] {
  return [
    {
      id: 'clarity',
      label: 'Ясность',
      max_score: 25,
      description: `Аргументы по теме «${focus}» понятны без догадок`,
    },
    {
      id: 'evidence',
      label: 'Доказательства',
      max_score: 25,
      description: 'Есть факты, цитаты из источников или результаты разговоров',
    },
    {
      id: 'action',
      label: 'Действие',
      max_score: 25,
      description: 'Есть конкретный следующий шаг, который можно выполнить',
    },
    {
      id: 'sales',
      label: 'Продажи на практике',
      max_score: 25,
      description: 'Видна практика продаж/влияния, а не только теория',
    },
  ]
}

type WeekSeed = {
  title: string
  problem: string
  outcomes: string[]
  concepts: string[]
  mandatory: [string, number][]
  optional?: [string, number][]
  a: { title: string; brief: string; minutes: number; skills: string[]; type?: AssignmentDef['deliverable_type'] }
  b: { title: string; brief: string; minutes: number; skills: string[]; type?: AssignmentDef['deliverable_type'] }
  joint: { title: string; brief: string; minutes: number }
  debate: string
  case: string
  simulation: string
  reflection: string[]
  errors: string[]
  sales: string
  focus: string
}

const WEEK_SEEDS: WeekSeed[] = [
  {
    title: 'Старт: мышление продавца',
    problem: 'Основатели избегают продаж и путают «рассказать о продукте» с закрытием следующего шага.',
    outcomes: [
      'Собрать карту идеального первого покупателя',
      'Провести 3 разговора по скрипту диагностики',
      'Зафиксировать один измеримый следующий шаг сделки',
    ],
    concepts: ['ICP', 'следующий шаг', 'диагностика vs питч', 'founder-led sales'],
    mandatory: [
      ['yc-sales-playbook', 45],
      ['hubspot-inbound-sales', 50],
      ['sba-marketing-sales', 20],
    ],
    optional: [
      ['yc-dont-scale', 30],
      ['mit-entrepreneurial-sales', 40],
      ['optional-getting-to-yes', 0],
    ],
    a: {
      title: 'Карта ICP и 10 контактов',
      brief:
        'Опишите идеального покупателя (роль, боль, триггер). Составьте список из 10 реальных контактов и черновик первого сообщения. Сдайте текст 400–700 слов + список.',
      minutes: 70,
      skills: ['sales', 'psychology'],
    },
    b: {
      title: 'Скрипт диагностики на 5 вопросов',
      brief:
        'Напишите скрипт discovery-звонка: открытие, 5 вопросов, резюме боли, запрос следующего шага. Прогоните вслух 2 раза и приложите самозаметки.',
      minutes: 70,
      skills: ['sales', 'speaking'],
    },
    joint: {
      title: 'Разбор двух скриптов',
      brief: 'Обсудите скрипты A и B: где давление, где ясность, какой следующий шаг сильнее. Зафиксируйте общую версию v1.',
      minutes: 40,
    },
    debate: 'Можно ли масштабировать маркетинг до того, как основатель лично закрыл 10 сделок?',
    case: 'B2B-сервис: 0 продаж, много «интересно» в чатах. Что меняете в первую неделю?',
    simulation: 'Звонок скептичному ЛПР: у вас 8 минут, цель — календарная встреча, не «рассказ о компании».',
    reflection: [
      'Где вы избегали прямого запроса следующего шага?',
      'Какой вопрос из discovery оказался самым сильным?',
    ],
    errors: [
      'Питч фич вместо диагностики',
      'Список контактов из «воображаемых компаний»',
      'Нет конкретного CTA в сообщении',
    ],
    sales: 'Сделайте 5 исходящих касаний по списку ICP и запишите ответы.',
    focus: 'первые продажи',
  },
  {
    title: 'Психология решения о покупке',
    problem: 'Продавец говорит с одним человеком, а решение принимает система интересов.',
    outcomes: [
      'Построить карту влияния (ЛПР, чемпион, блокировщик)',
      'Связать возражения с интересами, а не с «отмазками»',
      'Провести 1 разговор с фокусом на интересы стейкхолдеров',
    ],
    concepts: ['карта ЛПР', 'интересы', 'возражения', 'покупательский путь'],
    mandatory: [
      ['openstax-principles-marketing', 45],
      ['openstax-organizational-behavior', 40],
      ['yc-dont-scale', 25],
    ],
    optional: [
      ['hubspot-inbound', 40],
      ['openstax-principles-management', 30],
    ],
    a: {
      title: 'Карта стейкхолдеров по кейсу',
      brief: 'Выберите реальный или учебный B2B-кейс. Нарисуйте карту: роли, интересы, риски, влияние. 1 страница + легензии.',
      minutes: 75,
      skills: ['psychology', 'sales'],
    },
    b: {
      title: 'Разбор 5 возражений',
      brief: 'Соберите 5 типичных возражений. Для каждого: скрытый интерес, уточняющий вопрос, ответ без скидки «в пустоту».',
      minutes: 75,
      skills: ['psychology', 'negotiation'],
    },
    joint: {
      title: 'Совместная карта сделки',
      brief: 'Сведите карты A/B в одну: кто блокирует, кто ускоряет, какой следующий разговор нужен.',
      minutes: 35,
    },
    debate: 'Всегда ли нужно «отработать возражение» сразу или иногда лучше вернуться к диагностике?',
    case: 'Чемпион внутри клиента говорит «да», CFO молчит. Ваш план на 10 дней.',
    simulation: 'Встреча с двумя ролями: энтузиаст и скептик-финансист. Цель — согласованный критерий решения.',
    reflection: ['Чью боль вы игнорировали?', 'Какое возражение оказалось интересом, а не отказом?'],
    errors: ['Персонализация одного контакта как всей компании', 'Скидка как первая реакция на «дорого»'],
    sales: 'В одном реальном/учебном разговоре явно назовите 2 стейкхолдеров и спросите, как они решают.',
    focus: 'психология покупки',
  },
  {
    title: 'Квалификация и следующий шаг',
    problem: 'Воронка забита «тёплыми» лидами без критериев квалификации.',
    outcomes: [
      'Задать критерии go/no-go для лида',
      'Провести 2 квалифицирующих разговора',
      'Отделить nurture от active pipeline',
    ],
    concepts: ['квалификация', 'pipeline hygiene', 'BANT/аналоги', 'следующий шаг'],
    mandatory: [
      ['hubspot-inbound-sales', 45],
      ['yc-sales-marketing-talk', 40],
      ['mit-entrepreneurial-sales', 30],
    ],
    optional: [
      ['hubspot-sales-enablement', 35],
      ['sba-marketing-sales', 25],
    ],
    a: {
      title: 'Критерии квалификации v1',
      brief: 'Опишите 6 критериев квалификации под ваш кейс и таблицу: лид → статус → причина → следующий шаг.',
      minutes: 70,
      skills: ['sales', 'ops'],
    },
    b: {
      title: '2 разговора + заметки',
      brief: 'Проведите 2 discovery (реальные или ролевые с таймером). Сдайте заметки: боль, критерии, статус, CTA.',
      minutes: 80,
      skills: ['sales', 'speaking'],
    },
    joint: {
      title: 'Чистка pipeline',
      brief: 'Совместно пройдитесь по 8 вымышленным/учебным лидам и решите: active / nurture / drop.',
      minutes: 35,
    },
    debate: 'Лучше 3 квалифицированных сделки или 20 «интересных» лидов?',
    case: 'CRM полна контактов без активности 30 дней. Что удаляете и почему?',
    simulation: 'Лид тянет время. За 6 минут получите либо дату решения, либо честный no-go.',
    reflection: ['Кого вы держали в pipeline из страха пустоты?', 'Какой критерий оказался лишним?'],
    errors: ['Квалификация после демо, а не до', 'CTA «ну давайте ещё подумаем»'],
    sales: 'Закройте один лид как no-go письменно с причиной.',
    focus: 'квалификация',
  },
  {
    title: 'Midterm 1: продажи и психология',
    problem: 'Нужна проверка, что практика продаж недели 1–3 дала измеримый навык, а не конспекты.',
    outcomes: [
      'Сдать midterm-пакет: ICP, скрипт, карта стейкхолдеров, 2 разговора',
      'Защитить позицию в коротком oral defense',
      'Получить фидбек по рубрике',
    ],
    concepts: ['аттестация', 'портфолио продаж', 'защита'],
    mandatory: [
      ['yc-sales-playbook', 25],
      ['openstax-principles-marketing', 25],
      ['hubspot-sales-enablement', 25],
    ],
    optional: [
      ['yc-dont-scale', 25],
      ['mit-entrepreneurial-sales', 30],
    ],
    a: {
      title: 'Midterm A: портфолио продавца',
      brief: 'Соберите пакет: ICP, сообщения, скрипт, карта стейкхолдеров, лог касаний. Самооценка по рубрике.',
      minutes: 90,
      skills: ['sales', 'psychology'],
      type: 'doc',
    },
    b: {
      title: 'Midterm B: oral defense 8 мин',
      brief: 'Подготовьте защиту: гипотеза покупателя, доказательства из разговоров, следующий эксперимент. Сдайте структуру + запись/заметки прогона.',
      minutes: 90,
      skills: ['speaking', 'sales'],
      type: 'defense',
    },
    joint: {
      title: 'Взаимное ревью midterm',
      brief: 'Обменяйтесь пакетами, дайте фидбек по 4 критериям рубрики, без переписывания чужой работы.',
      minutes: 40,
    },
    debate: 'Что важнее на midterm: идеальный документ или доказательства реальных разговоров?',
    case: 'Кандидат много читал, но не сделал ни одного CTA. Оценка?',
    simulation: 'Защита перед «жёстким» ревьюером: 8 минут + 4 минуты вопросов.',
    reflection: ['Какой пробел вскрыл midterm?', 'Что вы перенесёте в недели 5–8?'],
    errors: ['Пересказ источников без своей практики', 'Нет артефактов разговоров'],
    sales: 'В защите явно назовите одну сделку/разговор и её статус.',
    focus: 'midterm продаж',
  },
  {
    title: 'Интересы вместо позиций',
    problem: 'Переговоры скатываются в торг ценой без понимания интересов.',
    outcomes: [
      'Разложить позицию на интересы',
      'Подготовить BATNA до разговора',
      'Предложить 2 опции, создающие ценность',
    ],
    concepts: ['интересы', 'позиции', 'BATNA', 'опции'],
    mandatory: [
      ['pon-harvard-home', 30],
      ['pon-negotiation-skills', 25],
      ['pon-batna-examples', 25],
      ['openstax-organizational-behavior', 20],
    ],
    optional: [
      ['pon-batna-power', 20],
      ['mit-power-negotiation', 35],
    ],
    a: {
      title: 'Подготовка: интересы и BATNA',
      brief: 'Для учебного кейса: ваша позиция, 3 интереса, BATNA, резерв, 2 опции win-win. Таблица на 1 стр.',
      minutes: 70,
      skills: ['negotiation'],
    },
    b: {
      title: 'Карта интересов контрагента',
      brief: 'Смоделируйте интересы другой стороны и вопросы для проверки гипотез. Не придумывайте «магические» уступки.',
      minutes: 70,
      skills: ['negotiation', 'psychology'],
    },
    joint: {
      title: 'Симуляция 12 минут',
      brief: 'Сыграйте кейс по ролям A/B, затем разберите: где ушли в позиции, где нашли опцию.',
      minutes: 45,
    },
    debate: 'Всегда ли раскрывать свою BATNA?',
    case: 'Клиент требует −30% «потому что так решил директор». Ваш ход без немедленной скидки.',
    simulation: 'Переговоры о сроках и объёме: нельзя соглашаться на цену в первые 5 минут.',
    reflection: ['Где вы уступили без обмена?', 'Какой вопрос лучше всего вскрыл интерес?'],
    errors: ['Торг без подготовки', 'Скрывать отсутствие BATNA от себя'],
    sales: 'В продажном разговоре спросите: «Что для вас важнее — срок, риск или цена?»',
    focus: 'переговоры-интересы',
  },
  {
    title: 'Подготовка и процесс переговоров',
    problem: 'Сильная позиция разваливается без повестки и критериев соглашения.',
    outcomes: [
      'Собрать prep-пакет переговоров',
      'Вести повестку и фиксировать договорённости',
      'Отделить уступку от обмена',
    ],
    concepts: ['повестка', 'критерии', 'обмен', 'протокол'],
    mandatory: [
      ['pon-negotiation-skills', 25],
      ['sba-business-guide', 35],
      ['yc-sales-playbook', 35],
      ['pon-hardball-tactics', 20],
    ],
    optional: [['mit-power-negotiation', 30]],
    a: {
      title: 'Prep-пакет переговоров',
      brief: 'Шаблон: цели, красные линии, вопросы, пакет обмена (если/то), критерии успеха встречи.',
      minutes: 75,
      skills: ['negotiation', 'ops'],
    },
    b: {
      title: 'Протокол договорённостей',
      brief: 'После симуляции оформите протокол: что согласовано, что открыто, владельцы, даты.',
      minutes: 65,
      skills: ['negotiation', 'ops'],
    },
    joint: {
      title: 'Переговоры с обменом',
      brief: 'Симуляция: каждая уступка только в паре с встречным условием. Разбор записи/заметок.',
      minutes: 45,
    },
    debate: 'Нужен ли жёсткий протокол в «дружеских» партнёрских переговорах?',
    case: 'Партнёр кивает, но ничего не фиксирует письменно. Риск и ваш процесс.',
    simulation: 'Встреча 15 минут: повестка из 3 пунктов, итог — письменные next steps.',
    reflection: ['Какую уступку вы дали бесплатно?', 'Помог ли prep-пакет?'],
    errors: ['Устные «договорились» без owners', 'Повестка только у одной стороны'],
    sales: 'После демо пришлите письмо с 3 пунктами договорённостей в тот же день.',
    focus: 'процесс переговоров',
  },
  {
    title: 'Сложные сделки и многосторонние переговоры',
    problem: 'В сделке несколько сторон с разными BATNA — линейный скрипт не работает.',
    outcomes: [
      'Смоделировать 3 стороны сделки',
      'Найти коалицию/блокер',
      'Предложить пакетное соглашение',
    ],
    concepts: ['многосторонность', 'коалиции', 'пакеты', 'эскалация'],
    mandatory: [
      ['pon-harvard-home', 25],
      ['mit-power-negotiation', 35],
      ['openstax-organizational-behavior', 25],
    ],
    optional: [
      ['pon-hardball-tactics', 20],
      ['mit-new-enterprises', 30],
    ],
    a: {
      title: 'Модель трёхсторонней сделки',
      brief: 'Опишите стороны, интересы, BATNA, возможные коалиции. Предложите пакет условий.',
      minutes: 75,
      skills: ['negotiation', 'psychology'],
    },
    b: {
      title: 'План эскалации',
      brief: 'Когда эскалировать, к кому, с каким пакетом фактов. Скрипт эскалационного письма.',
      minutes: 70,
      skills: ['negotiation', 'sales'],
    },
    joint: {
      title: 'Симуляция трёх ролей',
      brief: 'Один ведёт, второй — вторая сторона, третий — наблюдатель с чеклистом ошибок. Ротация.',
      minutes: 45,
    },
    debate: 'Эскалация — признак слабости или инструмент процесса?',
    case: 'Интегратор, клиент и ваш стартап спорят о SLA. Соберите пакет.',
    simulation: '15 минут: две стороны + «тихий» блокер, которого нужно выявить вопросами.',
    reflection: ['Кого вы не пригласили в процесс вовремя?', 'Какой пакет создал ценность?'],
    errors: ['Давить на чемпиона вместо работы с блокером', 'Один issue за раз без пакета'],
    sales: 'В сложной сделке назначьте отдельный разговор с каждым ключевым стейкхолдером.',
    focus: 'сложные переговоры',
  },
  {
    title: 'Midterm 2: переговоры',
    problem: 'Проверка умения готовиться и вести переговоры на интересах.',
    outcomes: [
      'Сдать prep + протокол + разбор симуляции',
      'Показать обмен вместо односторонних уступок',
      'Защитить решение по кейсу',
    ],
    concepts: ['midterm', 'BATNA', 'пакеты'],
    mandatory: [
      ['pon-negotiation-skills', 20],
      ['pon-harvard-home', 25],
      ['pon-batna-power', 20],
      ['pon-batna-examples', 20],
    ],
    optional: [
      ['mit-power-negotiation', 30],
      ['pon-hardball-tactics', 20],
    ],
    a: {
      title: 'Midterm A: negotiation dossier',
      brief: 'Пакет: prep, карта интересов, BATNA, опции, протокол симуляции, самооценка.',
      minutes: 95,
      skills: ['negotiation'],
      type: 'doc',
    },
    b: {
      title: 'Midterm B: live negotiation defense',
      brief: '10-минутная симуляция + 5 минут разбора своих ошибок. Сдайте план и заметки наблюдателя.',
      minutes: 95,
      skills: ['negotiation', 'speaking'],
      type: 'defense',
    },
    joint: {
      title: 'Кросс-ревью midterm',
      brief: 'Оцените пакет партнёра по рубрике; один must-fix на следующую фазу.',
      minutes: 35,
    },
    debate: 'Можно ли считать переговоры успешными, если цена не изменилась, но риски снизились?',
    case: 'Сделка спасена пакетом сроков/объёма без скидки. Разберите механику.',
    simulation: 'Финальная симуляция midterm с таймером и запретом на «подумаем».',
    reflection: ['Какой навык просел под давлением времени?', 'Что улучшите в prep?'],
    errors: ['Нет BATNA', 'Протокол после встречи «из головы»'],
    sales: 'Свяжите итог переговоров с конкретным этапом pipeline.',
    focus: 'midterm переговоров',
  },
  {
    title: 'Структура убеждающего выступления',
    problem: 'Презентации начинаются с компании, а не с проблемы слушателя.',
    outcomes: [
      'Собрать структуру: проблема → stakes → proof → ask',
      'Сократить питч до 5 минут',
      'Получить фидбек по ясности',
    ],
    concepts: ['нарратив', 'ask', 'доказательства', 'аудитория'],
    mandatory: [
      ['mit-entrepreneurial-marketing', 40],
      ['yc-startup-ideas', 30],
      ['strategyzer-library', 25],
      ['hubspot-sales-enablement', 20],
    ],
    optional: [['strategyzer-vpc', 25]],
    a: {
      title: 'Скрипт 5-минутного питча',
      brief: 'Текст питча с таймингами по блокам. Ask должен быть конкретным (встреча/пилот/интро).',
      minutes: 75,
      skills: ['presentation', 'speaking'],
    },
    b: {
      title: 'Карта аудитории',
      brief: 'Для 2 аудиторий (клиент / партнёр) опишите заботы, возражения, какой proof нужен.',
      minutes: 70,
      skills: ['presentation', 'psychology'],
    },
    joint: {
      title: 'Прогон питчей',
      brief: 'Каждый выступает 5 минут, партнер даёт фидбек только по структуре и ask.',
      minutes: 45,
    },
    debate: 'Нужны ли слайды на первом питче клиенту?',
    case: 'Фаундер 12 минут рассказывает историю компании — сделка не двигается. Перепишите структуру.',
    simulation: 'Питч инвестору-скептику: 5 минут + 3 жёстких вопроса.',
    reflection: ['Где вы потеряли внимание?', 'Был ли ask достаточно конкретным?'],
    errors: ['Начало с «мы команда…»', 'Ask «поддержите нас» без действия'],
    sales: 'В конце питча назовите дату/формат следующего шага и спросите согласие.',
    focus: 'структура презентации',
  },
  {
    title: 'Слайды, доказательства, анти-шум',
    problem: 'Слайды перегружены текстом; доказательства слабые или нерелевантные.',
    outcomes: [
      'Сделать колоду ≤8 слайдов',
      'Каждый слайд — один тезис',
      'Подобрать proof под аудиторию',
    ],
    concepts: ['визуальная иерархия', 'доказательства', 'один тезис'],
    mandatory: [
      ['mit-marketing-management', 40],
      ['hubspot-inbound-marketing', 45],
      ['strategyzer-vpc', 20],
    ],
    optional: [
      ['hubspot-inbound', 40],
      ['hubspot-sales-enablement', 30],
    ],
    a: {
      title: 'Колода питча v1',
      brief: '8 слайдов max. На каждом: заголовок-тезис. Сдайте outline + заметки спикера.',
      minutes: 85,
      skills: ['presentation'],
      type: 'slides',
    },
    b: {
      title: 'Матрица доказательств',
      brief: 'Таблица: утверждение → тип proof → источник/факт → риск недоверия.',
      minutes: 70,
      skills: ['presentation', 'marketing'],
    },
    joint: {
      title: 'Редактура колоды',
      brief: 'Вычеркните вместе 30% текста. Проверьте, что ask на последнем слайде ясен.',
      minutes: 40,
    },
    debate: 'Лучше один сильный кейс или пять слабых логотипов «клиентов»?',
    case: 'В колоде 22 слайда. Сократите до 7, сохранив ask.',
    simulation: 'Показ слайдов без чтения текста со слайда вслух.',
    reflection: ['Какой слайд можно удалить без потери смысла?', 'Какой proof самый слабый?'],
    errors: ['Стена текста', 'Proof, не связанный с утверждением'],
    sales: 'Один слайд посвятите риску клиента и как вы его снижаете.',
    focus: 'слайды и proof',
  },
  {
    title: 'Публичная защита и голос',
    problem: 'Даже сильный текст проваливается из-за темпа, глаз и неуверенного ask.',
    outcomes: [
      'Отработать темп и паузы',
      'Выдержать Q&A без ухода в оправдания',
      'Записать и разобрать прогон',
    ],
    concepts: ['присутствие', 'пауза', 'Q&A', 'голос'],
    mandatory: [
      ['yc-sales-playbook', 30],
      ['pon-negotiation-skills', 25],
      ['openstax-entrepreneurship', 35],
      ['pon-hardball-tactics', 15],
    ],
    optional: [['hubspot-sales-enablement', 30]],
    a: {
      title: 'Запись прогона 5 мин',
      brief: 'Запишите питч (аудио/видео). Саморазбор: темп, паразиты, ясность ask. Список 3 правок.',
      minutes: 80,
      skills: ['speaking', 'presentation'],
      type: 'audio_note',
    },
    b: {
      title: 'Банк ответов на 8 вопросов',
      brief: 'Подготовьте короткие ответы на типовые жёсткие вопросы (цена, конкуренты, риски, сроки).',
      minutes: 75,
      skills: ['speaking', 'negotiation'],
    },
    joint: {
      title: 'Q&A-спарринг',
      brief: 'По очереди задавайте неудобные вопросы 7 минут. Запрещены оправдания длиннее 40 секунд.',
      minutes: 45,
    },
    debate: 'Стоит ли признавать незнание вслух на защите?',
    case: 'Спикер теряет нить после вопроса о unit-экономике. Восстановление за 30 секунд.',
    simulation: 'Защита стоя: без чтения со слайдов, таймер на Q&A.',
    reflection: ['Какой вопрос выбивает вас чаще всего?', 'Помогла ли пауза перед ответом?'],
    errors: ['Заполнение пауз словами-паразитами', 'Спор с вопрошающим'],
    sales: 'На встрече после возражения сделайте паузу 2 секунды, затем уточняющий вопрос.',
    focus: 'публичная защита',
  },
  {
    title: 'Midterm 3: презентации',
    problem: 'Аттестация умения убеждать структурой, proof и голосом.',
    outcomes: [
      'Сдать колоду + скрипт + запись',
      'Пройти timed defense',
      'Получить оценку по рубрике выступления',
    ],
    concepts: ['midterm', 'питч', 'защита'],
    mandatory: [
      ['mit-entrepreneurial-marketing', 30],
      ['strategyzer-bmc', 25],
      ['strategyzer-vpc', 25],
    ],
    optional: [
      ['hubspot-sales-enablement', 30],
      ['yc-pmf', 25],
    ],
    a: {
      title: 'Midterm A: pitch package',
      brief: 'Колода ≤8, скрипт, матрица proof, самооценка.',
      minutes: 95,
      skills: ['presentation'],
      type: 'slides',
    },
    b: {
      title: 'Midterm B: live pitch + Q&A',
      brief: '5+5 минут. Сдайте план и лист фидбека партнёра.',
      minutes: 95,
      skills: ['speaking', 'presentation'],
      type: 'defense',
    },
    joint: {
      title: 'Жюри друг для друга',
      brief: 'Оцените по рубрике; один комплимент и один must-fix.',
      minutes: 40,
    },
    debate: 'Может ли отличный спикер закрыть слабый оффер?',
    case: 'Сильный голос, слабый ask. Итоговая оценка midterm?',
    simulation: 'Финальный питч midterm с неожиданным вопросом про риск.',
    reflection: ['Что улучшилось с недели 9?', 'Какой блок всё ещё сырой?'],
    errors: ['Чтение слайдов', 'Нет ask'],
    sales: 'В ask midterm должен быть коммерческий следующий шаг, не «спасибо за внимание».',
    focus: 'midterm презентаций',
  },
  {
    title: 'Сегментация и позиционирование',
    problem: '«Наш продукт для всех» убивает сообщение и продажи.',
    outcomes: [
      'Выбрать один beachhead-сегмент',
      'Сформулировать позиционирование в 1 фразе',
      'Проверить сообщение на 3 людях',
    ],
    concepts: ['сегмент', 'позиционирование', 'beachhead', 'сообщение'],
    mandatory: [
      ['mit-entrepreneurial-marketing', 45],
      ['sba-market-research', 30],
      ['strategyzer-vpc', 25],
      ['yc-pmf', 20],
    ],
    optional: [['strategyzer-library', 25]],
    a: {
      title: 'Выбор beachhead',
      brief: 'Сравните 3 сегмента по боли, доступности, платежеспособности. Выберите один и обоснуйте.',
      minutes: 75,
      skills: ['marketing', 'entrepreneurial'],
    },
    b: {
      title: 'Позиционирование и тест сообщения',
      brief: '1 фраза позиционирования + 3 варианта сообщения. Протестируйте на 3 людях, сдайте заметки.',
      minutes: 80,
      skills: ['marketing', 'sales'],
    },
    joint: {
      title: 'Согласование сегмента',
      brief: 'Выберите общий beachhead на 4 недели и список 15 контактов в нём.',
      minutes: 35,
    },
    debate: 'Уже ли сужать сегмент, если «рынок большой»?',
    case: 'Два фаундера тянут продукт в разные сегменты. Критерий решения.',
    simulation: 'Объясните позиционирование за 60 секунд незнакомому человеку.',
    reflection: ['Что вы исключили из ICP и почему?', 'Какое сообщение зашло лучше?'],
    errors: ['Сегмент = демография без боли', 'Позиционирование через фичи'],
    sales: 'Все касания недели только в выбранный beachhead.',
    focus: 'сегментация',
  },
  {
    title: 'Customer discovery на практике',
    problem: 'Интервью превращаются в скрытый питч.',
    outcomes: [
      'Провести 4 discovery-интервью по правилам',
      'Отделить факты от интерпретаций',
      'Обновить гипотезы после разговоров',
    ],
    concepts: ['гипотеза', 'интервью', 'факт vs мнение', 'Mom Test-принципы (без пиратства книги)'],
    mandatory: [
      ['yc-startup-ideas', 30],
      ['mit-new-enterprises', 40],
      ['sba-market-research', 25],
      ['yc-dont-scale', 25],
    ],
    optional: [
      ['yc-pmf', 25],
      ['yc-product-dev', 30],
    ],
    a: {
      title: 'Гид интервью',
      brief: '10 вопросов, которые нельзя заменить питчем. Цель каждого вопроса. Запрещённые формулировки.',
      minutes: 65,
      skills: ['entrepreneurial', 'psychology'],
    },
    b: {
      title: '4 интервью + синтез',
      brief: 'Проведите 4 разговора (реальные/ролевые). Таблица: цитата → факт → гипотеза → решение.',
      minutes: 80,
      skills: ['entrepreneurial', 'sales'],
    },
    joint: {
      title: 'Обновление гипотез',
      brief: 'Какие гипотезы умерли? Какие усилили? Что меняете в оффере на следующей неделе?',
      minutes: 35,
    },
    debate: 'Можно ли считать друзей валидными респондентами на старте?',
    case: 'Все кивают «круто», но никто не даёт время/деньги. Диагноз.',
    simulation: 'Интервью, где собеседник уводит в питч — верните к прошлому поведению.',
    reflection: ['Где вы продавали вместо исследования?', 'Какая цитата изменила гипотезу?'],
    errors: ['Наводящие вопросы', 'Выводы без цитат'],
    sales: 'После discovery попросите интро к тому, у кого боль острее.',
    focus: 'customer discovery',
  },
  {
    title: 'Каналы и inbound-эксперимент',
    problem: 'Маркетинг без эксперимента = бесконечный контент без лидов.',
    outcomes: [
      'Выбрать 1 канал на 7 дней',
      'Запустить мини-эксперимент с метрикой',
      'Связать лид с разговором, не с лайком',
    ],
    concepts: ['канал', 'эксперимент', 'конверсия в разговор', 'inbound'],
    mandatory: [
      ['hubspot-inbound-marketing', 45],
      ['yc-sales-marketing-talk', 30],
      ['sba-marketing-sales', 20],
      ['hubspot-inbound', 20],
    ],
    optional: [
      ['yc-pmf', 25],
      ['yc-dont-scale', 25],
    ],
    a: {
      title: 'Дизайн эксперимента',
      brief: 'Гипотеза, канал, актив, метрика (разговоры), критерий успеха/провала, бюджет времени.',
      minutes: 70,
      skills: ['marketing'],
    },
    b: {
      title: 'Запуск и лог',
      brief: 'Запустите актив, ведите лог касаний/ответов 5 дней. Итог: что сработало.',
      minutes: 90,
      skills: ['marketing', 'sales'],
    },
    joint: {
      title: 'Разбор эксперимента',
      brief: 'Решите: scale / iterate / kill. Один следующий тест.',
      minutes: 35,
    },
    debate: 'Нужен ли блог до первых 10 продаж?',
    case: '1000 просмотров, 0 разговоров. Что меняете завтра?',
    simulation: 'За 20 минут придумайте оффер-лидмагнит, ведущий к созвону.',
    reflection: ['Метрика была про тщеславие или про продажи?', 'Хватило ли фокуса на одном канале?'],
    errors: ['5 каналов сразу', 'Оптимизация просмотров'],
    sales: 'Каждый лид из эксперимента получает личное касание в 24 часа.',
    focus: 'каналы',
  },
  {
    title: 'Midterm 4: маркетинг и discovery',
    problem: 'Проверка, что сегмент, discovery и канал связаны с продажами.',
    outcomes: [
      'Сдать пакет: сегмент, интервью, эксперимент',
      'Защитить beachhead',
      'Показать связь маркетинга и pipeline',
    ],
    concepts: ['midterm', 'beachhead', 'эксперимент'],
    mandatory: [
      ['strategyzer-bmc', 25],
      ['sba-market-research', 25],
      ['mit-entrepreneurial-marketing', 30],
      ['yc-pmf', 20],
    ],
    optional: [
      ['strategyzer-vpc', 25],
      ['hubspot-inbound', 35],
    ],
    a: {
      title: 'Midterm A: discovery & segment dossier',
      brief: 'Сегмент, позиционирование, 4 интервью, обновлённые гипотезы.',
      minutes: 95,
      skills: ['marketing', 'entrepreneurial'],
      type: 'doc',
    },
    b: {
      title: 'Midterm B: channel experiment defense',
      brief: 'Защита эксперимента: метрики, выводы, следующий тест, влияние на продажи.',
      minutes: 90,
      skills: ['marketing', 'speaking'],
      type: 'defense',
    },
    joint: {
      title: 'Согласование go-to-market на модуль 5',
      brief: 'Общий beachhead + канал + sales motion на следующие 4 недели.',
      minutes: 40,
    },
    debate: 'Что важнее на midterm: красивый canvas или 4 жёстких цитаты клиентов?',
    case: 'Эксперимент «почти сработал». Iterate или kill?',
    simulation: 'Защита beachhead перед оппонентом, который предлагает другой сегмент.',
    reflection: ['Какая гипотеза умерла?', 'Что переносите в операции?'],
    errors: ['Маркетинг без связи с разговорами', 'Сегмент не сужен'],
    sales: 'Покажите в midterm хотя бы 3 квалифицированных касания из beachhead.',
    focus: 'midterm маркетинга',
  },
  {
    title: 'После «да»: операционное исполнение',
    problem: 'Продажа закрыта, но onboarding и delivery разваливают доверие.',
    outcomes: [
      'Описать процесс от оплаты до первой ценности',
      'Найти bottleneck',
      'Связать SLA обещаний с продажным скриптом',
    ],
    concepts: ['onboarding', 'время до ценности', 'handoff sales→ops'],
    mandatory: [
      ['sba-business-guide', 30],
      ['openstax-intro-business', 35],
      ['mit-new-enterprises', 30],
      ['yc-product-dev', 25],
    ],
    optional: [
      ['openstax-principles-management', 30],
      ['sba-startup-costs', 20],
    ],
    a: {
      title: 'Карта процесса delivery',
      brief: 'Шаги от yes до first value, владельцы, SLA, точки фейла. 1 схема + комментарии.',
      minutes: 75,
      skills: ['ops', 'sales'],
    },
    b: {
      title: 'Скрипт handoff',
      brief: 'Что продавец передаёт в delivery: данные, ожидания, риски. Чеклист kickoff-звонка.',
      minutes: 70,
      skills: ['ops', 'sales'],
    },
    joint: {
      title: 'Разбор срыва onboarding',
      brief: 'Кейс: клиент не активировался 14 дней. Найдите 3 причины и 3 фикса.',
      minutes: 35,
    },
    debate: 'Кто виноват в churn на 2-й неделе — продажи или ops?',
    case: 'Продавец пообещал кастом, ops не может. Как чинить систему?',
    simulation: 'Kickoff с недовольным клиентом после overpromise.',
    reflection: ['Какое обещание продаж вы бы запретили?', 'Где теряется время до ценности?'],
    errors: ['Продажа без capacity', 'Нет владельца onboarding'],
    sales: 'В оффере назовите срок first value и что нужно от клиента.',
    focus: 'операции после продажи',
  },
  {
    title: 'Unit-экономика для разговора о цене',
    problem: 'Цена ставится «как у конкурентов» без понимания вклада сделки.',
    outcomes: [
      'Оценить грубый CAC и вклад сделки',
      'Связать скидку с экономикой',
      'Подготовить ценовой разговор на фактах',
    ],
    concepts: ['CAC', 'вклад', 'скидка как инвестиция', 'payback'],
    mandatory: [
      ['mit-new-enterprises', 35],
      ['yc-pricing-101', 30],
      ['sba-manage-finances', 25],
      ['openstax-intro-business', 20],
    ],
    optional: [
      ['sba-write-business-plan', 25],
      ['sba-startup-costs', 20],
    ],
    a: {
      title: 'Грубая модель экономики',
      brief: 'Оцените CAC канала, средний чек, вклад, payback. Покажите допущения явно.',
      minutes: 80,
      skills: ['ops', 'entrepreneurial'],
    },
    b: {
      title: 'Прайс и политика скидок',
      brief: 'Прайс-лист v1 + правила скидок (когда можно/нельзя) + скрипт ценового разговора.',
      minutes: 75,
      skills: ['ops', 'negotiation'],
    },
    joint: {
      title: 'Ценовая симуляция',
      brief: 'Клиент давит на скидку. Используйте пакет (срок/объём/условия), не «−20% сразу».',
      minutes: 40,
    },
    debate: 'Можно ли продавать ниже вклада ради логотипа?',
    case: 'Большой бренд просит −40%. Посчитайте и решите.',
    simulation: 'Ценовой звонок: у вас есть floor и 2 пакета обмена.',
    reflection: ['Какое допущение в модели самое хрупкое?', 'Где скидка была страхом?'],
    errors: ['Скидка без обмена', 'CAC «из головы» без лога касаний'],
    sales: 'Перед скидкой назовите ценность в деньгах/риске клиента.',
    focus: 'экономика цены',
  },
  {
    title: 'Качество исполнения и обратная связь клиента',
    problem: 'Нет системы сбора сигналов после продажи — проблемы всплывают как churn.',
    outcomes: [
      'Ввести короткий feedback-цикл',
      'Связать NPS/сигналы с улучшениями',
      'Закрыть 1 операционный дефект',
    ],
    concepts: ['feedback loop', 'качество', 'закрытие дефекта'],
    mandatory: [
      ['hubspot-inbound-sales', 35],
      ['sba-business-guide', 30],
      ['yc-product-dev', 30],
      ['strategyzer-library', 25],
    ],
    optional: [
      ['openstax-principles-management', 30],
      ['strategyzer-vpc', 25],
    ],
    a: {
      title: 'Дизайн feedback-цикла',
      brief: 'Когда спрашиваем, какие 3 вопроса, кто отвечает, куда пишем, SLA реакции.',
      minutes: 70,
      skills: ['ops', 'psychology'],
    },
    b: {
      title: 'Фикс одного дефекта',
      brief: 'Выберите дефект delivery/sales handoff. До/после, метрика, проверка с клиентом/ролью.',
      minutes: 85,
      skills: ['ops', 'entrepreneurial'],
    },
    joint: {
      title: 'Ревью дефектов',
      brief: 'Приоритизируйте backlog дефектов по влиянию на деньги и доверие.',
      minutes: 35,
    },
    debate: 'Нужен ли NPS на 5 клиентах или достаточно качественных интервью?',
    case: 'Клиент «всё ок», но не продлевает. Какие вопросы вы не задали?',
    simulation: 'Звонок сбора фидбека без перехода в upsell первые 8 минут.',
    reflection: ['Какой сигнал вы раньше игнорировали?', 'Дефект реально закрыт?'],
    errors: ['Сбор фидбека без владельца фикса', 'Upsell вместо слушания'],
    sales: 'Добавьте в CRM поле «риск churn» и заполните его после kickoff.',
    focus: 'качество исполнения',
  },
  {
    title: 'Midterm 5: операции и экономика',
    problem: 'Проверка связки продажи → delivery → экономика.',
    outcomes: [
      'Сдать process map + модель экономики + политику скидок',
      'Защитить ценовое решение',
      'Показать устранение дефекта',
    ],
    concepts: ['midterm', 'CAC', 'delivery'],
    mandatory: [
      ['mit-new-enterprises', 30],
      ['openstax-intro-business', 25],
      ['yc-pricing-101', 25],
      ['sba-manage-finances', 20],
    ],
    optional: [
      ['sba-startup-costs', 20],
      ['yc-product-dev', 25],
    ],
    a: {
      title: 'Midterm A: ops & economics dossier',
      brief: 'Процесс, экономика, скидки, feedback-цикл, один закрытый дефект.',
      minutes: 100,
      skills: ['ops', 'entrepreneurial'],
      type: 'doc',
    },
    b: {
      title: 'Midterm B: pricing defense',
      brief: 'Защита цены и пакета на симуляции с давлением скидки.',
      minutes: 90,
      skills: ['negotiation', 'ops'],
      type: 'defense',
    },
    joint: {
      title: 'Согласование коммерческой политики',
      brief: 'Общие правила: floor цены, скидки, обещания SLA в продажах.',
      minutes: 40,
    },
    debate: 'Что чинить первым: CAC или время до ценности?',
    case: 'Рост продаж при росте churn. Диагноз midterm.',
    simulation: 'Клиент: «у конкурента дешевле». Ответ пакетом ценности.',
    reflection: ['Где модель расходится с реальностью?', 'Какой процесс всё ещё держится на геройстве?'],
    errors: ['Экономика без логов', 'Процесс только на слайде'],
    sales: 'В midterm покажите одну сделку с посчитанным вкладом.',
    focus: 'midterm операций',
  },
  {
    title: 'Бизнес-модель как система',
    problem: 'Отдельные навыки не складываются в работающую модель.',
    outcomes: [
      'Заполнить Business Model Canvas честно',
      'Пометить 3 самых рискованных гипотезы',
      'Связать блоки canvas с продажами недели',
    ],
    concepts: ['BMC', 'гипотезы', 'риск', 'система'],
    mandatory: [
      ['strategyzer-bmc', 25],
      ['strategyzer-vpc', 25],
      ['strategyzer-library', 25],
      ['openstax-entrepreneurship', 35],
    ],
    optional: [['yc-pmf', 25]],
    a: {
      title: 'BMC v1 с рисками',
      brief: 'Заполните 9 блоков. Красным — гипотезы без доказательств. План проверки на 14 дней.',
      minutes: 80,
      skills: ['entrepreneurial'],
    },
    b: {
      title: 'Value Proposition Canvas',
      brief: 'Jobs/pains/gains ↔ продукты/pain relievers/gain creators. Разрывы и фиксы.',
      minutes: 80,
      skills: ['entrepreneurial', 'marketing'],
    },
    joint: {
      title: 'Выбор 3 тестов',
      brief: 'Выберите 3 теста гипотез на 2 недели: метод, метрика, kill-критерий.',
      minutes: 40,
    },
    debate: 'Canvas — стратегия или список wishful thinking?',
    case: 'Красивый canvas, 0 платящих. Что выкидываете первым?',
    simulation: 'Объясните модель за 3 минуты инвестору, затем за 3 минуты клиенту.',
    reflection: ['Какой блок вы заполняли фантазией?', 'Какой тест самый дешёвый?'],
    errors: ['Пустые каналы «SMM»', 'Доходы без подтверждённой цены'],
    sales: 'Один блок Channels должен вести к конкретным касаниям на этой неделе.',
    focus: 'бизнес-модель',
  },
  {
    title: 'Система продаж основателя',
    problem: 'Продажи зависят от настроения, а не от ритма.',
    outcomes: [
      'Собрать weekly sales operating rhythm',
      'Определить leading indicators',
      'Провести неделю по ритму',
    ],
    concepts: ['ритм', 'leading indicators', 'pipeline review'],
    mandatory: [
      ['yc-sales-playbook', 35],
      ['hubspot-inbound-sales', 40],
      ['mit-entrepreneurial-sales', 30],
      ['sba-write-business-plan', 20],
    ],
    optional: [
      ['hubspot-sales-enablement', 30],
      ['yc-dont-scale', 25],
    ],
    a: {
      title: 'Sales rhythm design',
      brief: 'Календарь недели: prospecting, разговоры, follow-up, review. Нормы активности.',
      minutes: 70,
      skills: ['sales', 'ops'],
    },
    b: {
      title: 'Dashboard ведущих метрик',
      brief: '5 leading metrics + определение каждой + пороги «красная зона».',
      minutes: 70,
      skills: ['sales', 'ops'],
    },
    joint: {
      title: 'Pipeline review 20 мин',
      brief: 'Проведите review по правилам: статус, риск, следующий шаг, просьба помощи.',
      minutes: 40,
    },
    debate: 'Нормы активности мотивируют или превращают продажи в спам?',
    case: 'Неделя «занят продуктом» — pipeline встал. Как ритм это ловит?',
    simulation: 'Pipeline review, где один лид «висит» 3 недели — решение сейчас.',
    reflection: ['Какой leading indicator вы игнорировали?', 'Ритм реалистичен?'],
    errors: ['Только revenue как метрика недели', 'Нет времени на prospecting'],
    sales: 'Выполните норму касаний 5 дней подряд и сдайте лог.',
    focus: 'система продаж',
  },
  {
    title: 'Лидерство влияния без формальной власти',
    problem: 'Нужно двигать сделки и решения через людей, которые вам не подчиняются.',
    outcomes: [
      'Составить карту влияния в клиенте/команде',
      'Запросить помощь/интро без давления',
      'Провести сложный разговор о риске',
    ],
    concepts: ['влияние', 'социальный капитал', 'трудный разговор'],
    mandatory: [
      ['openstax-organizational-behavior', 35],
      ['pon-harvard-home', 30],
      ['openstax-principles-management', 30],
      ['pon-batna-power', 15],
    ],
    optional: [
      ['yc-startup-ideas', 25],
      ['mit-power-negotiation', 30],
    ],
    a: {
      title: 'Карта влияния',
      brief: 'Для ключевой сделки/инициативы: кто влияет, чем мотивирован, как вы строите кредит доверия.',
      minutes: 75,
      skills: ['psychology', 'negotiation'],
    },
    b: {
      title: 'Скрипт трудного разговора',
      brief: 'Разговор о сорванном сроке/риске: факты, влияние, просьба, следующий шаг. Прогон вслух.',
      minutes: 75,
      skills: ['speaking', 'negotiation'],
    },
    joint: {
      title: 'Симуляция трудного разговора',
      brief: 'Роли: вы и контрагент. Наблюдатель отмечает давление vs ясность.',
      minutes: 45,
    },
    debate: 'Можно ли «продавить» сделку через чемпиона в обход блокера?',
    case: 'Внутренний спонсор пропал. Ваш план восстановления влияния.',
    simulation: 'Просьба об интро у занятого контакта — 90 секунд.',
    reflection: ['Где вы манипулировали вместо ясности?', 'Какой кредит доверия вы уже заработали?'],
    errors: ['Обход стейкхолдера втихую', 'Размытая просьба'],
    sales: 'Запросите одно интро с чёткой формулировкой ценности для обеих сторон.',
    focus: 'влияние',
  },
  {
    title: 'Midterm 6: системы и лидерство',
    problem: 'Проверка целостности модели, ритма продаж и влияния.',
    outcomes: [
      'Сдать BMC + sales rhythm + карта влияния',
      'Защитить систему целиком',
      'Показать доказательства исполнения ритма',
    ],
    concepts: ['midterm', 'система', 'ритм'],
    mandatory: [
      ['strategyzer-bmc', 20],
      ['yc-sales-playbook', 25],
      ['openstax-entrepreneurship', 25],
      ['mit-entrepreneurial-sales', 20],
    ],
    optional: [
      ['strategyzer-vpc', 25],
      ['openstax-principles-management', 30],
    ],
    a: {
      title: 'Midterm A: system dossier',
      brief: 'BMC, VPC, ритм, метрики, карта влияния, лог недели.',
      minutes: 100,
      skills: ['entrepreneurial', 'sales'],
      type: 'doc',
    },
    b: {
      title: 'Midterm B: system defense',
      brief: '12 минут: как система приводит к сделкам; ответы на атаки по слабым блокам.',
      minutes: 95,
      skills: ['speaking', 'entrepreneurial'],
      type: 'defense',
    },
    joint: {
      title: 'Стресс-тест системы',
      brief: 'Партнёр атакует 3 слабых гипотезы. Зафиксируйте патчи.',
      minutes: 40,
    },
    debate: 'Система без харизмы продавца — достаточна ли?',
    case: 'Ритм соблюдён, конверсия падает. Что диагностируете?',
    simulation: 'Защита системы перед «советом» из двух ролей.',
    reflection: ['Какой блок системы всё ещё на геройстве?', 'Готовы ли к финалу?'],
    errors: ['Canvas без логов продаж', 'Метрики без порогов'],
    sales: 'В защите покажите живой pipeline и следующий шаг по топ-3 сделкам.',
    focus: 'midterm систем',
  },
  {
    title: 'Финальная аттестация — сборка портфолио',
    problem: 'Нужно собрать доказательную базу курса, а не «ещё один эссе».',
    outcomes: [
      'Собрать портфолио артефактов недель 1–24',
      'Выбрать финальный коммерческий кейс',
      'Закрыть пробелы в доказательствах',
    ],
    concepts: ['портфолио', 'доказательства', 'финальный кейс'],
    mandatory: [
      ['sba-write-business-plan', 30],
      ['strategyzer-bmc', 25],
      ['yc-sales-playbook', 30],
    ],
    optional: [
      ['strategyzer-vpc', 25],
      ['yc-pmf', 25],
      ['sba-manage-finances', 25],
    ],
    a: {
      title: 'Портфолио A: артефакты и кейс',
      brief: 'Индекс артефактов + выбранный кейс + пробелы. План закрытия пробелов за неделю 26.',
      minutes: 100,
      skills: ['entrepreneurial', 'sales'],
      type: 'doc',
    },
    b: {
      title: 'Портфолио B: narrative защиты',
      brief: 'Скрипт итоговой защиты 12 минут: проблема, практика, результаты, чему научились, ask.',
      minutes: 95,
      skills: ['presentation', 'speaking'],
      type: 'defense',
    },
    joint: {
      title: 'Репетиция финала',
      brief: 'Полный прогон защиты + список дыр в доказательствах.',
      minutes: 50,
    },
    debate: 'Что важнее в финале: рост метрик или качество мышления о провалах?',
    case: 'У участника мало «побед», но сильный разбор ошибок. Как оценивать?',
    simulation: 'Чёрный ящик вопросов по любому модулю курса.',
    reflection: ['Какой артефакт самый сильный?', 'Где вы всё ещё имитируете прогресс?'],
    errors: ['Портфолио из конспектов без практики', 'Нет сквозного кейса'],
    sales: 'В кейсе должна быть линия реальных/учебных касаний с датами.',
    focus: 'финальное портфолио',
  },
  {
    title: 'Финальная аттестация — защита',
    problem: 'Итоговая защита: связать продажи, переговоры, маркетинг, ops и модель.',
    outcomes: [
      'Сдать финальный пакет',
      'Пройти защиту 15+10',
      'Зафиксировать план практики на 30 дней после курса',
    ],
    concepts: ['final', 'защита', 'план после курса'],
    mandatory: [
      ['mit-new-enterprises', 25],
      ['pon-negotiation-skills', 20],
      ['hubspot-inbound-sales', 20],
      ['yc-sales-playbook', 20],
    ],
    optional: [
      ['strategyzer-bmc', 25],
      ['yc-pricing-101', 25],
      ['pon-batna-examples', 20],
    ],
    a: {
      title: 'Final A: полный пакет',
      brief: 'Кейс, экономика, pipeline, BMC, 3 сильных артефакта, план на 30 дней.',
      minutes: 100,
      skills: ['entrepreneurial', 'ops', 'sales'],
      type: 'doc',
    },
    b: {
      title: 'Final B: defense 15+10',
      brief: 'Защита и Q&A. Сдайте запись/протокол и ответы на 5 заранее неизвестных типов вопросов.',
      minutes: 100,
      skills: ['speaking', 'presentation', 'negotiation'],
      type: 'defense',
    },
    joint: {
      title: 'Взаимная аттестация',
      brief: 'Оценка по финальной рубрике + одно обязательство практики на месяц.',
      minutes: 40,
    },
    debate: 'Курс успешен, если изменилось поведение в продажах — согласны?',
    case: 'Итог: что считать выпускным стандартом для обоих участников.',
    simulation: 'Финальная защита с эскалацией сложных вопросов по всем модулям.',
    reflection: ['Какое поведение изменилось устойчиво?', 'Что продолжите измерять?'],
    errors: ['Защита без цифр и дат', 'План на 30 дней из общих слов'],
    sales: 'Назовите 3 сделки/разговора следующего месяца и первый шаг по каждой.',
    focus: 'финальная защита',
  },
]

function buildWeek(weekNumber: number, seed: WeekSeed): WeekDef {
  const sources: WeekSourceLink[] = []
  let order = 1
  for (const [id, minutes] of seed.mandatory) {
    sources.push(src(id, minutes, true, order++))
  }
  for (const [id, minutes] of seed.optional ?? []) {
    sources.push(src(id, minutes, false, order++))
  }

  const code = `W${String(weekNumber).padStart(2, '0')}`
  return {
    week_number: weekNumber,
    title_ru: seed.title,
    summary_ru: seed.problem,
    problem_ru: seed.problem,
    outcomes: seed.outcomes,
    concepts: seed.concepts,
    sources,
    assignment_a: {
      code: `${code}-A`,
      participant_slot: 'A',
      title_ru: seed.a.title,
      brief_md: seed.a.brief,
      deliverable_type: seed.a.type ?? 'text',
      max_minutes: seed.a.minutes,
      skill_slugs: seed.a.skills,
    },
    assignment_b: {
      code: `${code}-B`,
      participant_slot: 'B',
      title_ru: seed.b.title,
      brief_md: seed.b.brief,
      deliverable_type: seed.b.type ?? 'text',
      max_minutes: seed.b.minutes,
      skill_slugs: seed.b.skills,
    },
    joint: {
      code: `${code}-JOINT`,
      participant_slot: 'both',
      title_ru: seed.joint.title,
      brief_md: seed.joint.brief,
      deliverable_type: 'text',
      max_minutes: seed.joint.minutes,
      skill_slugs: ['entrepreneurial'],
    },
    debate_ru: seed.debate,
    case_ru: seed.case,
    simulation_ru: seed.simulation,
    rubric: defaultRubric(seed.focus),
    reflection: seed.reflection,
    error_watchlist: seed.errors,
    sales_drill_ru: seed.sales,
    learning_goals: seed.outcomes,
  }
}

if (WEEK_SEEDS.length !== 26) {
  throw new Error(`Expected 26 week seeds, got ${WEEK_SEEDS.length}`)
}

export const WEEKS: WeekDef[] = WEEK_SEEDS.map((seed, i) => buildWeek(i + 1, seed))

export const EXAMS: ExamDef[] = [
  {
    id: 'exam-mid-4',
    week_number: 4,
    kind: 'midterm',
    title_ru: 'Промежуточная аттестация 1 — продажи и психология',
    brief_md: 'Портфолио ICP/скрипт/стейкхолдеры + устная защита.',
  },
  {
    id: 'exam-mid-8',
    week_number: 8,
    kind: 'midterm',
    title_ru: 'Промежуточная аттестация 2 — переговоры',
    brief_md: 'Досье переговоров + живая защита переговоров.',
  },
  {
    id: 'exam-mid-12',
    week_number: 12,
    kind: 'midterm',
    title_ru: 'Промежуточная аттестация 3 — презентации',
    brief_md: 'Пакет питча + живой питч и ответы на вопросы.',
  },
  {
    id: 'exam-mid-16',
    week_number: 16,
    kind: 'midterm',
    title_ru: 'Промежуточная аттестация 4 — маркетинг и discovery',
    brief_md: 'Досье discovery/сегмента + защита эксперимента канала.',
  },
  {
    id: 'exam-mid-20',
    week_number: 20,
    kind: 'midterm',
    title_ru: 'Промежуточная аттестация 5 — операции и экономика',
    brief_md: 'Досье операций/экономики + защита ценообразования.',
  },
  {
    id: 'exam-mid-24',
    week_number: 24,
    kind: 'midterm',
    title_ru: 'Промежуточная аттестация 6 — системы и лидерство',
    brief_md: 'Досье системы + защита системы.',
  },
  {
    id: 'exam-final-25',
    week_number: 25,
    kind: 'final',
    title_ru: 'Финальная аттестация — сборка портфолио',
    brief_md: 'Индекс артефактов курса и текст защиты.',
  },
  {
    id: 'exam-final-26',
    week_number: 26,
    kind: 'final',
    title_ru: 'Финальная аттестация — защита',
    brief_md: 'Полный пакет + защита 15 мин + 10 мин вопросов.',
  },
]

/** Mandatory load for a participant slot: sources + own assignment + joint. */
export function mandatoryMinutesForSlot(week: WeekDef, slot: 'A' | 'B' | null): number {
  const sourceMin = week.sources
    .filter((s) => s.is_mandatory)
    .reduce((sum, s) => sum + s.study_minutes_planned, 0)
  const own =
    slot === 'B' ? week.assignment_b.max_minutes : week.assignment_a.max_minutes
  return sourceMin + own + week.joint.max_minutes
}

export function assertCurriculumInvariants(): string[] {
  const errors: string[] = []
  if (WEEKS.length !== 26) errors.push(`weeks=${WEEKS.length}`)
  if (MODULES.length !== 7) errors.push(`modules=${MODULES.length}`)
  const midterms = EXAMS.filter((e) => e.kind === 'midterm')
  const finals = EXAMS.filter((e) => e.kind === 'final')
  if (midterms.length !== 6) errors.push(`midterms=${midterms.length}`)
  if (finals.length !== 2) errors.push(`finals=${finals.length}`)
  for (const w of WEEKS) {
    for (const slot of ['A', 'B'] as const) {
      const m = mandatoryMinutesForSlot(w, slot)
      if (m > 240) errors.push(`week ${w.week_number} slot ${slot}: ${m} min > 240`)
    }
    if (!w.assignment_a || !w.assignment_b) errors.push(`week ${w.week_number} missing A/B`)
    for (const link of w.sources.filter((s) => s.is_mandatory)) {
      const s = getSource(link.source_id)
      if (!s?.is_free || s.is_optional_paid) {
        errors.push(`week ${w.week_number} mandatory non-free ${link.source_id}`)
      }
      if (!s?.url.startsWith('https://')) errors.push(`bad url ${link.source_id}`)
    }
  }
  return errors
}

export function getWeek(n: number): WeekDef | undefined {
  return WEEKS.find((w) => w.week_number === n)
}

export function getModule(weekNumber: number): ModuleDef {
  return moduleForWeek(weekNumber)
}

export { MODULES, LIBRARY_SOURCES, SKILLS }
