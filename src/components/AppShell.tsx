import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Bot,
  FileText,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  MessageSquare,
  MessagesSquare,
  Shield,
  Sparkles,
  X,
} from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getLastForumPath, subscribeCollab, unreadCount } from '@/lib/collab-store'
import { canonicalDisplayName } from '@/lib/learners'
import { isDemoAuth } from '@/lib/supabase'
import { DemoBanner } from './DemoBanner'

/** Entry toasts pull peer-progress + curriculum — defer off the shell critical path. */
const EntryToasts = lazy(() =>
  import('./EntryToasts').then((m) => ({ default: m.EntryToasts })),
)

const NAV = [
  { to: '/dashboard', label: 'Обзор', icon: LayoutDashboard },
  { to: '/program', label: 'Программа', icon: BookOpen },
  { to: '/library', label: 'Библиотека', icon: Library },
  { to: '/assignments', label: 'Задания', icon: FileText },
  { to: '/skills', label: 'Навыки', icon: Sparkles },
  { to: '/chat', label: 'Чат', icon: MessageSquare, chat: true },
  { to: '/forum', label: 'Форум', icon: MessagesSquare, forum: true },
  { to: '/documents', label: 'Документы', icon: FileText },
  { to: '/ai', label: 'Тренажёры', icon: Bot },
  { to: '/admin', label: 'Админ', icon: Shield, adminOnly: true },
]

export function AppShell() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [forumTo, setForumTo] = useState('/forum')

  useEffect(() => {
    if (!profile) return
    const refresh = () => {
      setUnread(unreadCount(profile.id))
      setForumTo(getLastForumPath(profile.id))
    }
    refresh()
    return subscribeCollab(refresh)
  }, [profile])

  const items = NAV.filter((item) => !item.adminOnly || profile?.role === 'admin')

  return (
    <div className="min-h-screen overflow-x-hidden">
      {isDemoAuth && <DemoBanner />}
      <div className="mx-auto flex min-h-screen max-w-7xl gap-0 md:min-h-[calc(100vh-0.5rem)] md:gap-6 md:px-4 md:py-4">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[min(18rem,88vw)] transform surface transition md:static md:w-72 md:translate-x-0 md:rounded-2xl ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col p-4 md:p-5">
            <div className="mb-6 md:mb-8">
              <p className="font-display text-[20px] leading-snug tracking-tight text-ink md:text-[22px]">
                Лаборатория
                <br />
                предпринимательства
              </p>
              <p className="mt-2 text-[13px] text-slate">Закрытый курс · 2 участника</p>
            </div>

            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
              {items.map(({ to, label, icon: Icon, chat, forum }) => {
                const href = forum ? forumTo : to
                return (
                  <NavLink
                    key={to}
                    to={href}
                    end={forum ? href === '/forum' : undefined}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] ${
                        isActive
                          ? 'bg-teal text-on-accent shadow-sm'
                          : 'text-ink-soft hover:bg-mist'
                      }`
                    }
                  >
                    <Icon size={18} strokeWidth={1.75} />
                    <span className="flex-1">{label}</span>
                    {chat && unread > 0 && (
                      <span className="rounded-full border border-ink/10 bg-mist px-1.5 py-0.5 text-[10px] font-bold text-ink">
                        {unread}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </nav>

            <div className="mt-4 border-t border-ink/10 pt-4">
              <div className="mb-3">
                <p className="font-medium text-ink">
                  {profile ? canonicalDisplayName(profile) : ''}
                </p>
                <p className="text-xs text-slate">
                  {profile?.role === 'admin' ? 'Админ' : 'Участник'}
                  {profile?.participant_slot ? ` · вариант заданий ${profile.participant_slot}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate hover:bg-mist"
              >
                <LogOut size={16} />
                Выйти
              </button>
            </div>
          </div>
        </aside>

        {open && (
          <button
            type="button"
            aria-label="Закрыть меню"
            className="fixed inset-0 z-30 bg-ink/30 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink/5 bg-paper/90 px-3 py-2 backdrop-blur-md md:hidden">
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl surface"
              onClick={() => setOpen(true)}
              aria-label="Открыть меню"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <p className="truncate px-2 font-display text-base">Лаб. предпринимательства</p>
            <span className="min-w-11" />
          </header>
          <main className="flex-1 px-3 pb-8 pt-3 md:px-0 md:pb-4 md:pt-0">
            <div key={location.pathname} className="page-enter">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <Suspense fallback={null}>
        <EntryToasts />
      </Suspense>
    </div>
  )
}
