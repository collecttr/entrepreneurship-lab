import { useEffect, useState, type FormEvent } from 'react'
import {
  addAssignmentComment,
  authorName,
  listAssignmentComments,
  subscribeCollab,
  type AssignmentComment,
} from '@/lib/collab-store'

interface Props {
  assignmentCode: string
  authorId: string
}

export function AssignmentComments({ assignmentCode, authorId }: Props) {
  const [items, setItems] = useState<AssignmentComment[]>([])
  const [body, setBody] = useState('')
  const [quote, setQuote] = useState<string | null>(null)

  useEffect(() => {
    const refresh = () => setItems(listAssignmentComments(assignmentCode))
    refresh()
    return subscribeCollab(refresh)
  }, [assignmentCode])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    addAssignmentComment({
      assignment_code: assignmentCode,
      author_id: authorId,
      body_md: body,
      quote_md: quote,
    })
    setBody('')
    setQuote(null)
    setItems(listAssignmentComments(assignmentCode))
  }

  return (
    <section className="surface rounded-3xl p-5 space-y-3">
      <h2 className="font-display text-xl text-ink">Комментарии к заданию</h2>
      <p className="text-xs text-slate">Обсуждение сдачи между участниками (allowlist only).</p>
      <ul className="space-y-2">
        {items.map((c) => (
          <li key={c.id} className="rounded-2xl bg-paper/80 px-3 py-2 text-sm">
            <p className="text-xs text-slate">
              {authorName(c.author_id)} · {new Date(c.created_at).toLocaleString('ru-RU')}
            </p>
            {c.quote_md && (
              <blockquote className="mt-1 border-l-2 border-ink/20 pl-2 text-xs italic text-slate">
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
        {items.length === 0 && <li className="text-sm text-slate">Комментариев пока нет.</li>}
      </ul>
      <form onSubmit={onSubmit} className="space-y-2">
        {quote && (
          <p className="text-xs text-slate">
            Цитата: {quote}{' '}
            <button type="button" className="text-teal" onClick={() => setQuote(null)}>
              сбросить
            </button>
          </p>
        )}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
          placeholder="Комментарий…"
          required
        />
        <button type="submit" className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-on-accent">
          Отправить комментарий
        </button>
      </form>
    </section>
  )
}
