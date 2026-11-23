import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAuth } from '@/context/AuthContext'
import {
  demoTransportLabel,
  getPeerProfile,
  hydrateAllowlistedProfiles,
  listMessages,
  markChatRead,
  rememberProfile,
  searchAllowlistedUsers,
  sendMessage,
  setChatPeer,
  subscribeCollab,
  type AllowlistedSearchHit,
  type ChatMessage,
  type PeerContact,
  unreadCount,
} from '@/lib/collab-store'
import { isDemoAuth } from '@/lib/supabase'

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso || '—'
  }
}

function ChatPageInner() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [attachName, setAttachName] = useState<string | null>(null)
  const [unread, setUnread] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [peer, setPeer] = useState<PeerContact | null>(null)
  const [emailQuery, setEmailQuery] = useState('')
  const [searchHits, setSearchHits] = useState<AllowlistedSearchHit[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchedOnce, setSearchedOnce] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const markingRead = useRef(false)

  useEffect(() => {
    if (!profile) return
    rememberProfile({
      id: profile.id,
      email: profile.email,
      display_name: profile.display_name,
    })
    // Local peer first — paint before network hydrate
    setPeer(getPeerProfile(profile.id))
    const runHydrate = () => {
      void hydrateAllowlistedProfiles(profile.id).then(() => {
        setPeer(getPeerProfile(profile.id))
      })
    }
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(runHydrate, { timeout: 1500 })
      return () => cancelIdleCallback(id)
    }
    const t = window.setTimeout(runHydrate, 0)
    return () => window.clearTimeout(t)
  }, [profile])

  useEffect(() => {
    if (!profile) return
    const refresh = () => {
      try {
        setPeer(getPeerProfile(profile.id))
        setMessages(listMessages())
        setUnread(unreadCount(profile.id))
        setLoadError(null)
      } catch (err) {
        console.warn('chat refresh failed:', err)
        setMessages([])
        setUnread(0)
        setLoadError('Не удалось загрузить сообщения. Показан пустой чат.')
      }
    }
    // One local read for first paint; mark-read + subscribe after
    refresh()
    try {
      markingRead.current = true
      markChatRead(profile.id)
    } finally {
      markingRead.current = false
    }
    // Second refresh only if unread cleared (avoid duplicate work on empty inbox)
    if (unreadCount(profile.id) === 0) {
      setUnread(0)
    } else {
      refresh()
    }
    return subscribeCollab((event) => {
      refresh()
      if (event.type === 'messages' && !markingRead.current) {
        const before = unreadCount(profile.id)
        if (before > 0) {
          try {
            markingRead.current = true
            markChatRead(profile.id)
          } finally {
            markingRead.current = false
          }
          refresh()
        }
      }
    })
  }, [profile])

  useEffect(() => {
    // Instant jump on first paint; smooth only for later messages
    bottomRef.current?.scrollIntoView({ behavior: messages.length > 8 ? 'smooth' : 'auto' })
  }, [messages.length])

  async function runSearch(e?: FormEvent) {
    e?.preventDefault()
    if (!profile) return
    setSearching(true)
    setSearchError(null)
    setSearchedOnce(true)
    try {
      const { hits, error } = await searchAllowlistedUsers(emailQuery, profile.id)
      setSearchHits(hits)
      if (error) setSearchError(error)
    } catch (err) {
      console.warn('chat search failed:', err)
      setSearchHits([])
      setSearchError('Не удалось выполнить поиск. Попробуйте ещё раз.')
    } finally {
      setSearching(false)
    }
  }

  function selectPeer(hit: AllowlistedSearchHit) {
    if (!profile) return
    setChatPeer(hit, profile.id)
    setPeer(hit)
    setSearchHits([])
    setEmailQuery('')
    setSearchedOnce(false)
    setSearchError(null)
    try {
      markChatRead(profile.id)
      setUnread(unreadCount(profile.id))
    } catch {
      // ignore
    }
  }

  function clearPeer() {
    if (profile) setChatPeer(null, profile.id)
    else setChatPeer(null)
    setPeer(null)
  }

  if (!profile) {
    return (
      <div className="surface rounded-3xl p-5 text-sm text-slate">Загрузка профиля…</div>
    )
  }

  function onSend(e: FormEvent) {
    e.preventDefault()
    if (!profile || !peer) return
    if (!text.trim() && !attachName) return
    try {
      sendMessage(profile.id, text || '(вложение)', attachName)
      setText('')
      setAttachName(null)
      setMessages(listMessages())
      setLoadError(null)
    } catch (err) {
      console.warn('sendMessage failed:', err)
      setLoadError('Не удалось отправить сообщение. Попробуйте ещё раз.')
    }
  }

  const emptyPeerHint =
    'Собеседник ещё не добавлен — найдите по email'

  return (
    <div className="flex h-[min(100dvh,100vh)] max-h-[min(100dvh,100vh)] flex-col gap-3 overflow-hidden md:h-[calc(100vh-5rem)] md:max-h-none">
      <header className="surface shrink-0 rounded-2xl p-4 md:rounded-3xl md:p-5">
        <p className="text-[13px] font-medium text-teal">Чат 1:1</p>
        <h1 className="mt-1 font-display text-xl tracking-tight text-ink md:text-3xl">
          {peer ? `${profile.display_name} ↔ ${peer.display_name}` : 'Личные сообщения'}
        </h1>
        <p className="mt-2 text-xs text-slate">{demoTransportLabel()}</p>
        {peer && (
          <p className="mt-1 text-xs text-slate">
            Собеседник: {peer.display_name} · {peer.email}
            {!isDemoAuth && (
              <>
                {' · '}
                <button
                  type="button"
                  className="min-h-11 px-1 font-semibold text-teal underline"
                  onClick={clearPeer}
                >
                  сменить
                </button>
              </>
            )}
          </p>
        )}
        {isDemoAuth && (
          <p className="mt-1 text-xs text-slate">
            Демо: второй участник — из демо-аккаунтов. Откройте вторую вкладку с другим email.
            {unread > 0 ? ` Непрочитанных до открытия: ${unread}.` : ''}
          </p>
        )}
        {loadError && (
          <p className="mt-2 text-xs text-slate" role="status">
            {loadError}
          </p>
        )}
      </header>

      {!peer && (
        <section className="surface shrink-0 rounded-2xl p-4 md:rounded-3xl md:p-5">
          <p className="text-sm text-ink">{emptyPeerHint}</p>
          <p className="mt-1 text-xs text-slate">
            Поиск только среди допущенных и уже зарегистрированных участников курса.
          </p>
          <form onSubmit={runSearch} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={emailQuery}
              onChange={(e) => setEmailQuery(e.target.value)}
              placeholder="email участника"
              autoComplete="off"
              className="field min-h-11 flex-1 rounded-xl border border-ink/10 px-3 py-2.5 text-sm outline-none ring-ink focus:ring-2"
            />
            <button
              type="submit"
              disabled={searching}
              className="min-h-11 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-teal-deep disabled:opacity-50"
            >
              {searching ? 'Ищем…' : 'Найти'}
            </button>
          </form>
          {searchError && (
            <p className="mt-2 text-xs text-slate" role="status">
              {searchError}
            </p>
          )}
          {searchedOnce && !searching && searchHits.length === 0 && !searchError && (
            <p className="mt-3 text-sm text-slate">
              Никого не найдено. Если второй участник ещё не добавлен в список допуска и не
              зарегистрирован — напишите администратору.
            </p>
          )}
          {searchHits.length > 0 && (
            <ul className="mt-3 space-y-2">
              {searchHits.map((hit) => (
                <li key={hit.id}>
                  <button
                    type="button"
                    onClick={() => selectPeer(hit)}
                    className="w-full rounded-2xl border border-ink/10 bg-mist px-3 py-2 text-left text-sm hover:border-ink/25"
                  >
                    <span className="font-medium text-ink">{hit.display_name}</span>
                    <span className="mt-0.5 block text-xs text-slate">{hit.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="surface flex min-h-0 flex-1 flex-col rounded-2xl md:rounded-3xl">
        <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 md:p-5">
          {!peer && (
            <p className="text-sm text-slate">{emptyPeerHint}</p>
          )}
          {peer && messages.length === 0 && (
            <p className="text-sm text-slate">Пока нет сообщений. Напишите партнёру первый раз.</p>
          )}
          {peer &&
            messages.map((m) => {
              const mine = m.sender_id === profile.id
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm md:max-w-[70%] ${
                      mine ? 'bg-teal text-on-accent' : 'bg-mist text-ink'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body_md || '—'}</p>
                    {m.attachment_stub && m.attachment_name && (
                      <p className={`mt-1 text-xs ${mine ? 'text-on-accent/80' : 'text-slate'}`}>
                        {m.attachment_name} (имя файла; сам файл — через раздел «Документы»)
                      </p>
                    )}
                    <p className={`mt-1 text-[10px] ${mine ? 'text-on-accent/70' : 'text-slate'}`}>
                      {formatTime(m.created_at)}
                      {m.read_at && mine ? ' · прочитано' : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={onSend}
          className="shrink-0 border-t border-ink/5 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:p-4"
        >
          {!peer && (
            <p className="mb-2 text-xs text-slate">Сначала добавьте собеседника по email.</p>
          )}
          {attachName && (
            <p className="mb-2 text-xs text-slate">
              Вложение (имя): {attachName}{' '}
              <button type="button" className="min-h-11 px-1 text-teal" onClick={() => setAttachName(null)}>
                убрать
              </button>
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              disabled={!peer}
              placeholder={peer ? 'Сообщение партнёру…' : emptyPeerHint}
              className="field min-h-11 flex-1 rounded-xl border border-ink/10 px-3 py-2.5 text-base outline-none ring-ink focus:ring-2 disabled:opacity-50 md:text-sm"
            />
            <div className="flex gap-2">
              <label
                className={`inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-ink/10 px-3 text-sm text-slate hover:bg-mist ${
                  !peer ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                Файл
                <input
                  type="file"
                  className="hidden"
                  disabled={!peer}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setAttachName(f.name)
                    e.target.value = ''
                  }}
                />
              </label>
              <button
                type="submit"
                disabled={!peer}
                className="min-h-11 flex-1 rounded-xl bg-teal px-4 text-sm font-semibold text-on-accent hover:bg-teal-deep disabled:opacity-50 sm:flex-none"
              >
                Отправить
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ChatPage() {
  return (
    <ErrorBoundary
      title="Чат временно недоступен"
      hint="Не удалось показать переписку. Нажмите «Повторить» — оболочка приложения остаётся рабочей. Если ошибка повторяется, откройте другой раздел и вернитесь позже."
    >
      <ChatPageInner />
    </ErrorBoundary>
  )
}
