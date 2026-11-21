export type SkillCategory =
  | 'sales'
  | 'negotiation'
  | 'presentation'
  | 'psychology'
  | 'entrepreneurial'
  | 'marketing'
  | 'ops'
  | 'speaking'

export interface SkillDef {
  id: string
  slug: string
  title_ru: string
  category: SkillCategory
  description_ru: string
}

export const SKILLS: SkillDef[] = [
  {
    id: 'skill-sales',
    slug: 'sales',
    title_ru: 'Продажи',
    category: 'sales',
    description_ru: 'Диагностика потребности, оффер, следующий шаг, закрытие.',
  },
  {
    id: 'skill-negotiation',
    slug: 'negotiation',
    title_ru: 'Переговоры',
    category: 'negotiation',
    description_ru:
      'Интересы, запасной план (BATNA), варианты обмена — соглашение без уступок «в пустоту».',
  },
  {
    id: 'skill-presentation',
    slug: 'presentation',
    title_ru: 'Презентации',
    category: 'presentation',
    description_ru: 'Структура выступления, слайды, ясность аргумента.',
  },
  {
    id: 'skill-psychology',
    slug: 'psychology',
    title_ru: 'Психология покупателя',
    category: 'psychology',
    description_ru: 'Мотивы, возражения, карта лиц, принимающих решение (ЛПР), и влияния.',
  },
  {
    id: 'skill-entrepreneurial',
    slug: 'entrepreneurial',
    title_ru: 'Предпринимательское мышление',
    category: 'entrepreneurial',
    description_ru: 'Гипотезы, эксперименты, модель, риск.',
  },
  {
    id: 'skill-marketing',
    slug: 'marketing',
    title_ru: 'Маркетинг',
    category: 'marketing',
    description_ru: 'Сегмент, позиционирование, каналы, сообщение.',
  },
  {
    id: 'skill-ops',
    slug: 'ops',
    title_ru: 'Операции и экономика',
    category: 'ops',
    description_ru: 'Процессы после продажи, unit-экономика, исполнение.',
  },
  {
    id: 'skill-speaking',
    slug: 'speaking',
    title_ru: 'Публичные выступления',
    category: 'speaking',
    description_ru: 'Голос, темп, присутствие, защита позиции вслух.',
  },
]
