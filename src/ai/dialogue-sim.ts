/**
 * Turn-based conversation sims — local rule-based «client» (no paid API).
 * Primary: sales. Negotiation reuses the same turn loop with counterpart personas.
 */

export type DialogueEndReason = 'goal' | 'dead_end' | 'max_turns' | 'user_ended'

export type DialogueKind = 'sales' | 'negotiation'

export interface DialoguePersona {
  id: string
  /** Plain-language label shown in UI */
  label: string
  tip: string
  opening: string
  kind: DialogueKind
}

export interface DialogueMessage {
  role: 'user' | 'client'
  text: string
}

export interface DialogueTurnResult {
  reply: string
  endReason: DialogueEndReason | null
}

export const MAX_DIALOGUE_TURNS = 8

/** Consumer / buyer types — plain Russian, not CRM jargon. */
export const SALES_PERSONAS: DialoguePersona[] = [
  {
    id: 'skeptical-budget-owner',
    kind: 'sales',
    label: 'Скептичный руководитель с бюджетом',
    tip: 'Может заплатить, но не верит на слово. Спрашивайте про цифры, риски и «кто уже пробовал».',
    opening:
      'Добрый день. У меня пятнадцать минут. Зачем нам это — и чем лучше того, что уже есть?',
  },
  {
    id: 'enthusiast-no-budget',
    kind: 'sales',
    label: 'Восторженный сотрудник без денег',
    tip: 'Горит идеей, но платить не может. Цель — выйти на того, кто распоряжается бюджетом.',
    opening:
      'О, это звучит круто! Я бы сразу взял. Правда, бюджет у меня нулевой — но давайте обсудим!',
  },
  {
    id: 'busy-champion',
    kind: 'sales',
    label: 'Занятый чемпион внутри компании',
    tip: 'Союзник внутри клиента. Мало времени — помогите ему «продать» вас дальше коротко и по делу.',
    opening:
      'Слушаю, но у меня созвон через десять минут. Что нужно от меня и какой следующий шаг?',
  },
  {
    id: 'tough-procurement',
    kind: 'sales',
    label: 'Жёсткий закупщик',
    tip: 'Сравнивает по чеклисту: цена, SLA, документы. Закрывайте пункты списка, не «вдохновляйте».',
    opening:
      'Отправьте коммерческое предложение. Нас интересуют цена, срок внедрения и условия расторжения.',
  },
]

export const NEGOTIATION_PERSONAS: DialoguePersona[] = [
  {
    id: 'price-hardliner',
    kind: 'negotiation',
    label: 'Жёсткий контрагент по цене',
    tip: 'Давит скидкой. Отвечайте обменом («если…, то…»), а не односторонней уступкой.',
    opening: 'Без скидки 20% разговора не будет. Что можете предложить прямо сейчас?',
  },
  {
    id: 'exchange-seeker',
    kind: 'negotiation',
    label: 'Партнёр, готовый к обмену',
    tip: 'Ищет пакет интересов. Назовите, что важно вам и что можете отдать взамен.',
    opening: 'Мы открыты к сделке, если найдём взаимный обмен. С чего начнём?',
  },
  {
    id: 'time-pressured',
    kind: 'negotiation',
    label: 'Сторона под дедлайном',
    tip: 'Спешит закрыть вопрос. Фиксируйте красную линию и BATNA, не сдавайтесь из-за спешки.',
    opening: 'Нам нужно решение до пятницы. Давайте по пунктам — что реально возможно?',
  },
]

export function getPersona(id: string): DialoguePersona | undefined {
  return [...SALES_PERSONAS, ...NEGOTIATION_PERSONAS].find((p) => p.id === id)
}

export function personasFor(kind: DialogueKind): DialoguePersona[] {
  return kind === 'sales' ? SALES_PERSONAS : NEGOTIATION_PERSONAS
}

function hasAny(text: string, needles: string[]): boolean {
  const t = text.toLowerCase()
  return needles.some((n) => t.includes(n.toLowerCase()))
}

