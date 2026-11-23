import {
  COURSE_START_DATE,
  courseWeekNumber,
  daysUntilDeadline,
  formatRuDate,
  moscowDateString,
  weekDeadlineDate,
} from '@/lib/course-calendar'
import { listDiscussions, listMessages, listPosts, unreadCount } from '@/lib/collab-store'
import { isCurrentWeekIncomplete } from '@/lib/peer-progress'
import type { Profile } from '@/lib/types'

const SEEN_KEY = 'elab_entry_notif_seen_v1'
const SESSION_SHOWN_KEY = 'elab_entry_notif_session_v1'

export type EntryToastKind = 'chat' | 'forum' | 'deadline'

export interface EntryToast {
  id: string
  kind: EntryToastKind
  title: string
  body: string
  href: string
}

interface SeenState {
  chat_at: string
  forum_at: string
  /** Keys already toasted, e.g. deadline:2026-11-23:w1 */
  keys: string[]
}

function readSeen(): SeenState {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    if (!raw) {
      return { chat_at: '1970-01-01T00:00:00.000Z', forum_at: '1970-01-01T00:00:00.000Z', keys: [] }
    }
    const parsed = JSON.parse(raw) as Partial<SeenState>
    return {
      chat_at: typeof parsed.chat_at === 'string' ? parsed.chat_at : '1970-01-01T00:00:00.000Z',
      forum_at: typeof parsed.forum_at === 'string' ? parsed.forum_at : '1970-01-01T00:00:00.000Z',
      keys: Array.isArray(parsed.keys) ? parsed.keys.filter((k) => typeof k === 'string') : [],
    }
  } catch {
    return { chat_at: '1970-01-01T00:00:00.000Z', forum_at: '1970-01-01T00:00:00.000Z', keys: [] }
  }
}

function writeSeen(next: SeenState) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(next))
  } catch (err) {
    console.warn('entry notif seen write failed:', err)
  }
}

function sessionAlreadyShown(): boolean {
  try {
    return sessionStorage.getItem(SESSION_SHOWN_KEY) === '1'
  } catch {
    return false
  }
}

function markSessionShown() {
  try {
    sessionStorage.setItem(SESSION_SHOWN_KEY, '1')
  } catch {
    // ignore
  }
}

function forumUnreadSince(readerId: string, sinceIso: string): number {
  let count = 0
  for (const d of listDiscussions()) {
    if (d.author_id !== readerId && d.created_at > sinceIso) count += 1
    for (const p of listPosts(d.id)) {
      if (p.author_id !== readerId && p.created_at > sinceIso) count += 1
    }
  }
  return count
}

function latestChatIso(readerId: string): string | null {
  const msgs = listMessages().filter((m) => m.sender_id !== readerId)
  if (!msgs.length) return null
  return msgs.reduce((a, b) => (a.created_at > b.created_at ? a : b)).created_at
}

function latestForumIso(readerId: string): string | null {
  let latest: string | null = null
  for (const d of listDiscussions()) {
    if (d.author_id !== readerId && (!latest || d.created_at > latest)) latest = d.created_at
    for (const p of listPosts(d.id)) {
      if (p.author_id !== readerId && (!latest || p.created_at > latest)) latest = p.created_at
    }
  }
  return latest
}

/**
 * Build entry toasts for unread chat/forum and week deadline reminders.
 * Persists last-seen so the same items do not toast again on reload.
 */
export function collectEntryToasts(profile: Profile): EntryToast[] {
  if (sessionAlreadyShown()) return []

  const seen = readSeen()
  const toasts: EntryToast[] = []
  const newKeys: string[] = []
  let nextChat = seen.chat_at
  let nextForum = seen.forum_at

  const chatNew = listMessages().filter(
    (m) => m.sender_id !== profile.id && m.created_at > seen.chat_at,
  ).length
  const chatUnread = unreadCount(profile.id)

  if (chatNew > 0) {
    toasts.push({
      id: `chat-${chatNew}`,
      kind: 'chat',
      title: 'Новые сообщения в чате',
      body:
        chatNew === 1
          ? 'У вас 1 непрочитанное сообщение от партнёра.'
          : `У вас ${chatNew} непрочитанных сообщений от партнёра.`,
      href: '/chat',
    })
    const latest = latestChatIso(profile.id)
    if (latest && latest > nextChat) nextChat = latest
  } else if (chatUnread > 0 && seen.chat_at === '1970-01-01T00:00:00.000Z') {
    toasts.push({
      id: `chat-unread-${chatUnread}`,
      kind: 'chat',
      title: 'Новые сообщения в чате',
      body:
        chatUnread === 1
          ? 'У вас 1 непрочитанное сообщение от партнёра.'
          : `У вас ${chatUnread} непрочитанных сообщений от партнёра.`,
      href: '/chat',
    })
    nextChat = new Date().toISOString()
  }

  const forumNew = forumUnreadSince(profile.id, seen.forum_at)
  if (forumNew > 0) {
    toasts.push({
      id: `forum-${forumNew}`,
      kind: 'forum',
      title: 'Новое на форуме',
      body:
        forumNew === 1
          ? 'Появился 1 новый непрочитанный пост или ответ.'
          : `Появилось ${forumNew} новых непрочитанных постов или ответов.`,
      href: '/forum',
    })
    const latest = latestForumIso(profile.id)
    if (latest && latest > nextForum) nextForum = latest
  }

  const today = moscowDateString()
  const week = courseWeekNumber(today, COURSE_START_DATE)
  const daysLeft = daysUntilDeadline(week, today, COURSE_START_DATE)
  const deadline = weekDeadlineDate(week, COURSE_START_DATE)
  const incomplete = isCurrentWeekIncomplete(profile)

  if (incomplete) {
    const key = `deadline:${today}:w${week}`
    if (!seen.keys.includes(key)) {
      let body: string
      if (daysLeft < 0) {
        body = `Неделя ${week}: этап не закрыт, дедлайн ${formatRuDate(deadline)} уже прошёл.`
      } else if (daysLeft === 0) {
        body = `Неделя ${week}: сегодня последний день (${formatRuDate(deadline)}). Сдайте свой этап.`
      } else if (daysLeft <= 2) {
        body = `Неделя ${week}: осталось ${daysLeft} дн. до ${formatRuDate(deadline)}. Этап ещё не сдан.`
      } else {
        body = `Неделя ${week} началась. Этап не завершён · дедлайн ${formatRuDate(deadline)}.`
      }
      toasts.push({
        id: key,
        kind: 'deadline',
        title: 'Напоминание по неделе',
        body,
        href: '/assignments',
      })
      newKeys.push(key)
    }
  }

  markSessionShown()
  writeSeen({
    chat_at: nextChat,
    forum_at: nextForum,
    keys: [...seen.keys, ...newKeys].slice(-60),
  })

  return toasts
}
