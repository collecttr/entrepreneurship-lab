import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/context/AuthContext'
import {
  authorName,
  createDiscussion,
  demoTransportLabel,
  getDiscussion,
  getForumContext,
  hydrateAllowlistedProfiles,
  isDemoForumSeedId,
  listDiscussions,
  listPosts,
  rememberProfile,
  setForumListFilters,
  setLastForumDiscussion,
  subscribeCollab,
  type Discussion,
  type ForumKind,
} from '@/lib/collab-store'
import { isDemoAuth } from '@/lib/supabase'

const KINDS: Array<ForumKind | 'all'> = ['all', 'debate', 'question', 'case', 'source', 'general']

const KIND_RU: Record<ForumKind, string> = {
  debate: 'дебаты',
  question: 'вопрос',
  case: 'кейс',
  source: 'источник',
  general: 'общее',
}

function ForumPageInner() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const initial = profile ? getForumContext(profile.id) : null
  const [items, setItems] = useState<Discussion[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [q, setQ] = useState(initial?.q ?? '')
  const [kind, setKind] = useState<(typeof KINDS)[number]>(initial?.kind ?? 'all')
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [newKind, setNewKind] = useState<ForumKind>('question')
  const [week, setWeek] = useState('')
  const [lastId, setLastId] = useState<string | null>(initial?.lastDiscussionId ?? null)
  const [lastTitle, setLastTitle] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      rememberProfile({
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
      })
      void hydrateAllowlistedProfiles(profile.id)
      const ctx = getForumContext(profile.id)
      setQ(ctx.q)
      setKind(ctx.kind)
      setLastId(ctx.lastDiscussionId)
      if (ctx.lastDiscussionId) {
        try {
          const d = getDiscussion(ctx.lastDiscussionId)
          setLastTitle(d?.title ?? null)
          if (!d) setLastId(null)
        } catch {
          setLastTitle(null)
        }
      } else {
        setLastTitle(null)
      }
    }
    const refresh = () => {
      try {
        setItems(listDiscussions())
        setLoadError(null)
      } catch (err) {
        console.warn('forum refresh failed:', err)
        setItems([])
        setLoadError('Не удалось загрузить темы. Показан пустой список.')
      }
    }
    refresh()
    return subscribeCollab(refresh)
  }, [profile])

  useEffect(() => {
    if (!profile) return
    setForumListFilters(profile.id, { kind, q })
  }, [profile, kind, q])

  const filtered = useMemo(() => {
    return items.filter((d) => {
      if (kind !== 'all' && d.kind !== kind) return false
      if (!q.trim()) return true
      const hay = `${d.title} ${d.description_md}`.toLowerCase()
      return hay.includes(q.trim().toLowerCase())
    })
  }, [items, kind, q])

  function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!profile || !title.trim()) return
    try {
      const d = createDiscussion({
        author_id: profile.id,
        title,
        description_md: desc,
        kind: newKind,
        week_number: week ? Number(week) : null,
      })
      setTitle('')
      setDesc('')
      setWeek('')
      setShowNew(false)
      setItems(listDiscussions())
      setLastForumDiscussion(profile.id, d.id)
      void navigate(`/forum/${d.id}`)
    } catch (err) {
      console.warn('createDiscussion failed:', err)
      setLoadError('Не удалось создать тему. Попробуйте ещё раз.')
    }
  }

  if (!profile) {
    return <div className="surface rounded-3xl p-5 text-sm text-slate">Загрузка профиля…</div>
  }

  return (
    <div className="space-y-5">
      <header className="surface rounded-2xl p-5 md:rounded-3xl md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Форум</p>
        <h1 className="mt-2 font-display text-2xl text-ink md:text-3xl">Обсуждения по неделям</h1>
        <p className="mt-2 text-sm text-slate">
          Темы и авторы — только реальные участники из списка допуска.
          {isDemoAuth ? ' В демо показаны учебные темы с пометкой «демо».' : ''} {demoTransportLabel()}.
        </p>
        {loadError && (
          <p className="mt-2 text-xs text-slate" role="status">
            {loadError}
          </p>
        )}
        {lastId && (
          <Link
            to={`/forum/${lastId}`}
            className="mt-3 flex min-h-11 items-center rounded-xl border border-ink/10 bg-mist/60 px-3 py-2 text-sm text-ink"
          >
            <span className="text-slate">Продолжить: </span>
            <span className="ml-1 font-semibold">{lastTitle || 'последняя тема'}</span>
            <span className="ml-auto text-teal">→</span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setShowNew((v) => !v)}
          className="mt-4 min-h-11 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-teal-deep"
        >
          {showNew ? 'Закрыть форму' : 'Новая тема'}
        </button>
      </header>

      {showNew && (
        <form onSubmit={onCreate} className="surface space-y-3 rounded-2xl p-4 md:rounded-3xl md:p-5">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок"
            className="field min-h-11 w-full rounded-xl border border-ink/10 px-3 py-2.5 text-base md:text-sm"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Описание"
            rows={3}
            className="field w-full rounded-xl border border-ink/10 px-3 py-2.5 text-base md:text-sm"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <select
              value={newKind}
              onChange={(e) => setNewKind(e.target.value as ForumKind)}
              className="field min-h-11 rounded-xl border border-ink/10 px-3 py-2.5 text-sm"
            >
              {(Object.keys(KIND_RU) as ForumKind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_RU[k]}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={26}
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              placeholder="Неделя (необяз.)"
              className="field min-h-11 w-full rounded-xl border border-ink/10 px-3 py-2.5 text-sm sm:w-36"
            />
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-on-accent"
            >
              Создать
            </button>
          </div>
        </form>
      )}

      <div className="surface flex flex-col gap-3 rounded-2xl p-3 md:flex-row md:rounded-3xl md:p-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по темам…"
          className="field min-h-11 flex-1 rounded-xl border border-ink/10 px-3 py-2.5 text-base md:text-sm"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as (typeof KINDS)[number])}
          className="field min-h-11 rounded-xl border border-ink/10 px-3 py-2.5 text-sm"
        >
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {k === 'all' ? 'Все типы' : KIND_RU[k]}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-3">
        {filtered.map((d) => {
          let postCount = 0
          try {
            postCount = listPosts(d.id).length
          } catch {
            postCount = 0
          }
          return (
            <li key={d.id} className="surface rounded-2xl p-4 md:rounded-3xl md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal">
                    {KIND_RU[d.kind] ?? 'общее'}
                    {d.week_number ? ` · неделя ${d.week_number}` : ''}
                    {d.is_resolved ? ' · решено' : ''}
                    {isDemoAuth && isDemoForumSeedId(d.id) ? ' · демо' : ''}
                  </p>
                  <h2 className="mt-1 font-display text-lg text-ink md:text-xl">
                    <Link
                      to={`/forum/${d.id}`}
                      className="hover:text-teal"
                      onClick={() => setLastForumDiscussion(profile.id, d.id)}
                    >
                      {d.title || 'Без названия'}
                    </Link>
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate">{d.description_md}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-slate">
                  <p>{authorName(d.author_id)}</p>
                  <p>{postCount} сообщ.</p>
                </div>
              </div>
              {d.week_number && (
                <Link
                  to={`/program/weeks/${d.week_number}`}
                  className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-teal"
                >
                  К неделе {d.week_number} →
                </Link>
              )}
            </li>
          )
        })}
        {filtered.length === 0 && (
          <li className="surface rounded-2xl p-5 text-sm text-slate md:rounded-3xl">
            {q.trim() || kind !== 'all'
              ? 'Ничего не найдено по текущему фильтру.'
              : isDemoAuth
                ? 'Пока нет тем. Создайте первую.'
                : 'Пока нет тем от реальных участников. Создайте первую — без демо-персонажей.'}
          </li>
        )}
      </ul>
    </div>
  )
}

export function ForumPage() {
  return (
    <ErrorBoundary
      title="Форум временно недоступен"
      hint="Не удалось показать темы. Нажмите «Повторить». Чат и другие разделы остаются рабочими."
    >
      <ForumPageInner />
    </ErrorBoundary>
  )
}