function isQuestion(text: string): boolean {
  return text.includes('?') || hasAny(text, ['как', 'что', 'кто', 'когда', 'почему', 'зачем', 'сколько'])
}

function isPitchy(text: string): boolean {
  return hasAny(text, [
    'наш продукт',
    'мы предлагаем',
    'наше решение',
    'уникальн',
    'лучшие на рынке',
    'внедрим за',
  ])
}

function isDiagnosis(text: string): boolean {
  return hasAny(text, [
    'боль',
    'проблем',
    'сейчас',
    'как решаете',
    'кто принимает',
    'бюджет',
    'приоритет',
    'что мешает',
    'как сейчас',
  ])
}

function isCta(text: string): boolean {
  return hasAny(text, [
    'встреч',
    'созвон',
    'пилот',
    'демо',
    'давайте',
    'когда удобно',
    'следующ',
    'назнач',
    'календар',
  ])
}

function isPricePush(text: string): boolean {
  return hasAny(text, ['скидк', 'дешевл', 'цену', 'цена', 'бесплатн', '20%'])
}

function isExchange(text: string): boolean {
  return hasAny(text, ['если', 'то ', 'взамен', 'обмен', 'при условии', 'пакет'])
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]!
}

function salesReply(
  persona: DialoguePersona,
  userText: string,
  userTurn: number,
  history: DialogueMessage[],
): DialogueTurnResult {
  const userMsgs = history.filter((m) => m.role === 'user').length + 1
  const askedDiagnosis = history.some((m) => m.role === 'user' && isDiagnosis(m.text)) || isDiagnosis(userText)
  const askedCta = isCta(userText)
  const pitchEarly = isPitchy(userText) && userTurn <= 2 && !isDiagnosis(userText)

  if (pitchEarly) {
    const replies: Record<string, string[]> = {
      'skeptical-budget-owner': [
        'Стоп. Вы ещё не спросили, какая у нас боль. Зачем мне питч?',
        'Цифры продукта без контекста не убеждают. Что ломается у нас сейчас?',
      ],
      'enthusiast-no-budget': [
        'Звучит круто, но я всё равно не плательщик. Кому внутри ещё это продавать?',
        'Мне нравится! Только денег нет — есть ли короткий путь к моему руководителю?',
      ],
      'busy-champion': [
        'Мне некогда слушать питч. Дайте одну фразу ценности для моего директора.',
        'Сократите до 20 секунд: проблема → что нужно от меня.',
      ],
      'tough-procurement': [
        'Питч не нужен. Пришлите цену, SLA и срок. Остальное — позже.',
        'Мы работаем по чеклисту. Закройте формальные пункты.',
      ],
    }
    return {
      reply: pick(replies[persona.id] ?? ['Не начинайте с продукта. Спросите про нашу ситуацию.'], userTurn),
      endReason: userTurn >= 3 ? 'dead_end' : null,
    }
  }

  // Persona-specific branches
  if (persona.id === 'enthusiast-no-budget') {
    if (hasAny(userText, ['бюджет', 'лпр', 'руководитель', 'директор', 'плательщик', 'кто решает'])) {
      return {
        reply: 'Да, решать будет мой руководитель. Могу познакомить, если дадите короткий бриф на одну страницу.',
        endReason: askedCta || userMsgs >= 4 ? 'goal' : null,
      }
    }
    if (askedCta && askedDiagnosis) {
      return {
        reply: 'Ок, поставлю вас на пятницу с руководителем. Пришлите 3 буллета заранее.',
        endReason: 'goal',
      }
    }
    return {
      reply: pick(
        [
          'Я в восторге, правда. Но без бюджета я только «фанат». Как вы обычно выходите на плательщика?',
          'Могу тащить идею внутри — что мне сказать боссу за 30 секунд?',
          'Круто. А если я приведу ЛПР на короткий созвон — что покажете?',
        ],
        userTurn + userText.length,
      ),
      endReason: userMsgs >= MAX_DIALOGUE_TURNS ? 'max_turns' : null,
    }
  }

  if (persona.id === 'tough-procurement') {
    if (hasAny(userText, ['цена', 'sla', 'срок', 'договор', 'расторжен', 'нда', 'чек-лист', 'чеклист'])) {
      if (askedCta) {
        return {
          reply: 'Пункты закрыты. Пришлите КП на согласование — поставлю в реестр на эту неделю.',
          endReason: 'goal',
        }
      }
      return {
        reply: 'Принято. Ещё нужны контакты поддержки и условия пилота. Когда пришлёте полный пакет?',
        endReason: null,
      }
    }
    if (isPitchy(userText) || (!hasAny(userText, ['цена', 'срок', 'услови']) && userTurn > 2)) {
      return {
        reply: 'Без цифр и условий в реестр не внесём. Разговор закрываю до получения КП.',
        endReason: userTurn >= 4 ? 'dead_end' : null,
      }
    }
    return {
      reply: 'Жду цену, срок внедрения и условия расторжения. Остальное вторично.',
      endReason: userMsgs >= MAX_DIALOGUE_TURNS ? 'max_turns' : null,
    }
  }

  if (persona.id === 'busy-champion') {
    if (askedCta && (askedDiagnosis || hasAny(userText, ['директор', 'бриф', 'форвард', 'перешлю']))) {
      return {
        reply: 'Ок. Перешлю директору ваш короткий бриф и предложу слот в четверг. Спасибо, что уложились.',
        endReason: 'goal',
      }
    }
    if (userText.length > 220) {
      return {
        reply: 'Слишком длинно — я отключаюсь. Одна фраза ценности и один запрос ко мне.',
        endReason: userTurn >= 3 ? 'dead_end' : null,
      }
    }
    return {
      reply: pick(
        [
          'Коротко: какую боль закрываем и что нужно от меня сегодня?',
          'Могу открыть дверь к ЛПР, если дадите им «шпаргалку» на 5 строк.',
          'Времени мало. Предложите конкретный следующий шаг на 15 минут.',
        ],
        userTurn,
      ),
      endReason: userMsgs >= MAX_DIALOGUE_TURNS ? 'max_turns' : null,
    }
  }

  // skeptical-budget-owner (default sales)
  if (askedCta && askedDiagnosis && userMsgs >= 3) {
    return {
      reply: 'Хорошо. Пилот на две недели — если метрика сдвинется, обсудим бюджет. Пришлите слоты.',
      endReason: 'goal',
    }
  }
  if (isDiagnosis(userText) || isQuestion(userText)) {
    return {
      reply: pick(
        [
          'Сейчас теряем около двух дней на ручном согласовании. Риски — срыв дедлайнов.',
          'Бюджет есть, но прошлый подрядчик не дал ROI. Чем докажете иначе?',
          'Решаю я. Покажите, где уже сработало на похожем объёме.',
        ],
        userTurn + userMsgs,
      ),
      endReason: null,
    }
  }
  if (isPitchy(userText)) {
    return {
      reply: 'Питч без диагностики — минус доверие. Вернитесь к нашей ситуации.',
      endReason: userTurn >= 5 ? 'dead_end' : null,
    }
  }
  return {
    reply: pick(
      [
        'Не убедили. Какой риск для нас, если ничего не менять?',
        'Нужны факты, не лозунги. Кто уже внедрил и с каким эффектом?',
        'У меня бюджет, но нет терпения к общим словам. Конкретика?',
      ],
      userTurn,
    ),
    endReason: userMsgs >= MAX_DIALOGUE_TURNS ? 'max_turns' : null,
  }
}

