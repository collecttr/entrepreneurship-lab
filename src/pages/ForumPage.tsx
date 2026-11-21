import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  authorName,
  createDiscussion,
  demoTransportLabel,
  listDiscussions,
  listPosts,
  subscribeCollab,
  type Discussion,
  type ForumKind,
} from '@/lib/collab-store'

const KINDS: Array<ForumKind | 'all'> = ['all', 'debate', 'question', 'case', 'source', 'general']

const KIND_RU: Record<ForumKind, string> = {
  debate: 'дебаты',
  question: 'вопрос',
  case: 'кейс',
  source: 'источник',
  general: 'общее',
}

export function ForumPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<Discussion[]>([])
  const [q, setQ] = useState('')
  const [kind, setKind] = useState<(typeof KINDS)[number]>('all')
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [newKind, setNewKind] = useState<ForumKind>('question')
  const [week, setWeek] = useState('')

  useEffect(() => {
    const refresh = () => setItems(listDiscussions())
    refresh()
    return subscribeCollab(refresh)
  }, [])

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
  }

  return (
    <div className="space-y-5">
      <header className="surface rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Форум</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Обсуждения по неделям</h1>
        <p className="mt-2 text-sm text-slate">
          Темы, ответы, цитаты, привязка к неделе, поиск и «решено». {demoTransportLabel()}.
        </p>
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
              placeholder="Неделя (опц.)"
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
          const posts = listPosts(d.id)
          return (
            <li key={d.id} className="surface rounded-3xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal">
                    {KIND_RU[d.kind]}
                    {d.week_number ? ` · неделя ${d.week_number}` : ''}
                    {d.is_resolved ? ' · решено' : ''}
                  </p>
                  <h2 className="mt-1 font-display text-xl text-ink">
                    <Link to={`/forum/${d.id}`} className="hover:text-teal">
                      {d.title}
                    </Link>
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate">{d.description_md}</p>
                </div>
                <div className="text-right text-xs text-slate">
                  <p>{authorName(d.author_id)}</p>
                  <p>{posts.length} сообщ.</p>
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
        {filtered.length === 0 && <li className="text-sm text-slate">Ничего не найдено.</li>}
      </ul>
    </div>
  )
}
