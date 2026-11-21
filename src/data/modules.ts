export interface ModuleDef {
  id: string
  slug: string
  title_ru: string
  order_index: number
  description_ru: string
  estimated_hours: number
  week_from: number
  week_to: number
}

export const MODULES: ModuleDef[] = [
  {
    id: 'mod-1',
    slug: 'sales-psychology',
    title_ru: 'Продажи и психология покупателя',
    order_index: 1,
    description_ru:
      'Воронка, диагностика, карта лиц, принимающих решение (ЛПР), еженедельная практика продаж.',
    estimated_hours: 16,
    week_from: 1,
    week_to: 4,
  },
  {
    id: 'mod-2',
    slug: 'negotiation',
    title_ru: 'Переговоры',
    order_index: 2,
    description_ru: 'Интересы против позиций, запасной план (BATNA), сложные сделки, симуляции.',
    estimated_hours: 16,
    week_from: 5,
    week_to: 8,
  },
  {
    id: 'mod-3',
    slug: 'presentation-speaking',
    title_ru: 'Презентации и публичные выступления',
    order_index: 3,
    description_ru: 'Структура питча, слайды, защита, голос и присутствие.',
    estimated_hours: 16,
    week_from: 9,
    week_to: 12,
  },
  {
    id: 'mod-4',
    slug: 'marketing-discovery',
    title_ru: 'Маркетинг и исследование клиентов',
    order_index: 4,
    description_ru: 'Сегменты, позиционирование, исследование клиентов, эксперименты во входящем трафике.',
    estimated_hours: 16,
    week_from: 13,
    week_to: 16,
  },
  {
    id: 'mod-5',
    slug: 'ops-economics',
    title_ru: 'Операции и экономика',
    order_index: 5,
    description_ru:
      'Послепродажный процесс, рамки стоимости привлечения и ценности клиента (CAC/LTV), исполнение обязательств.',
    estimated_hours: 16,
    week_from: 17,
    week_to: 20,
  },
  {
    id: 'mod-6',
    slug: 'systems-leadership',
    title_ru: 'Системы и предпринимательское лидерство',
    order_index: 6,
    description_ru: 'Бизнес-модель, команды влияния, масштабирование практики продаж.',
    estimated_hours: 16,
    week_from: 21,
    week_to: 24,
  },
  {
    id: 'mod-7',
    slug: 'final-attestation',
    title_ru: 'Финальная аттестация',
    order_index: 7,
    description_ru: 'Итоговый кейс, защита, портфолио работ за курс.',
    estimated_hours: 8,
    week_from: 25,
    week_to: 26,
  },
]

export function moduleForWeek(weekNumber: number): ModuleDef {
  const mod = MODULES.find((m) => weekNumber >= m.week_from && weekNumber <= m.week_to)
  if (!mod) throw new Error(`No module for week ${weekNumber}`)
  return mod
}