function negotiationReply(
  persona: DialoguePersona,
  userText: string,
  userTurn: number,
  history: DialogueMessage[],
): DialogueTurnResult {
  const userMsgs = history.filter((m) => m.role === 'user').length + 1

  if (persona.id === 'price-hardliner') {
    if (isExchange(userText) && !hasAny(userText, ['ладно', 'берём скидку', 'без условий'])) {
      return {
        reply: 'Если фиксируем объём на квартал — обсудим −10%, не −20%. Можем зафиксировать?',
        endReason: userMsgs >= 3 ? 'goal' : null,
      }
    }
    if (isPricePush(userText) && !isExchange(userText)) {
      return {
        reply: 'Скидка без обмена — нет. Что берёте взамен: срок, объём, предоплату?',
        endReason: userTurn >= 5 ? 'dead_end' : null,
      }
    }
    return {
      reply: pick(
        [
          '20% или ищем другого. Есть ли пакетный обмен?',
          'Цена — позиция. Назовите интерес: скорость, объём, риск?',
        ],
        userTurn,
      ),
      endReason: userMsgs >= MAX_DIALOGUE_TURNS ? 'max_turns' : null,
    }
  }

  if (persona.id === 'exchange-seeker') {
    if (isExchange(userText) || hasAny(userText, ['интерес', 'нам важно', 'вам важно'])) {
      return {
        reply: 'Вижу обмен. Давайте зафиксируем: вы даёте X, мы — Y. Подходит протокол?',
        endReason: userMsgs >= 3 && isCta(userText) ? 'goal' : userMsgs >= 5 ? 'goal' : null,
      }
    }
    return {
      reply: 'Расскажите интересы, не только цену. Что для вас критично сохранить?',
      endReason: userMsgs >= MAX_DIALOGUE_TURNS ? 'max_turns' : null,
    }
  }

  // time-pressured
  if (hasAny(userText, ['батна', 'batna', 'красная', 'не ниже', 'предел']) && isExchange(userText)) {
    return {
      reply: 'Ок, укладываемся в пятницу на этих условиях. Пришлите краткий протокол сегодня.',
      endReason: 'goal',
    }
  }
  if (hasAny(userText, ['ладно как скажете', 'берём как есть', 'без условий']) && userTurn <= 2) {
    return {
      reply: 'Торопитесь сдаться? Мы всё равно настаиваем на своём. Где ваша красная линия?',
      endReason: null,
    }
  }
  return {
    reply: pick(
      [
        'Времени мало. Назовите красную линию и один обменный пункт.',
        'До пятницы нужно да/нет. Что реально возможно без ломки вашей BATNA?',
      ],
      userTurn,
    ),
    endReason: userMsgs >= MAX_DIALOGUE_TURNS ? 'max_turns' : null,
  }
}

