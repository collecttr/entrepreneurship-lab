import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { collectEntryToasts, type EntryToast } from '@/lib/entry-notifications'

const KIND_LABEL: Record<EntryToast['kind'], string> = {
  chat: 'Чат',
  forum: 'Форум',
  deadline: 'Неделя',
}

export function EntryToasts() {
  const { profile } = useAuth()
  const [toasts, setToasts] = useState<EntryToast[]>([])

  useEffect(() => {
    if (!profile) return
    // Defer slightly so collab hydrate / peer resolve can settle.
    const t = window.setTimeout(() => {
      try {
        setToasts(collectEntryToasts(profile))
      } catch (err) {
        console.warn('entry toasts failed:', err)
      }
    }, 450)
    return () => window.clearTimeout(t)
  }, [profile])

  if (!toasts.length) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-end gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:bottom-4 md:right-4 md:left-auto md:w-[380px]"
      aria-live="polite"
    >
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="toast-enter pointer-events-auto w-full rounded-2xl border border-ink/10 bg-paper/95 shadow-[0_12px_40px_rgba(60,70,90,0.14)] backdrop-blur-md"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <div className="flex items-start gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate">
                {KIND_LABEL[toast.kind]}
              </p>
              <p className="mt-0.5 font-medium text-ink">{toast.title}</p>
              <p className="mt-1 text-sm leading-snug text-slate">{toast.body}</p>
              <Link
                to={toast.href}
                className="mt-2 inline-block text-sm font-semibold text-teal hover:underline"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              >
                Открыть →
              </Link>
            </div>
            <button
              type="button"
              aria-label="Закрыть"
              className="shrink-0 rounded-lg p-1.5 text-slate hover:bg-mist hover:text-ink"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
