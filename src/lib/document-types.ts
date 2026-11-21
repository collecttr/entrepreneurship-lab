export type DocumentCategory =
  | 'essay'
  | 'research_report'
  | 'analytical_note'
  | 'commercial_proposal'
  | 'product_presentation'
  | 'negotiation_strategy'
  | 'final_work'

export type AiEvalStatus = 'none' | 'pending_ai' | 'manual_only' | 'completed'

export const DOCUMENT_CATEGORIES: { id: DocumentCategory; label_ru: string }[] = [
  { id: 'essay', label_ru: 'Эссе' },
  { id: 'research_report', label_ru: 'Исследовательский отчёт' },
  { id: 'analytical_note', label_ru: 'Аналитическая заметка' },
  { id: 'commercial_proposal', label_ru: 'Коммерческое предложение' },
  { id: 'product_presentation', label_ru: 'Продуктовая презентация' },
  { id: 'negotiation_strategy', label_ru: 'Стратегия переговоров' },
  { id: 'final_work', label_ru: 'Итоговая работа' },
]

export const ALLOWED_MIME: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
}

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.pptx'] as const
export const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

export const CATEGORY_STRUCTURE: Record<DocumentCategory, string> = {
  essay:
    '1) Тезис\n2) Аргументы с примерами из практики/источников\n3) Контраргумент и ответ\n4) Вывод и следующий шаг в продажах/учёбе',
  research_report:
    '1) Вопрос исследования\n2) Метод и источники (только verified free)\n3) Находки (факты ≠ интерпретации)\n4) Выводы и ограничения\n5) Рекомендации к действию',
  analytical_note:
    '1) Контекст (1 абзац)\n2) Диагноз проблемы\n3) Варианты и критерии сравнения\n4) Рекомендация и риски\n5) Метрика проверки через 7 дней',
  commercial_proposal:
    '1) Проблема клиента\n2) Предложение и объём\n3) Ценность / экономика\n4) Сроки и first value\n5) Цена и условия\n6) Конкретный ask / следующий шаг',
  product_presentation:
    '1) Проблема аудитории\n2) Решение (1 тезис на слайд)\n3) Proof\n4) Как купить / пилот\n5) Ask\n≤ 8 слайдов',
  negotiation_strategy:
    '1) Цели и красные линии\n2) Интересы сторон\n3) BATNA\n4) Пакет опций обмена\n5) Повестка встречи\n6) Протокол next steps',
  final_work:
    '1) Сквозной кейс курса\n2) Артефакты продаж/переговоров/маркетинга/ops\n3) Экономика и модель\n4) Разбор ошибок\n5) План практики на 30 дней',
}

export interface DocumentGroup {
  id: string
  owner_id: string
  title: string
  description_md: string
  category: DocumentCategory
  week_number: number | null
  assignment_code: string | null
  source_notes: string
  created_at: string
  updated_at: string
  ai_status: AiEvalStatus
  manual_score: number | null
  manual_feedback_md: string | null
}

export interface DocumentFileMeta {
  id: string
  document_group_id: string
  owner_id: string
  path: string
  filename: string
  mime: string
  size_bytes: number
  version: number
  created_at: string
  /** Demo: IndexedDB key; never a public URL */
  blob_key: string
}

export interface DocumentComment {
  id: string
  document_group_id: string
  document_file_id: string | null
  author_id: string
  body_md: string
  quote_md: string | null
  created_at: string
}

export function categoryLabel(id: DocumentCategory): string {
  return DOCUMENT_CATEGORIES.find((c) => c.id === id)?.label_ru ?? id
}

export function validateUploadFile(file: File): string | null {
  const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    return `Допустимы только PDF, DOCX, PPTX. Получено: ${ext || 'без расширения'}`
  }
  if (!ALLOWED_MIME[file.type] && file.type !== '') {
    // some browsers leave type empty for pptx — allow by extension
    if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
      return `Неподдерживаемый MIME: ${file.type}`
    }
  }
  if (file.size <= 0) return 'Пустой файл'
  if (file.size > MAX_FILE_BYTES) {
    return `Файл больше ${Math.round(MAX_FILE_BYTES / (1024 * 1024))} МБ`
  }
  return null
}

export function mimeForFile(file: File): string {
  if (file.type && ALLOWED_MIME[file.type]) return file.type
  const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase()
  if (ext === '.pdf') return 'application/pdf'
  if (ext === '.docx') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
}