/** One user phrase → local client reply (+ optional end). */
export function nextClientTurn(
  personaId: string,
  userText: string,
  history: DialogueMessage[],
): DialogueTurnResult {
  const persona = getPersona(personaId)
  const trimmed = userText.trim()
  if (!persona) {
    return { reply: 'Клиент недоступен (неизвестная роль).', endReason: 'dead_end' }
  }
  if (!trimmed) {
    return { reply: '…тишина. Скажите что-нибудь по делу.', endReason: null }
  }

  const userTurn = history.filter((m) => m.role === 'user').length + 1
  if (userTurn > MAX_DIALOGUE_TURNS) {
    return {
      reply: 'Время вышло. Давайте подведём итог раунда.',
      endReason: 'max_turns',
    }
  }

  if (persona.kind === 'negotiation') {
    return negotiationReply(persona, trimmed, userTurn, history)
  }
  return salesReply(persona, trimmed, userTurn, history)
}

export function formatTranscript(messages: DialogueMessage[]): string {
  return messages
    .map((m) => (m.role === 'user' ? `Вы: ${m.text}` : `Клиент: ${m.text}`))
    .join('\n')
}

export function endReasonLabel(reason: DialogueEndReason): string {
  switch (reason) {
    case 'goal':
      return 'Цель раунда достигнута'
    case 'dead_end':
      return 'Разговор зашёл в тупик'
    case 'max_turns':
      return 'Лимит реплик исчерпан'
    case 'user_ended':
      return 'Вы завершили диалог'
  }
}
