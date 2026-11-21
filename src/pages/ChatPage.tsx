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
    setPeer(getPeerProfile(profile.id))
    void hydrateAllowlistedProfiles(profile.id).then(() => {
      setPeer(getPeerProfile(profile.id))
    })
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
    refresh()
    try {
      markingRead.current = true
      markChatRead(profile.id)
    } finally {
      markingRead.current = false
    }
    refresh()
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
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
    setChatPeer(hit)
    setPeer(hit)
    setSearchHits([])
    setEmailQuery('')
    setSearchedOnce(false)
    setSearchError(null)
    if (profile) {
      try {
        markChatRead(profile.id)
        setUnread(unreadCount(profile.id))
      } catch {
        // ignore
      }
    }
  }

  function clearPeer() {
    setChatPeer(null)
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
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-3 md:h-[calc(100vh-5rem)]">
      <header className="surface shrink-0 rounded-3xl p-5">
        <p className="text-[13px] font-medium text-teal">Чат 1:1</p>
        <h1 className="mt-1 font-display text-2xl tracking-tight text-ink md:text-3xl">
          {peer ? `${profile.display_name} ↔ ${peer.display_name}` : 'Личные сообщения'}
        </h1>
        <p className="mt-2 text-xs text-slate">{demoTransportLabel()}</p>
        {peer && (
          <p className="mt-1 text-xs text-slate">
            Собеседник: {peer.display_name} · {peer.email}
            {!isDemoAuth && (
              <>
                {' · '}
                <button type="button" className="font-semibold text-teal underline" onClick={clearPeer}>
                  сменить
                </button>
              </>
            )}
          </p>
        )}
        {isDemoAuth && (
          <p className="mt-1 text-xs rounded-xl bg-mist px-2 py-1 text-ink border border-ink/10">
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
        <section className="surface shrink-0 rounded-3xl p-5">
          <p className="text-sm text-ink">{emptyPeerHint}</p>
          <p className="mt-1 text-xs text-slate">
            Поиск только среди допущенных и уже зарегистрированных участников курса (не боты и не
            демо-персонажи).
          </p>
          <form onSubmit={runSearch} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={emailQuery}
              onChange={(e) => setEmailQuery(e.target.value)}
              placeholder="email участника"
              autoComplete="off"
              className="field flex-1 rounded-xl border border-ink/10 px-3 py-2 text-sm outline-none ring-ink focus:ring-2"
            />
            <button
              type="submit"
              disabled={searching}
              className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-on-accent hover:bg-teal-deep disabled:opacity-50"
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

      <div className="surface flex min-h-0 flex-1 flex-col rounded-3xl">
        <div className="flex-1 space-y-3 overflow-y-auto p-4 md:p-5">
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
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm md:max-w-[70%] ${
                      mine ? 'bg-teal text-on-accent' : 'bg-mist text-ink'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.body_md || '—'}</p>
                    {m.attachment_stub && m.attachment_name && (
                      <p className={`mt-1 text-xs ${mine ? 'text-on-accent/80' : 'text-slate'}`}>
                        📎 {m.attachment_name} (имя файла; сам файл — через раздел «Документы»)
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

        <form onSubmit={onSend} className="shrink-0 border-t border-ink/5 p-3 md:p-4">
          {!peer && (
            <p className="mb-2 text-xs text-slate">Сначала добавьте собеседника по email.</p>
          )}
          {attachName && (
            <p className="mb-2 text-xs text-slate">
              Вложение (имя): {attachName}{' '}
              <button type="button" className="text-teal" onClick={() => setAttachName(null)}>
                убрать
              </button>
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              disabled={!peer}
              placeholder={peer ? 'Сообщение партнёру…' : emptyPeerHint}
              className="field min-h-[2.75rem] flex-1 rounded-xl border border-ink/10 px-3 py-2 text-sm outline-none ring-ink focus:ring-2 disabled:opacity-50"
            />
            <div className="flex gap-2">
              <label
                className={`cursor-pointer rounded-xl border border-ink/10 px-3 py-2 text-sm text-slate hover:bg-mist ${
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
                className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-on-accent hover:bg-teal-deep disabled:opacity-50"
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
