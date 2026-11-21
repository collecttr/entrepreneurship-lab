import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { WEEKS } from '@/data/curriculum'
import { privacyBannerText } from '@/lib/document-storage'
import {
  authorName,
  createDocumentWithUpload,
  latestVersion,
  listDocumentGroups,
  subscribeDocuments,
} from '@/lib/document-store'
import {
  ALLOWED_EXTENSIONS,
  CATEGORY_STRUCTURE,
  DOCUMENT_CATEGORIES,
  MAX_FILE_BYTES,
  categoryLabel,
  type DocumentCategory,
  type DocumentGroup,
  validateUploadFile,
} from '@/lib/document-types'

export function DocumentsPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<DocumentGroup[]>([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<DocumentCategory>('essay')
  const [week, setWeek] = useState('1')
  const [assignment, setAssignment] = useState('')
  const [sources, setSources] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    const refresh = () => setItems(listDocumentGroups())
    refresh()
    return subscribeDocuments(refresh)
  }, [])

  const assignmentOptions = useMemo(() => {
    const w = WEEKS.find((x) => x.week_number === Number(week))
    if (!w) return []
    return [w.assignment_a, w.assignment_b, w.joint]
  }, [week])

  if (!profile) return null

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!file) {
      setError('Выберите файл PDF, DOCX или PPTX')
      return
    }
    const v = validateUploadFile(file)
    if (v) {
      setError(v)
      return
    }
    setBusy(true)
    try {
      const g = await createDocumentWithUpload({
        owner_id: profile!.id,
        title,
        description_md: description,
        category,
        week_number: week ? Number(week) : null,
        assignment_code: assignment || null,
        source_notes: sources,
        file,
      })
      setShowForm(false)
      setTitle('')
      setDescription('')
      setSources('')
      setFile(null)
      setItems(listDocumentGroups())
      void navigate(`/documents/${g.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <header className="surface rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Документы</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Приватные файлы</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          PDF / DOCX / PPTX ≤ {Math.round(MAX_FILE_BYTES / (1024 * 1024))} МБ. Версии, привязка к неделе и
          заданию, комментарии. Без публичных ссылок.
        </p>
        <p className="mt-3 rounded-xl bg-amber-soft/50 px-3 py-2 text-xs text-ink">{privacyBannerText()}</p>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="mt-4 rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-on-accent hover:bg-teal-deep"
        >
          {showForm ? 'Закрыть форму' : 'Загрузить документ'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={(e) => void onCreate(e)} className="surface space-y-3 rounded-3xl p-5">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название"
            className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            rows={2}
            className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
          />
          <div className="grid gap-2 md:grid-cols-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              className="rounded-xl border border-ink/10 px-3 py-2 text-sm"
            >
              {DOCUMENT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label_ru}
                </option>
              ))}
            </select>
            <select
              value={week}
              onChange={(e) => {
                setWeek(e.target.value)
                setAssignment('')
              }}
              className="rounded-xl border border-ink/10 px-3 py-2 text-sm"
            >
              {WEEKS.map((w) => (
                <option key={w.week_number} value={w.week_number}>
                  Неделя {w.week_number}
                </option>
              ))}
            </select>
            <select
              value={assignment}
              onChange={(e) => setAssignment(e.target.value)}
              className="rounded-xl border border-ink/10 px-3 py-2 text-sm"
            >
              <option value="">Без задания</option>
              {assignmentOptions.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.code} · {a.title_ru}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={sources}
            onChange={(e) => setSources(e.target.value)}
            placeholder="Список источников (бесплатные проверенные / заметки по платным)"
            rows={2}
            className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
          />
          <div className="rounded-2xl bg-teal-soft/40 p-3 text-xs text-ink-soft">
            <p className="font-semibold text-ink">Рекомендуемая структура ({categoryLabel(category)})</p>
            <pre className="mt-1 whitespace-pre-wrap font-sans">{CATEGORY_STRUCTURE[category]}</pre>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-slate">
              Файл ({ALLOWED_EXTENSIONS.join(', ')})
            </span>
            <input
              type="file"
              accept={ALLOWED_EXTENSIONS.join(',')}
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                setFile(f)
                setError(f ? validateUploadFile(f) : null)
              }}
              className="block w-full text-sm"
            />
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-on-accent disabled:opacity-50"
          >
            {busy ? 'Загрузка…' : 'Сохранить приватно'}
          </button>
        </form>
      )}

      <ul className="space-y-3">
        {items.map((g) => {
          const latest = latestVersion(g.id)
          return (
            <li key={g.id} className="surface rounded-3xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal">
                    {categoryLabel(g.category)}
                    {g.week_number ? ` · неделя ${g.week_number}` : ''}
                    {g.assignment_code ? ` · ${g.assignment_code}` : ''}
                  </p>
                  <h2 className="mt-1 font-display text-xl text-ink">
                    <Link to={`/documents/${g.id}`} className="hover:text-teal">
                      {g.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-slate line-clamp-2">{g.description_md || 'Без описания'}</p>
                </div>
                <div className="text-right text-xs text-slate">
                  <p>{authorName(g.owner_id)}</p>
                  <p>{latest ? `v${latest.version} · ${latest.filename}` : 'нет файла'}</p>
                  <p className="mt-1 font-semibold text-ink">
                    {g.ai_status === 'pending_ai'
                      ? 'ожидает AI'
                      : g.ai_status === 'manual_only'
                        ? 'ручная оценка'
                        : g.ai_status}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
        {items.length === 0 && (
          <li className="text-sm text-slate">Документов пока нет — загрузите первый файл.</li>
        )}
      </ul>
    </div>
  )
}
