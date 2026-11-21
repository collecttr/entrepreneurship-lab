import { DEMO_USERS } from '@/lib/demo-data'
import { isDemoAuth } from '@/lib/supabase'

const CHANNEL = 'elab-collab-v1'
const MSG_KEY = 'elab_messages'
const DISC_KEY = 'elab_discussions'
const POST_KEY = 'elab_discussion_posts'
const ACOMM_KEY = 'elab_assignment_comments'
const READ_KEY = 'elab_chat_last_read'
const SEEDED_KEY = 'elab_forum_seeded_v1'

export type ForumKind = 'debate' | 'question' | 'case' | 'source' | 'general'

export interface ChatMessage {
  id: string
  sender_id: string
  body_md: string
  created_at: string
  read_at: string | null
  attachment_name: string | null
  attachment_stub: boolean
}

export interface Discussion {
  id: string
  week_number: number | null
  title: string
  description_md: string
  kind: ForumKind
  author_id: string
  is_resolved: boolean
  created_at: string
  updated_at: string
}

export interface DiscussionPost {
  id: string
  discussion_id: string
  author_id: string
  body_md: string
  parent_id: string | null
  quote_md: string | null
  attachment_name: string | null
  created_at: string
}

export interface AssignmentComment {
  id: string
  assignment_code: string
  author_id: string
  body_md: string
  quote_md: string | null
  created_at: string
}

type CollabEvent =
  | { type: 'messages' }
  | { type: 'discussions' }
  | { type: 'posts' }
  | { type: 'assignment_comments' }
  | { type: 'read' }

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function broadcast(event: CollabEvent) {
  try {
    const bc = new BroadcastChannel(CHANNEL)
    bc.postMessage(event)
    bc.close()
  } catch {
    // BroadcastChannel unavailable — polling/subscribers still work via storage events
  }
  window.dispatchEvent(new CustomEvent('elab-collab', { detail: event }))
}

export function subscribeCollab(onChange: (event: CollabEvent) => void): () => void {
  const onCustom = (e: Event) => onChange((e as CustomEvent<CollabEvent>).detail)
  const onStorage = (e: StorageEvent) => {
    if (!e.key) return
    if (e.key === MSG_KEY) onChange({ type: 'messages' })
    if (e.key === DISC_KEY) onChange({ type: 'discussions' })
    if (e.key === POST_KEY) onChange({ type: 'posts' })
    if (e.key === ACOMM_KEY) onChange({ type: 'assignment_comments' })
    if (e.key === READ_KEY) onChange({ type: 'read' })
  }
  let bc: BroadcastChannel | null = null
  try {
    bc = new BroadcastChannel(CHANNEL)
    bc.onmessage = (e) => onChange(e.data as CollabEvent)
  } catch {
    bc = null
  }
  window.addEventListener('elab-collab', onCustom)
  window.addEventListener('storage', onStorage)
  const poll = window.setInterval(() => onChange({ type: 'messages' }), 4000)
  return () => {
    window.removeEventListener('elab-collab', onCustom)
    window.removeEventListener('storage', onStorage)
    window.clearInterval(poll)
    bc?.close()
  }
}

export function demoTransportLabel(): string {
  if (!isDemoAuth) return 'Supabase Realtime (если publication включена)'
  return 'Демо-синхронизация: localStorage + BroadcastChannel / polling (не production Realtime)'
}

function peerId(myId: string): string {
  const other = DEMO_USERS.find((u) => u.profile.id !== myId)
  return other?.profile.id ?? myId
}

export function getPeerProfile(myId: string) {
  return DEMO_USERS.find((u) => u.profile.id !== myId)?.profile ?? null
}

export function listMessages(): ChatMessage[] {
  return readJson<ChatMessage[]>(MSG_KEY, []).sort((a, b) => a.created_at.localeCompare(b.created_at))
}

export function sendMessage(
  senderId: string,
  body: string,
  attachmentName?: string | null,
): ChatMessage {
  const msg: ChatMessage = {
    id: crypto.randomUUID(),
    sender_id: senderId,
    body_md: body.trim(),
    created_at: new Date().toISOString(),
    read_at: null,
    attachment_name: attachmentName ?? null,
    attachment_stub: Boolean(attachmentName),
  }
  const all = listMessages()
  all.push(msg)
  writeJson(MSG_KEY, all)
  broadcast({ type: 'messages' })
  return msg
}

