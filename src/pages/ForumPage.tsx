import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/context/AuthContext'
import {
  authorName,
  createDiscussion,
  demoTransportLabel,
  hydrateAllowlistedProfiles,
  isDemoForumSeedId,
  listDiscussions,
  listPosts,
  rememberProfile,
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
  const [items, setItems] = useState<Discussion[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [kind, setKind] = useState<(typeof KINDS)[number]>('all')
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [newKind, setNewKind] = useState<ForumKind>('question')
  const [week, setWeek] = useState('')

  useEffect(() => {
    if (profile) {
      rememberProfile({
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
      })
      void hydrateAllowlistedProfiles(profile.id)
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
      <header className="surface rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Форум</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Обсуждения по неделям</h1>
        <p className="mt-2 text-sm text-slate">
          Темы и авторы — только реальные участники из списка допуска.
          {isDemoAuth ? ' В демо показаны учебные темы с пометкой «демо».' : ''} {demoTransportLabel()}.
        </p>
        {loadError && (
          <p className="mt-2 text-xs text-slate" role="status">
            {loadError}
          </p>
        )}
        <button
          type="button"
          onClick={() => setShowNew((v) => !v)}
          className="mt-4 rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-on-accent hover:bg-teal-deep"
        >
          {showNew ? 'Закрыть форму' : 'Новая тема'}
        </button>
      </header>

      {showNew && (
        <form onSubmit={onCreate} className="surface space-y-3 rounded-3xl p-5">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок"
            className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Описание"
            rows={3}
            className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={newKind}
              onChange={(e) => setNewKind(e.target.value as ForumKind)}
              className="rounded-xl border border-ink/10 px-3 py-2 text-sm"
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
              className="w-36 rounded-xl border border-ink/10 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-on-accent">
              Создать
            </button>
          </div>
        </form>
      )}

      <div className="surface flex flex-col gap-3 rounded-3xl p-4 md:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по темам…"
          className="flex-1 rounded-xl border border-ink/10 px-3 py-2 text-sm"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as (typeof KINDS)[number])}
          className="rounded-xl border border-ink/10 px-3 py-2 text-sm"
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
            <li key={d.id} className="surface rounded-3xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal">
                    {KIND_RU[d.kind] ?? 'общее'}
                    {d.week_number ? ` · неделя ${d.week_number}` : ''}
                    {d.is_resolved ? ' · решено' : ''}
                    {isDemoAuth && isDemoForumSeedId(d.id) ? ' · демо' : ''}
                  </p>
                  <h2 className="mt-1 font-display text-xl text-ink">
                    <Link to={`/forum/${d.id}`} className="hover:text-teal">
                      {d.title || 'Без названия'}
                    </Link>
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate">{d.description_md}</p>
                </div>
                <div className="text-right text-xs text-slate">
                  <p>{authorName(d.author_id)}</p>
                  <p>{postCount} сообщ.</p>
                </div>
              </div>
              {d.week_number && (
                <Link
                  to={`/program/weeks/${d.week_number}`}
                  className="mt-3 inline-block text-xs font-semibold text-teal"
                >
                  К неделе {d.week_number} →
                </Link>
              )}
            </li>
          )
        })}
        {filtered.length === 0 && (
          <li className="surface rounded-3xl p-5 text-sm text-slate">
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
