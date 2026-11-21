import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { privacyBannerText } from '@/lib/document-storage'
import {
  addDocumentComment,
  authorName,
  getDocumentGroup,
  latestVersion,
  listDocumentComments,
  listVersions,
  openPrivateDownload,
  setManualEvaluation,
  subscribeDocuments,
  uploadNewVersion,
} from '@/lib/document-store'
import {
  CATEGORY_STRUCTURE,
  categoryLabel,
  type DocumentComment,
  type DocumentFileMeta,
  type DocumentGroup,
  validateUploadFile,
} from '@/lib/document-types'

function aiStatusLabel(status: DocumentGroup['ai_status']): string {
  switch (status) {
    case 'pending_ai':
      return 'ожидает AI'
    case 'manual_only':
      return 'ручная оценка (AI выкл / spend lock)'
    case 'completed':
      return 'AI завершил'
    default:
      return 'нет оценки'
  }
}

export function DocumentDetailPage() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [group, setGroup] = useState<DocumentGroup | null>(null)
  const [versions, setVersions] = useState<DocumentFileMeta[]>([])
  const [comments, setComments] = useState<DocumentComment[]>([])
  const [body, setBody] = useState('')
  const [quote, setQuote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manualScore, setManualScore] = useState('')
  const [manualFb, setManualFb] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const refresh = () => {
      setGroup(getDocumentGroup(id) ?? null)
      setVersions(listVersions(id))
      setComments(listDocumentComments(id))
    }
    refresh()
    return subscribeDocuments(refresh)
  }, [id])

  if (!id) return <Navigate to="/documents" replace />
  if (!profile) return null
  if (!group) {
    return (
      <div className="surface rounded-3xl p-6">
        <p>Документ не найден.</p>
        <Link to="/documents" className="text-teal">
          ← Документы
        </Link>
      </div>
    )
  }

  const isOwner = group.owner_id === profile.id
  const latest = latestVersion(group.id)

  async function onDownload(file: DocumentFileMeta) {
    setError(null)
    try {
      await openPrivateDownload(file)
      setMsg('Скачивание через временный приватный URL (не публичная ссылка).')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка скачивания')
    }
  }

  async function onNewVersion(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return
    const v = validateUploadFile(file)
    if (v) {
      setError(v)
      return
    }
    setError(null)
    try {
      await uploadNewVersion(group!.id, profile!.id, file)
      setVersions(listVersions(group!.id))
      setGroup(getDocumentGroup(group!.id) ?? group)
      setMsg(`Загружена версия v${(latest?.version ?? 0) + 1}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка версии')
    }
  }

  function onComment(e: FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    addDocumentComment({
      document_group_id: group!.id,
      author_id: profile!.id,
      body_md: body,
      quote_md: quote,
      document_file_id: latest?.id ?? null,
    })
    setBody('')
    setQuote(null)
    setComments(listDocumentComments(group!.id))
  }

  function onManual(e: FormEvent) {
    e.preventDefault()
    const score = manualScore === '' ? null : Number(manualScore)
    setManualEvaluation(group!.id, score, manualFb)
    setGroup(getDocumentGroup(group!.id) ?? group)
    setMsg('Сохранена ручная оценка. AI-оценка не подставлялась.')
  }

  return (
    <div className="space-y-4">
      <header className="surface rounded-3xl p-6">
        <Link to="/documents" className="text-sm font-semibold text-teal">
          ← Все документы
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-teal">
          {categoryLabel(group.category)}
          {group.week_number ? ` · неделя ${group.week_number}` : ''}
          {group.assignment_code ? ` · ${group.assignment_code}` : ''}
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">{group.title}</h1>
        <p className="mt-2 text-sm text-slate">{group.description_md || 'Без описания'}</p>
        <p className="mt-2 text-xs text-slate">
          Владелец: {authorName(group.owner_id)} · обновлено {group.updated_at.slice(0, 16).replace('T', ' ')}
        </p>
        <p className="mt-3 rounded-xl bg-amber-soft/50 px-3 py-2 text-xs text-ink">{privacyBannerText()}</p>
      </header>

      <section className="surface rounded-3xl p-5">
        <h2 className="font-display text-xl text-ink">Рекомендуемая структура</h2>
        <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-slate">
          {CATEGORY_STRUCTURE[group.category]}
        </pre>
        {group.source_notes && (
          <div className="mt-3">
            <p className="text-xs font-semibold uppercase text-teal">Источники</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{group.source_notes}</p>
          </div>
        )}
      </section>

      <section className="surface rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl text-ink">Версии</h2>
          {isOwner && (
            <label className="cursor-pointer rounded-xl bg-teal px-3 py-2 text-sm font-semibold text-white">
              Новая версия
              <input
                type="file"
                accept=".pdf,.docx,.pptx"
                className="hidden"
                onChange={(e) => {
                  void onNewVersion(e.target.files)
                  e.target.value = ''
                }}
              />
            </label>
          )}
        </div>
        <ul className="mt-3 space-y-2">
          {versions.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-paper/80 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-ink">
                  v{f.version} · {f.filename}
                </p>
                <p className="text-xs text-slate">
                  {(f.size_bytes / 1024).toFixed(1)} КБ · {f.mime} · {f.created_at.slice(0, 19).replace('T', ' ')}
                </p>
                <p className="text-[10px] text-slate">path: {f.path} (private)</p>
              </div>
              <button
                type="button"
                onClick={() => void onDownload(f)}
                className="rounded-xl border border-ink/10 px-3 py-1.5 text-xs font-semibold text-teal"
              >
                Скачать (signed/demo)
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface rounded-3xl p-5 space-y-3">
        <h2 className="font-display text-xl text-ink">Оценка</h2>
        <p className="rounded-xl bg-mist px-3 py-2 text-sm text-ink">
          AI: <strong>{aiStatusLabel(group.ai_status)}</strong>
          {group.ai_status === 'pending_ai' &&
            ' — spend lock включён / AI не вызывался. Оценка не генерируется заглушкой.'}
        </p>
        {group.manual_score != null && (
          <p className="text-sm text-slate">
            Ручной балл: {group.manual_score}
            {group.manual_feedback_md ? ` · ${group.manual_feedback_md}` : ''}
          </p>
        )}
        {(profile.role === 'admin' || isOwner) && (
          <form onSubmit={onManual} className="space-y-2 border-t border-ink/5 pt-3">
            <p className="text-xs text-slate">Ручная оценка (stub до этапа AI)</p>
            <input
              type="number"
              min={0}
              max={100}
              value={manualScore}
              onChange={(e) => setManualScore(e.target.value)}
              placeholder="Балл 0–100"
              className="w-40 rounded-xl border border-ink/10 px-3 py-2 text-sm"
            />
            <textarea
              value={manualFb}
              onChange={(e) => setManualFb(e.target.value)}
              rows={2}
              placeholder="Фидбек"
              className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-xl border border-ink/10 px-3 py-2 text-sm font-semibold">
              Сохранить ручную оценку
            </button>
          </form>
        )}
      </section>

      <section className="surface rounded-3xl p-5 space-y-3">
        <h2 className="font-display text-xl text-ink">Комментарии</h2>
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="rounded-2xl bg-paper/80 px-3 py-2 text-sm">
              <p className="text-xs text-slate">
                {authorName(c.author_id)} · {new Date(c.created_at).toLocaleString('ru-RU')}
              </p>
              {c.quote_md && (
                <blockquote className="mt-1 border-l-2 border-teal/30 pl-2 text-xs italic text-slate">
                  {c.quote_md}
                </blockquote>
              )}
              <p className="mt-1 whitespace-pre-wrap text-ink">{c.body_md}</p>
              <button
                type="button"
                className="mt-1 text-xs font-semibold text-teal"
                onClick={() => setQuote(c.body_md.slice(0, 160))}
              >
                Цитировать
              </button>
            </li>
          ))}
          {comments.length === 0 && <li className="text-sm text-slate">Комментариев пока нет.</li>}
        </ul>
        <form onSubmit={onComment} className="space-y-2">
          {quote && (
            <p className="text-xs text-slate">
              Цитата: {quote}{' '}
              <button type="button" className="text-teal" onClick={() => setQuote(null)}>
                сбросить
              </button>
            </p>
          )}
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
            placeholder="Комментарий к документу…"
          />
          <button type="submit" className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-white">
            Отправить
          </button>
        </form>
      </section>

      {(error || msg) && (
        <p className={`text-sm ${error ? 'text-danger' : 'text-teal-deep'}`}>{error ?? msg}</p>
      )}
    </div>
  )
}
