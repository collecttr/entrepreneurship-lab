import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  addPost,
  authorName,
  getDiscussion,
  listPosts,
  setDiscussionResolved,
  subscribeCollab,
  type Discussion,
  type DiscussionPost,
} from '@/lib/collab-store'

export function ForumTopicPage() {
  const { discussionId } = useParams()
  const { profile } = useAuth()
  const [topic, setTopic] = useState<Discussion | null>(null)
  const [posts, setPosts] = useState<DiscussionPost[]>([])
  const [body, setBody] = useState('')
  const [quote, setQuote] = useState<string | null>(null)
  const [parentId, setParentId] = useState<string | null>(null)
  const [attach, setAttach] = useState<string | null>(null)

  useEffect(() => {
    if (!discussionId) return
    const refresh = () => {
      setTopic(getDiscussion(discussionId) ?? null)
      setPosts(listPosts(discussionId))
    }
    refresh()
    return subscribeCollab(refresh)
  }, [discussionId])

  if (!discussionId) return <Navigate to="/forum" replace />
  if (!topic) {
    return (
      <div className="surface rounded-3xl p-6">
        <p>Тема не найдена.</p>
        <Link to="/forum" className="text-teal">
          ← Форум
        </Link>
      </div>
    )
  }

  function onReply(e: FormEvent) {
    e.preventDefault()
    if (!profile || !body.trim()) return
    addPost({
      discussion_id: topic!.id,
      author_id: profile.id,
      body_md: body,
      parent_id: parentId,
      quote_md: quote,
      attachment_name: attach,
    })
    setBody('')
    setQuote(null)
    setParentId(null)
    setAttach(null)
    setPosts(listPosts(topic!.id))
    setTopic(getDiscussion(topic!.id) ?? topic)
  }

  return (
    <div className="space-y-4">
      <header className="surface rounded-3xl p-6">
        <Link to="/forum" className="text-sm font-semibold text-teal">
          ← Все темы
        </Link>
        <h1 className="mt-2 font-display text-3xl text-ink">{topic.title}</h1>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate">{topic.description_md}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate">
          <span>{authorName(topic.author_id)}</span>
          {topic.week_number && (
            <Link to={`/program/weeks/${topic.week_number}`} className="font-semibold text-teal">
              Неделя {topic.week_number}
            </Link>
          )}
          <span>{topic.is_resolved ? 'Решено' : 'Открыто'}</span>
          <button
            type="button"
            className="rounded-lg bg-mist px-2 py-1 font-semibold text-ink"
            onClick={() => {
              setDiscussionResolved(topic.id, !topic.is_resolved)
              setTopic(getDiscussion(topic.id) ?? topic)
            }}
          >
            {topic.is_resolved ? 'Снять «решено»' : 'Отметить решённым'}
          </button>
        </div>
      </header>

      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id} className="surface rounded-3xl p-4">
            <p className="text-xs text-slate">
              {authorName(p.author_id)} · {new Date(p.created_at).toLocaleString('ru-RU')}
              {p.parent_id ? ' · ответ' : ''}
            </p>
            {p.quote_md && (
              <blockquote className="mt-2 border-l-2 border-teal/40 pl-3 text-sm text-slate italic">
                {p.quote_md}
              </blockquote>
            )}
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{p.body_md}</p>
            {p.attachment_name && (
              <p className="mt-1 text-xs text-slate">📎 {p.attachment_name} (stub)</p>
            )}
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-teal"
              onClick={() => {
                setParentId(p.id)
                setQuote(p.body_md.slice(0, 180))
              }}
            >
              Цитировать / ответить
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={onReply} className="surface space-y-3 rounded-3xl p-5">
        <h2 className="font-display text-xl text-ink">Комментарий</h2>
        {quote && (
          <div className="rounded-xl bg-mist px-3 py-2 text-xs text-slate">
            Цитата: {quote}{' '}
            <button type="button" className="text-teal" onClick={() => { setQuote(null); setParentId(null) }}>
              сбросить
            </button>
          </div>
        )}
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
          placeholder="Ваш ответ…"
        />
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-xl border border-ink/10 px-3 py-2 text-sm text-slate">
            Вложение (stub)
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setAttach(f.name)
                e.target.value = ''
              }}
            />
          </label>
          {attach && <span className="text-xs text-slate self-center">{attach}</span>}
          <button type="submit" className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-white">
            Отправить
          </button>
        </div>
      </form>
    </div>
  )
}
