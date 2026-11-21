import { NavLink, Outlet } from 'react-router-dom'
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
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { subscribeCollab, unreadCount } from '@/lib/collab-store'
import { AiDownBanner } from './AiDownBanner'
import { DemoBanner } from './DemoBanner'

const NAV = [
  { to: '/dashboard', label: 'Обзор', icon: LayoutDashboard },
  { to: '/program', label: 'Программа', icon: BookOpen },
  { to: '/library', label: 'Библиотека', icon: Library },
  { to: '/assignments', label: 'Задания', icon: FileText },
  { to: '/skills', label: 'Навыки', icon: Sparkles },
  { to: '/chat', label: 'Чат', icon: MessageSquare, chat: true },
  { to: '/forum', label: 'Форум', icon: MessagesSquare },
  { to: '/documents', label: 'Документы', icon: FileText },
  { to: '/ai', label: 'Тренажёры', icon: Bot },
  { to: '/admin', label: 'Админ', icon: Shield, adminOnly: true },
]

export function AppShell() {
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!profile) return
    const refresh = () => setUnread(unreadCount(profile.id))
    refresh()
    return subscribeCollab(refresh)
  }, [profile])

  const items = NAV.filter((item) => !item.adminOnly || profile?.role === 'admin')

  return (
    <div className="min-h-screen">
      <DemoBanner />
      <AiDownBanner />
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl gap-0 md:gap-6 md:px-4 md:py-4">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform surface transition md:static md:translate-x-0 md:rounded-2xl ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col p-5">
            <div className="mb-8">
              <p className="font-display text-[22px] leading-snug tracking-tight text-ink">
                Лаборатория
                <br />
                предпринимательства
              </p>
              <p className="mt-2 text-[13px] text-slate">Закрытый курс · 2 участника</p>
            </div>

            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
              {items.map(({ to, label, icon: Icon, chat }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-[10px] text-[15px] ${
                      isActive
                        ? 'bg-teal text-on-accent shadow-sm'
                        : 'text-ink-soft hover:bg-mist'
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={1.75} />
                  <span className="flex-1">{label}</span>
                  {chat && unread > 0 && (
                    <span className="rounded-full bg-mist px-1.5 py-0.5 text-[10px] font-bold text-ink border border-ink/10">
                      {unread}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="mt-4 border-t border-ink/10 pt-4">
              <div className="mb-3">
                <p className="font-medium text-ink">{profile?.display_name}</p>
                <p className="text-xs text-slate">
                  {profile?.role === 'admin' ? 'Админ' : 'Участник'}
                  {profile?.participant_slot ? ` · вариант заданий ${profile.participant_slot}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate hover:bg-mist"
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
          <header className="flex items-center justify-between px-4 py-3 md:hidden">
            <button
              type="button"
              className="rounded-xl surface p-2"
              onClick={() => setOpen(true)}
              aria-label="Открыть меню"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <p className="font-display text-lg">Лаб. предпринимательства</p>
            <span className="w-9" />
          </header>
          <main className="flex-1 px-4 pb-8 md:px-0 md:pb-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