export function markChatRead(readerId: string) {
  const map = readJson<Record<string, string>>(READ_KEY, {})
  const peer = peerId(readerId)
  const now = new Date().toISOString()
  let messagesChanged = false
  const all = listMessages().map((m) => {
    if (m.sender_id === peer && !m.read_at) {
      messagesChanged = true
      return { ...m, read_at: now }
    }
    return m
  })
  const prevRead = map[readerId]
  map[readerId] = now
  writeJson(READ_KEY, map)
  if (messagesChanged) {
    writeJson(MSG_KEY, all)
    broadcast({ type: 'read' })
    broadcast({ type: 'messages' })
  } else if (!prevRead) {
    // first visit: publish read cursor once, without rewriting messages
    broadcast({ type: 'read' })
  }
}

export function unreadCount(readerId: string): number {
  const map = readJson<Record<string, string>>(READ_KEY, {})
  const last = map[readerId] ?? '1970-01-01T00:00:00.000Z'
  const peer = peerId(readerId)
  return listMessages().filter((m) => m.sender_id === peer && m.created_at > last).length
}

export function listDiscussions(): Discussion[] {
  ensureForumSeed()
  return readJson<Discussion[]>(DISC_KEY, []).sort((a, b) => b.updated_at.localeCompare(a.updated_at))
}

export function getDiscussion(id: string): Discussion | undefined {
  return listDiscussions().find((d) => d.id === id)
}

export function createDiscussion(input: {
  author_id: string
  title: string
  description_md: string
  kind: ForumKind
  week_number: number | null
}): Discussion {
  const now = new Date().toISOString()
  const d: Discussion = {
    id: crypto.randomUUID(),
    week_number: input.week_number,
    title: input.title.trim(),
    description_md: input.description_md.trim(),
    kind: input.kind,
    author_id: input.author_id,
    is_resolved: false,
    created_at: now,
    updated_at: now,
  }
  const all = listDiscussions()
  all.unshift(d)
  writeJson(DISC_KEY, all)
  broadcast({ type: 'discussions' })
  return d
}

export function setDiscussionResolved(id: string, resolved: boolean) {
  const all = listDiscussions().map((d) =>
    d.id === id ? { ...d, is_resolved: resolved, updated_at: new Date().toISOString() } : d,
  )
  writeJson(DISC_KEY, all)
  broadcast({ type: 'discussions' })
}

