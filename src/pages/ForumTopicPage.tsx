import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/context/AuthContext'
import {
  addPost,
  authorName,
  getDiscussion,
  hydrateAllowlistedProfiles,
  isDemoForumSeedId,
  listPosts,
  rememberProfile,
  setDiscussionResolved,
  setLastForumDiscussion,
  subscribeCollab,
  type Discussion,
  type DiscussionPost,
} from '@/lib/collab-store'
import { isDemoAuth } from '@/lib/supabase'

function ForumTopicPageInner() {
  const { discussionId } = useParams()
  const { profile } = useAuth()
  const [topic, setTopic] = useState<Discussion | null>(null)
  const [posts, setPosts] = useState<DiscussionPost[]>([])
  const [body, setBody] = useState('')
  const [quote, setQuote] = useState<string | null>(null)
  const [parentId, setParentId] = useState<string | null>(null)
  const [attach, setAttach] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (profile) {
      rememberProfile({
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
      })
      void hydrateAllowlistedProfiles(profile.id)
    }
  }, [profile])

  useEffect(() => {
    if (!discussionId) return
    if (profile) {
      setLastForumDiscussion(profile.id, discussionId)
    }
    const refresh = () => {
      try {
        const d = getDiscussion(discussionId) ?? null
        setTopic(d)
        setMissing(!d)
        setPosts(d ? listPosts(discussionId) : [])
        setLoadError(null)
      } catch (err) {
        console.warn('forum topic refresh failed:', err)
        setPosts([])
        setLoadError('Не удалось загрузить ответы. Показан пустой список.')
      }
    }
    refresh()
    return subscribeCollab(refresh)
  }, [discussionId, profile])

  if (!discussionId) return <Navigate to="/forum" replace />

  if (!profile) {
    return <div className="surface rounded-3xl p-5 text-sm text-slate">Загрузка профиля…</div>
  }

  if (missing || !topic) {
    return (
      <div className="surface rounded-3xl p-6">
        <p className="text-sm text-ink">Тема не найдена.</p>
        <p className="mt-1 text-sm text-slate">
          Возможно, она ещё не синхронизировалась или была удалена.
        </p>
        <Link to="/forum" className="mt-3 inline-block text-sm font-semibold text-teal">
          ← Форум
        </Link>
      </div>
    )
  }

  function onReply(e: FormEvent) {
    e.preventDefault()
    if (!profile || !body.trim() || !topic) return
    try {
      addPost({
        discussion_id: topic.id,
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
      setPosts(listPosts(topic.id))
      setTopic(getDiscussion(topic.id) ?? topic)
      setLoadError(null)
    } catch (err) {
      console.warn('addPost failed:', err)
      setLoadError('Не удалось отправить ответ. Попробуйте ещё раз.')
    }
  }

  return (
    <div className="space-y-4">
      <header className="surface rounded-2xl p-4 md:rounded-3xl md:p-6">
        <Link to="/forum" className="inline-flex min-h-11 items-center text-sm font-semibold text-teal">
          ← Все темы
        </Link>
        <h1 className="mt-2 font-display text-2xl text-ink md:text-3xl">{topic.title || 'Без названия'}</h1>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate">{topic.description_md}</p>
        {loadError && (
          <p className="mt-2 text-xs text-slate" role="status">
            {loadError}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate md:gap-3">
          <span>{authorName(topic.author_id)}</span>
          {isDemoAuth && isDemoForumSeedId(topic.id) && <span className="font-semibold">демо</span>}
          {topic.week_number && (
            <Link
              to={`/program/weeks/${topic.week_number}`}
              className="inline-flex min-h-11 items-center font-semibold text-teal"
            >
              Неделя {topic.week_number}
            </Link>
          )}
          <span>{topic.is_resolved ? 'Решено' : 'Открыто'}</span>
          <button
            type="button"
            className="min-h-11 rounded-lg bg-mist px-3 py-2 font-semibold text-ink"
            onClick={() => {
              try {
                setDiscussionResolved(topic.id, !topic.is_resolved)
                setTopic(getDiscussion(topic.id) ?? topic)
              } catch (err) {
                console.warn('setDiscussionResolved failed:', err)
                setLoadError('Не удалось обновить статус темы.')
              }
            }}
          >
            {topic.is_resolved ? 'Снять «решено»' : 'Отметить решённым'}
          </button>
        </div>
      </header>

      <ul className="space-y-3">
        {posts.length === 0 && (
          <li className="surface rounded-3xl p-4 text-sm text-slate">
            Пока нет ответов. Напишите первый комментарий ниже.
          </li>
        )}
        {posts.map((p) => (
          <li key={p.id} className="surface rounded-3xl p-4">
            <p className="text-xs text-slate">
              {authorName(p.author_id)} ·{' '}
              {(() => {
                try {
                  return new Date(p.created_at).toLocaleString('ru-RU')
                } catch {
                  return '—'
                }
              })()}
              {p.parent_id ? ' · ответ' : ''}
            </p>
            {p.quote_md && (
              <blockquote className="mt-2 border-l-2 border-ink/25 pl-3 text-sm text-slate italic">
                {p.quote_md}
              </blockquote>
            )}
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{p.body_md || '—'}</p>
            {p.attachment_name && (
              <p className="mt-1 text-xs text-slate">📎 {p.attachment_name} (только имя файла)</p>
            )}
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-teal"
              onClick={() => {
                setParentId(p.id)
                setQuote((p.body_md || '').slice(0, 180))
              }}
            >
              Цитировать / ответить
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={onReply} className="surface space-y-3 rounded-2xl p-4 md:rounded-3xl md:p-5">
        <h2 className="font-display text-xl text-ink">Комментарий</h2>
        {quote && (
          <div className="rounded-xl bg-mist px-3 py-2 text-xs text-slate">
            Цитата: {quote}{' '}
            <button
              type="button"
              className="min-h-11 px-1 text-teal"
              onClick={() => {
                setQuote(null)
                setParentId(null)
              }}
            >
              сбросить
            </button>
          </div>
        )}
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="field w-full rounded-xl border border-ink/10 px-3 py-2.5 text-base md:text-sm"
          placeholder="Ваш ответ…"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-ink/10 px-3 text-sm text-slate">
            Вложение (только имя файла)
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
          {attach && <span className="text-xs text-slate">{attach}</span>}
          <button
            type="submit"
            className="min-h-11 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-on-accent"
          >
            Отправить
          </button>
        </div>
      </form>
    </div>
  )
}

export function ForumTopicPage() {
  return (
    <ErrorBoundary
      title="Тема форума временно недоступна"
      hint="Не удалось показать обсуждение. Нажмите «Повторить» или вернитесь к списку тем."
    >
      <ForumTopicPageInner />
    </ErrorBoundary>
  )
}
