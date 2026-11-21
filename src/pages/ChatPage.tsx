import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  demoTransportLabel,
  getPeerProfile,
  listMessages,
  markChatRead,
  sendMessage,
  subscribeCollab,
  type ChatMessage,
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
    return iso
  }
}

export function ChatPage() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [attachName, setAttachName] = useState<string | null>(null)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!profile) return
    const refresh = () => {
      setMessages(listMessages())
      setUnread(unreadCount(profile.id))
    }
    refresh()
    markChatRead(profile.id)
    refresh()
    return subscribeCollab((event) => {
      refresh()
      // Mark peer messages read without re-entering on our own write echoes
      if (event.type === 'messages') {
        const before = unreadCount(profile.id)
        if (before > 0) {
          markChatRead(profile.id)
          refresh()
        }
      }
    })
  }, [profile])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (!profile) return null
  const peer = getPeerProfile(profile.id)

  function onSend(e: FormEvent) {
    e.preventDefault()
    if (!text.trim() && !attachName) return
    sendMessage(profile!.id, text || '(вложение)', attachName)
    setText('')
    setAttachName(null)
    setMessages(listMessages())
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-3 md:h-[calc(100vh-5rem)]">
      <header className="surface shrink-0 rounded-3xl p-5">
        <p className="text-[13px] font-medium text-teal">Чат 1:1</p>
        <h1 className="mt-1 font-display text-2xl tracking-tight text-ink md:text-3xl">
          {peer ? `${profile.display_name} ↔ ${peer.display_name}` : 'Личные сообщения'}
        </h1>
        <p className="mt-2 text-xs text-slate">{demoTransportLabel()}</p>
        {isDemoAuth && (
          <p className="mt-1 text-xs text-amber-soft/90 rounded-xl bg-amber-soft/50 px-2 py-1 text-ink">
            Демо: откройте второй аккаунт во второй вкладке (sessionStorage). Сообщения общие в localStorage.
            {unread > 0 ? ` Непрочитанных до открытия: ${unread}.` : ''}
          </p>
        )}
      </header>

      <div className="surface flex min-h-0 flex-1 flex-col rounded-3xl">
        <div className="flex-1 space-y-3 overflow-y-auto p-4 md:p-5">
          {messages.length === 0 && (
            <p className="text-sm text-slate">Пока нет сообщений. Напишите партнёру первый раз.</p>
          )}
          {messages.map((m) => {
            const mine = m.sender_id === profile.id
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm md:max-w-[70%] ${
                    mine ? 'bg-teal text-white' : 'bg-mist text-ink'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body_md}</p>
                  {m.attachment_stub && m.attachment_name && (
                    <p className={`mt-1 text-xs ${mine ? 'text-white/80' : 'text-slate'}`}>
                      📎 {m.attachment_name} (stub — private storage на этапе 5)
                    </p>
                  )}
                  <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-slate'}`}>
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
          {attachName && (
            <p className="mb-2 text-xs text-slate">
              Вложение (stub): {attachName}{' '}
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
              placeholder="Сообщение партнёру…"
              className="min-h-[2.75rem] flex-1 rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-sm outline-none ring-teal focus:ring-2"
            />
            <div className="flex gap-2">
              <label className="cursor-pointer rounded-xl border border-ink/10 px-3 py-2 text-sm text-slate hover:bg-mist">
                Файл
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setAttachName(f.name)
                    e.target.value = ''
                  }}
                />
              </label>
              <button
                type="submit"
                className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal-deep"
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