export function listPosts(discussionId: string): DiscussionPost[] {
  return readJson<DiscussionPost[]>(POST_KEY, [])
    .filter((p) => p.discussion_id === discussionId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

export function addPost(input: {
  discussion_id: string
  author_id: string
  body_md: string
  parent_id?: string | null
  quote_md?: string | null
  attachment_name?: string | null
}): DiscussionPost {
  const post: DiscussionPost = {
    id: crypto.randomUUID(),
    discussion_id: input.discussion_id,
    author_id: input.author_id,
    body_md: input.body_md.trim(),
    parent_id: input.parent_id ?? null,
    quote_md: input.quote_md ?? null,
    attachment_name: input.attachment_name ?? null,
    created_at: new Date().toISOString(),
  }
  const all = readJson<DiscussionPost[]>(POST_KEY, [])
  all.push(post)
  writeJson(POST_KEY, all)
  const discs = listDiscussions().map((d) =>
    d.id === input.discussion_id ? { ...d, updated_at: post.created_at } : d,
  )
  writeJson(DISC_KEY, discs)
  broadcast({ type: 'posts' })
  broadcast({ type: 'discussions' })
  return post
}

export function listAssignmentComments(code: string): AssignmentComment[] {
  return readJson<AssignmentComment[]>(ACOMM_KEY, [])
    .filter((c) => c.assignment_code === code)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

export function addAssignmentComment(input: {
  assignment_code: string
  author_id: string
  body_md: string
  quote_md?: string | null
}): AssignmentComment {
  const c: AssignmentComment = {
    id: crypto.randomUUID(),
    assignment_code: input.assignment_code,
    author_id: input.author_id,
    body_md: input.body_md.trim(),
    quote_md: input.quote_md ?? null,
    created_at: new Date().toISOString(),
  }
  const all = readJson<AssignmentComment[]>(ACOMM_KEY, [])
  all.push(c)
  writeJson(ACOMM_KEY, all)
  broadcast({ type: 'assignment_comments' })
  return c
}

export function authorName(userId: string): string {
  return DEMO_USERS.find((u) => u.profile.id === userId)?.profile.display_name ?? 'Участник'
}

function ensureForumSeed() {
  if (localStorage.getItem(SEEDED_KEY) === '1') {
    if (readJson<Discussion[]>(DISC_KEY, []).length > 0) return
  }
  const a = DEMO_USERS[0].profile.id
  const b = DEMO_USERS[1].profile.id
  const now = Date.now()
  const seeds: Discussion[] = [
    {
      id: 'seed-debate-w1',
      week_number: 1,
      title: 'Дебаты W1: маркетинг до 10 личных сделок?',
      description_md:
        'Можно ли масштабировать маркетинг до того, как основатель лично закрыл 10 сделок? Аргументы с доказательствами.',
      kind: 'debate',
      author_id: a,
      is_resolved: false,
      created_at: new Date(now - 86400000 * 3).toISOString(),
      updated_at: new Date(now - 86400000 * 2).toISOString(),
    },
    {
      id: 'seed-q-qualification',
      week_number: 3,
      title: 'Вопрос: какие критерии квалификации у вас сработали?',
      description_md: 'Поделитесь 2–3 критериями go/no-go из практики недели 3.',
      kind: 'question',
      author_id: b,
      is_resolved: false,
      created_at: new Date(now - 86400000 * 2).toISOString(),
      updated_at: new Date(now - 86400000).toISOString(),
    },
    {
      id: 'seed-case-stakeholder',
      week_number: 2,
      title: 'Кейс: чемпион говорит «да», CFO молчит',
      description_md: 'Разберите план на 10 дней. Кто следующий разговор и с каким ask?',
      kind: 'case',
      author_id: a,
      is_resolved: false,
      created_at: new Date(now - 86400000).toISOString(),
      updated_at: new Date(now - 86400000).toISOString(),
    },
    {
      id: 'seed-source-yc-sales',
      week_number: 1,
      title: 'Источник: YC Sales Playbook — что вынесли?',
      description_md:
        'После чтения https://www.ycombinator.com/library/Mo-the-sales-playbook-for-founders — один инсайт и один следующий шаг.',
      kind: 'source',
      author_id: b,
      is_resolved: true,
      created_at: new Date(now - 86400000 * 4).toISOString(),
      updated_at: new Date(now - 86400000 * 3).toISOString(),
    },
  ]
  const posts: DiscussionPost[] = [
    {
      id: 'seed-post-1',
      discussion_id: 'seed-debate-w1',
      author_id: b,
      body_md: 'Считаю, что без личных сделок маркетинг оптимизирует тщеславие. Сначала 10 разговоров с CTA.',
      parent_id: null,
      quote_md: null,
      attachment_name: null,
      created_at: new Date(now - 86400000 * 2).toISOString(),
    },
    {
      id: 'seed-post-2',
      discussion_id: 'seed-debate-w1',
      author_id: a,
      body_md: 'Согласна частично: контент можно, но KPI должен быть «разговор», не просмотры.',
      parent_id: 'seed-post-1',
      quote_md: 'Сначала 10 разговоров с CTA.',
      attachment_name: null,
      created_at: new Date(now - 86400000 * 2 + 3600000).toISOString(),
    },
    {
      id: 'seed-post-3',
      discussion_id: 'seed-source-yc-sales',
      author_id: a,
      body_md: 'Инсайт: следующий шаг сделки важнее идеального питча. Шаг: 5 касаний с явным CTA.',
      parent_id: null,
      quote_md: null,
      attachment_name: null,
      created_at: new Date(now - 86400000 * 3).toISOString(),
    },
  ]
  writeJson(DISC_KEY, seeds)
  writeJson(POST_KEY, posts)
  localStorage.setItem(SEEDED_KEY, '1')
}
