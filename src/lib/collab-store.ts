import { DEMO_USERS } from '@/lib/demo-data'
import { canonicalDisplayName } from '@/lib/learners'
import { isDemoAuth, supabase, supabaseConfigured } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

const CHANNEL = 'elab-collab-v1'
const useLiveCollab = () => Boolean(supabaseConfigured && !isDemoAuth && supabase)
const MSG_KEY = 'elab_messages'
const DISC_KEY = 'elab_discussions'
const POST_KEY = 'elab_discussion_posts'
const ACOMM_KEY = 'elab_assignment_comments'
const READ_KEY = 'elab_chat_last_read'
const SEEDED_KEY = 'elab_forum_seeded_v1'
const PEER_KEY = 'elab_chat_peer_v1'
const PEER_BY_USER_PREFIX = 'elab_chat_peer_v2:'
const FORUM_CTX_PREFIX = 'elab_forum_ctx_v1:'
const PROFILE_CACHE_KEY = 'elab_profile_cache_v1'

function peerStorageKey(userId: string) {
  return `${PEER_BY_USER_PREFIX}${userId}`
}

function forumCtxKey(userId: string) {
  return `${FORUM_CTX_PREFIX}${userId}`
}

/** Lightweight contact used for 1:1 chat peer + author labels. */
export type PeerContact = Pick<Profile, 'id' | 'email' | 'display_name'>

const DEMO_SEED_DISCUSSION_IDS = new Set([
  'seed-debate-w1',
  'seed-q-qualification',
  'seed-case-stakeholder',
  'seed-source-yc-sales',
])

const DEMO_SEED_POST_IDS = new Set(['seed-post-1', 'seed-post-2', 'seed-post-3'])

export function isDemoForumSeedId(id: string): boolean {
  return DEMO_SEED_DISCUSSION_IDS.has(id) || id.startsWith('seed-')
}

export type ForumKind = 'debate' | 'question' | 'case' | 'source' | 'general'

export type ForumListContext = {
  kind: ForumKind | 'all'
  q: string
  lastDiscussionId: string | null
}

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
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.warn('localStorage write failed:', key, err)
  }
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function safeIso(value: unknown, fallback = '1970-01-01T00:00:00.000Z'): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

function normalizeMessage(raw: unknown, index: number): ChatMessage | null {
  if (!raw || typeof raw !== 'object') return null
  const m = raw as Partial<ChatMessage>
  const id = typeof m.id === 'string' && m.id ? m.id : `msg-${index}`
  const sender_id = typeof m.sender_id === 'string' ? m.sender_id : ''
  if (!sender_id) return null
  return {
    id,
    sender_id,
    body_md: typeof m.body_md === 'string' ? m.body_md : String(m.body_md ?? ''),
    created_at: safeIso(m.created_at),
    read_at: typeof m.read_at === 'string' && m.read_at ? m.read_at : null,
    attachment_name:
      typeof m.attachment_name === 'string' && m.attachment_name ? m.attachment_name : null,
    attachment_stub: Boolean(m.attachment_stub),
  }
}

const FORUM_KINDS: ForumKind[] = ['debate', 'question', 'case', 'source', 'general']

function normalizeDiscussion(raw: unknown, index: number): Discussion | null {
  if (!raw || typeof raw !== 'object') return null
  const d = raw as Partial<Discussion>
  const id = typeof d.id === 'string' && d.id ? d.id : `disc-${index}`
  const author_id = typeof d.author_id === 'string' ? d.author_id : ''
  if (!author_id) return null
  const kind = FORUM_KINDS.includes(d.kind as ForumKind) ? (d.kind as ForumKind) : 'general'
  const weekRaw = d.week_number
  const week_number =
    typeof weekRaw === 'number' && Number.isFinite(weekRaw)
      ? Math.max(1, Math.min(26, Math.floor(weekRaw)))
      : null
  return {
    id,
    week_number,
    title: typeof d.title === 'string' ? d.title : String(d.title ?? 'Без названия'),
    description_md:
      typeof d.description_md === 'string' ? d.description_md : String(d.description_md ?? ''),
    kind,
    author_id,
    is_resolved: Boolean(d.is_resolved),
    created_at: safeIso(d.created_at),
    updated_at: safeIso(d.updated_at, safeIso(d.created_at)),
  }
}

function normalizePost(raw: unknown, index: number): DiscussionPost | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Partial<DiscussionPost>
  const id = typeof p.id === 'string' && p.id ? p.id : `post-${index}`
  const discussion_id = typeof p.discussion_id === 'string' ? p.discussion_id : ''
  const author_id = typeof p.author_id === 'string' ? p.author_id : ''
  if (!discussion_id || !author_id) return null
  return {
    id,
    discussion_id,
    author_id,
    body_md: typeof p.body_md === 'string' ? p.body_md : String(p.body_md ?? ''),
    parent_id: typeof p.parent_id === 'string' && p.parent_id ? p.parent_id : null,
    quote_md: typeof p.quote_md === 'string' && p.quote_md ? p.quote_md : null,
    attachment_name:
      typeof p.attachment_name === 'string' && p.attachment_name ? p.attachment_name : null,
    created_at: safeIso(p.created_at),
  }
}

function broadcast(event: CollabEvent) {
  try {
    const bc = new BroadcastChannel(CHANNEL)
    bc.postMessage(event)
    bc.close()
  } catch {
    // BroadcastChannel unavailable — polling/subscribers still work via storage events
  }
  try {
    window.dispatchEvent(new CustomEvent('elab-collab', { detail: event }))
  } catch (err) {
    console.warn('collab broadcast failed:', err)
  }
}

function notifySubscriber(onChange: (event: CollabEvent) => void, event: CollabEvent) {
  try {
    onChange(event)
  } catch (err) {
    // Subscriber bugs (or transient store errors) must not tear down the app
    console.warn('collab subscriber error:', err)
  }
}

async function hydrateMessagesFromSupabase() {
  if (!useLiveCollab() || !supabase) return
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id,sender_id,body_md,created_at,read_at,attachment_name,attachment_stub')
      .order('created_at', { ascending: true })
    if (error) {
      console.warn('messages hydrate skipped:', error.message)
      return
    }
    if (data) {
      const normalized = asArray<unknown>(data)
        .map((row, i) => normalizeMessage(row, i))
        .filter((m): m is ChatMessage => m != null)
      writeJson(MSG_KEY, normalized)
      broadcast({ type: 'messages' })
    }
  } catch (err) {
    console.warn('messages hydrate failed:', err)
  }
}

async function hydrateForumFromSupabase() {
  if (!useLiveCollab() || !supabase) return
  try {
    const [disc, posts] = await Promise.all([
      supabase.from('discussions').select('*').order('updated_at', { ascending: false }),
      supabase.from('discussion_posts').select('*').order('created_at', { ascending: true }),
    ])
    if (disc.error) console.warn('discussions hydrate:', disc.error.message)
    else if (disc.data) {
      const normalized = asArray<unknown>(disc.data)
        .map((row, i) => normalizeDiscussion(row, i))
        .filter((d): d is Discussion => d != null)
      writeJson(DISC_KEY, normalized)
    }
    if (posts.error) console.warn('posts hydrate:', posts.error.message)
    else if (posts.data) {
      const normalized = asArray<unknown>(posts.data)
        .map((row, i) => normalizePost(row, i))
        .filter((p): p is DiscussionPost => p != null)
      writeJson(POST_KEY, normalized)
    }
    broadcast({ type: 'discussions' })
    broadcast({ type: 'posts' })
  } catch (err) {
    console.warn('forum hydrate failed:', err)
  }
}

/** Shared Realtime channel so AppShell + Chat + Forum do not fight over the same topic.
 * Hydrate helpers already `broadcast()`, so every local subscriber receives updates. */
let realtimeRefCount = 0
let sharedRealtimeCleanup: (() => void) | null = null

function acquireRealtime(live: NonNullable<typeof supabase>) {
  realtimeRefCount += 1
  if (realtimeRefCount === 1 || !sharedRealtimeCleanup) {
    try {
      void hydrateMessagesFromSupabase()
      void hydrateForumFromSupabase()
      const channel = live
        .channel('elab-collab-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
          void hydrateMessagesFromSupabase()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'discussions' }, () => {
          void hydrateForumFromSupabase()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'discussion_posts' }, () => {
          void hydrateForumFromSupabase()
        })
        .subscribe((status, err) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('realtime collab:', err?.message ?? status)
          }
        })
      sharedRealtimeCleanup = () => {
        try {
          void live.removeChannel(channel)
        } catch (removeErr) {
          console.warn('realtime remove failed:', removeErr)
        }
        sharedRealtimeCleanup = null
      }
    } catch (err) {
      console.warn('realtime subscribe failed — using local cache only:', err)
      sharedRealtimeCleanup = null
    }
  }
  return () => {
    realtimeRefCount = Math.max(0, realtimeRefCount - 1)
    if (realtimeRefCount === 0) {
      sharedRealtimeCleanup?.()
    }
  }
}

export function subscribeCollab(onChange: (event: CollabEvent) => void): () => void {
  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent<CollabEvent>).detail
    if (!detail || typeof detail !== 'object' || !('type' in detail)) return
    notifySubscriber(onChange, detail)
  }
  const onStorage = (e: StorageEvent) => {
    if (!e.key) return
    if (e.key === MSG_KEY) notifySubscriber(onChange, { type: 'messages' })
    if (e.key === DISC_KEY) notifySubscriber(onChange, { type: 'discussions' })
    if (e.key === POST_KEY) notifySubscriber(onChange, { type: 'posts' })
    if (e.key === ACOMM_KEY) notifySubscriber(onChange, { type: 'assignment_comments' })
    if (e.key === READ_KEY) notifySubscriber(onChange, { type: 'read' })
  }
  let bc: BroadcastChannel | null = null
  try {
    bc = new BroadcastChannel(CHANNEL)
    bc.onmessage = (e) => {
      const data = e.data as CollabEvent
      if (!data || typeof data !== 'object' || !('type' in data)) return
      notifySubscriber(onChange, data)
    }
  } catch {
    bc = null
  }
  window.addEventListener('elab-collab', onCustom)
  window.addEventListener('storage', onStorage)
  const poll = window.setInterval(() => notifySubscriber(onChange, { type: 'messages' }), 4000)

  let releaseRealtime: (() => void) | null = null
  const live = supabase
  if (useLiveCollab() && live) {
    // Fan-in: first subscriber owns the channel; later ones still get CustomEvent/poll.
    releaseRealtime = acquireRealtime(live)
  }

  return () => {
    window.removeEventListener('elab-collab', onCustom)
    window.removeEventListener('storage', onStorage)
    window.clearInterval(poll)
    bc?.close()
    releaseRealtime?.()
  }
}

export function demoTransportLabel(): string {
  if (useLiveCollab()) return 'Живая синхронизация чата и форума · при сбое — копия в браузере'
  if (!isDemoAuth) return 'Сервер настроен, но демо-вход недоступен — сообщения хранятся в браузере'
  return 'Демо: сообщения хранятся в браузере и синхронизируются между вкладками'
}

function readProfileCache(): Record<string, PeerContact> {
  const raw = readJson<unknown>(PROFILE_CACHE_KEY, {})
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: Record<string, PeerContact> = {}
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue
    const row = value as Partial<PeerContact>
    if (typeof row.id !== 'string' || typeof row.email !== 'string') continue
    out[id] = {
      id: row.id,
      email: row.email,
      display_name:
        typeof row.display_name === 'string' && row.display_name
          ? row.display_name
          : row.email.split('@')[0] ?? row.email,
    }
  }
  return out
}

export function rememberProfile(contact: PeerContact) {
  try {
    const cache = readProfileCache()
    cache[contact.id] = {
      id: contact.id,
      email: contact.email.trim().toLowerCase(),
      display_name: contact.display_name.trim() || contact.email.split('@')[0] || 'Участник',
    }
    writeJson(PROFILE_CACHE_KEY, cache)
  } catch (err) {
    console.warn('rememberProfile failed:', err)
  }
}

function normalizePeerContact(raw: unknown): PeerContact | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Partial<PeerContact>
  if (typeof row.id !== 'string' || !row.id) return null
  if (typeof row.email !== 'string' || !row.email) return null
  return {
    id: row.id,
    email: row.email,
    display_name:
      typeof row.display_name === 'string' && row.display_name
        ? row.display_name
        : row.email.split('@')[0] ?? 'Участник',
  }
}

function readStoredPeer(myId: string): PeerContact | null {
  try {
    const keyed = normalizePeerContact(readJson<unknown>(peerStorageKey(myId), null))
    if (keyed) return keyed

    // Migrate legacy global peer key into per-user storage once.
    const legacy = normalizePeerContact(readJson<unknown>(PEER_KEY, null))
    if (legacy && legacy.id !== myId) {
      writeJson(peerStorageKey(myId), legacy)
      try {
        localStorage.removeItem(PEER_KEY)
      } catch {
        // ignore
      }
      return legacy
    }
    return null
  } catch {
    return null
  }
}

function bumpCloudUiPrefs(userId: string | undefined) {
  if (!userId) return
  void import('@/lib/ui-prefs-store')
    .then((m) => m.noteCollabUiChange(userId))
    .catch(() => {
      // optional module
    })
}

/** Persist the 1:1 chat contact per learner (survives reload). Pass myId of the signed-in user. */
export function setChatPeer(contact: PeerContact | null, myId?: string) {
  try {
    if (!contact) {
      if (myId) {
        try {
          localStorage.removeItem(peerStorageKey(myId))
        } catch {
          // ignore
        }
      }
      try {
        localStorage.removeItem(PEER_KEY)
      } catch {
        // ignore
      }
      broadcast({ type: 'read' })
      bumpCloudUiPrefs(myId)
      return
    }
    const normalized: PeerContact = {
      id: contact.id,
      email: contact.email.trim().toLowerCase(),
      display_name: contact.display_name.trim() || contact.email.split('@')[0] || 'Участник',
    }
    if (myId) {
      writeJson(peerStorageKey(myId), normalized)
    } else {
      writeJson(PEER_KEY, normalized)
    }
    rememberProfile(normalized)
    broadcast({ type: 'read' })
    bumpCloudUiPrefs(myId)
  } catch (err) {
    console.warn('setChatPeer failed:', err)
  }
}

function demoPeerFor(myId: string): PeerContact | null {
  const other = DEMO_USERS.find((u) => u.profile.id !== myId)
  if (!other) return null
  return {
    id: other.profile.id,
    email: other.profile.email,
    display_name: other.profile.display_name,
  }
}

export function getPeerProfile(myId: string): PeerContact | null {
  const stored = readStoredPeer(myId)
  if (stored && stored.id !== myId) return stored

  if (isDemoAuth) {
    const demo = demoPeerFor(myId)
    if (demo) {
      // Auto-wire demo peer so two-tab demos keep working without search.
      if (!stored) setChatPeer(demo, myId)
      return demo
    }
  }

  return null
}

const DEFAULT_FORUM_CTX: ForumListContext = {
  kind: 'all',
  q: '',
  lastDiscussionId: null,
}

export function getForumContext(userId: string): ForumListContext {
  const raw = readJson<unknown>(forumCtxKey(userId), null)
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_FORUM_CTX }
  const row = raw as Partial<ForumListContext>
  const kind =
    row.kind === 'all' ||
    row.kind === 'debate' ||
    row.kind === 'question' ||
    row.kind === 'case' ||
    row.kind === 'source' ||
    row.kind === 'general'
      ? row.kind
      : 'all'
  return {
    kind,
    q: typeof row.q === 'string' ? row.q : '',
    lastDiscussionId: typeof row.lastDiscussionId === 'string' && row.lastDiscussionId ? row.lastDiscussionId : null,
  }
}

export function setForumListFilters(userId: string, filters: { kind: ForumKind | 'all'; q: string }) {
  const prev = getForumContext(userId)
  writeJson(forumCtxKey(userId), {
    ...prev,
    kind: filters.kind,
    q: filters.q,
  })
  bumpCloudUiPrefs(userId)
}

/** Remember last opened forum thread for this learner (survives reload). */
export function setLastForumDiscussion(userId: string, discussionId: string | null) {
  const prev = getForumContext(userId)
  writeJson(forumCtxKey(userId), {
    ...prev,
    lastDiscussionId: discussionId,
  })
  broadcast({ type: 'discussions' })
  bumpCloudUiPrefs(userId)
}

export function getLastForumPath(userId: string): string {
  const { lastDiscussionId } = getForumContext(userId)
  if (!lastDiscussionId) return '/forum'
  try {
    if (getDiscussion(lastDiscussionId)) return `/forum/${lastDiscussionId}`
  } catch {
    // fall through
  }
  return '/forum'
}

function peerId(myId: string): string | null {
  return getPeerProfile(myId)?.id ?? null
}

export type AllowlistedSearchHit = PeerContact & { registered: boolean }

/**
 * Search allowlisted users by email/name.
 * Live: RPC `search_allowlisted_users` (profiles ∩ allowed_emails), fallback to profiles select.
 * Demo: filter DEMO_USERS only (no bots beyond the two fixtures).
 */
export async function searchAllowlistedUsers(
  query: string,
  myId: string,
): Promise<{ hits: AllowlistedSearchHit[]; error?: string }> {
  const q = query.trim().toLowerCase()

  if (isDemoAuth) {
    const hits = DEMO_USERS.filter((u) => u.profile.id !== myId)
      .map((u) => u.profile)
      .filter((p) => {
        if (!q) return true
        return p.email.toLowerCase().includes(q) || p.display_name.toLowerCase().includes(q)
      })
      .map((p) => ({
        id: p.id,
        email: p.email,
        display_name: p.display_name,
        registered: true,
      }))
    return { hits }
  }

  if (!useLiveCollab() || !supabase) {
    return {
      hits: [],
      error: 'Сервер недоступен для поиска участников. Проверьте настройки входа.',
    }
  }

  try {
    const { data, error } = await supabase.rpc('search_allowlisted_users', {
      search_query: q,
    })
    if (!error && Array.isArray(data)) {
      const hits: AllowlistedSearchHit[] = data
        .map((row: { id?: string; email?: string; display_name?: string }) => {
          if (typeof row?.id !== 'string' || typeof row?.email !== 'string') return null
          const hit: AllowlistedSearchHit = {
            id: row.id,
            email: row.email,
            display_name:
              typeof row.display_name === 'string' && row.display_name
                ? row.display_name
                : row.email.split('@')[0] ?? row.email,
            registered: true,
          }
          rememberProfile(hit)
          return hit
        })
        .filter((h): h is AllowlistedSearchHit => h != null && h.id !== myId)
      return { hits }
    }
    if (error) {
      console.warn('search_allowlisted_users RPC:', error.message)
    }
  } catch (err) {
    console.warn('search_allowlisted_users failed:', err)
  }

  // Fallback if migration 009 not applied yet — RLS profiles_select still requires allowlist
  try {
    let req = supabase
      .from('profiles')
      .select('id,email,display_name')
      .neq('id', myId)
      .limit(20)
    if (q) {
      req = req.or(`email.ilike.%${q}%,display_name.ilike.%${q}%`)
    }
    const { data, error } = await req
    if (error) {
      return {
        hits: [],
        error:
          'Не удалось найти участников. Проверьте доступ и миграцию search_allowlisted_users (009).',
      }
    }
    const hits: AllowlistedSearchHit[] = asArray<unknown>(data)
      .map((row) => {
        if (!row || typeof row !== 'object') return null
        const r = row as Partial<PeerContact>
        if (typeof r.id !== 'string' || typeof r.email !== 'string') return null
        const hit: AllowlistedSearchHit = {
          id: r.id,
          email: r.email,
          display_name:
            typeof r.display_name === 'string' && r.display_name
              ? r.display_name
              : r.email.split('@')[0] ?? r.email,
          registered: true,
        }
        rememberProfile(hit)
        return hit
      })
      .filter((h): h is AllowlistedSearchHit => h != null)
    return { hits }
  } catch (err) {
    console.warn('profiles search fallback failed:', err)
    return { hits: [], error: 'Не удалось найти участников. Попробуйте ещё раз.' }
  }
}

/** Prefetch other allowlisted profiles into the name cache (live only). */
export async function hydrateAllowlistedProfiles(myId?: string): Promise<void> {
  if (!useLiveCollab() || !supabase) {
    for (const u of DEMO_USERS) {
      rememberProfile({
        id: u.profile.id,
        email: u.profile.email,
        display_name: u.profile.display_name,
      })
    }
    return
  }
  try {
    const { data, error } = await supabase.rpc('search_allowlisted_users', { search_query: '' })
    if (!error && Array.isArray(data)) {
      for (const row of data as Array<{ id?: string; email?: string; display_name?: string }>) {
        if (typeof row?.id !== 'string' || typeof row?.email !== 'string') continue
        if (myId && row.id === myId) continue
        rememberProfile({
          id: row.id,
          email: row.email,
          display_name:
            typeof row.display_name === 'string' && row.display_name
              ? row.display_name
              : row.email.split('@')[0] ?? row.email,
        })
      }
      return
    }
  } catch {
    // fall through
  }
  try {
    let req = supabase.from('profiles').select('id,email,display_name').limit(20)
    if (myId) req = req.neq('id', myId)
    const { data } = await req
    for (const row of asArray<{ id: string; email: string; display_name: string }>(data ?? [])) {
      rememberProfile(row)
    }
  } catch (err) {
    console.warn('hydrateAllowlistedProfiles failed:', err)
  }
}

export function listMessages(): ChatMessage[] {
  try {
    const raw = readJson<unknown>(MSG_KEY, [])
    return asArray<unknown>(raw)
      .map((row, i) => normalizeMessage(row, i))
      .filter((m): m is ChatMessage => m != null)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
  } catch (err) {
    console.warn('listMessages failed:', err)
    return []
  }
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
  if (useLiveCollab() && supabase) {
    void supabase
      .from('messages')
      .insert({
        id: msg.id,
        sender_id: msg.sender_id,
        body_md: msg.body_md,
        created_at: msg.created_at,
        attachment_name: msg.attachment_name,
        attachment_stub: msg.attachment_stub,
      })
      .then(({ error }) => {
        if (error) console.warn('messages insert:', error.message)
      })
  }
  return msg
}

function readCursorMap(): Record<string, string> {
  const raw = readJson<unknown>(READ_KEY, {})
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === 'string') out[k] = v
  }
  return out
}

export function markChatRead(readerId: string) {
  try {
    const map = readCursorMap()
    const peer = peerId(readerId)
    const now = new Date().toISOString()
    let messagesChanged = false
    const all = listMessages().map((m) => {
      if (peer && m.sender_id === peer && !m.read_at) {
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
      // Prefer 'read' over echoing 'messages' to ChatPage markChatRead — avoids
      // synchronous CustomEvent re-entry. Still bump unread listeners via 'read'.
      broadcast({ type: 'read' })
      broadcast({ type: 'messages' })
    } else if (!prevRead) {
      // first visit: publish read cursor once, without rewriting messages
      broadcast({ type: 'read' })
    }
  } catch (err) {
    console.warn('markChatRead failed:', err)
  }
}

export function unreadCount(readerId: string): number {
  try {
    const peer = peerId(readerId)
    if (!peer) return 0
    const map = readCursorMap()
    const last = map[readerId] ?? '1970-01-01T00:00:00.000Z'
    return listMessages().filter((m) => m.sender_id === peer && m.created_at > last).length
  } catch (err) {
    console.warn('unreadCount failed:', err)
    return 0
  }
}

export function listDiscussions(): Discussion[] {
  try {
    ensureForumSeed()
    const raw = readJson<unknown>(DISC_KEY, [])
    return asArray<unknown>(raw)
      .map((row, i) => normalizeDiscussion(row, i))
      .filter((d): d is Discussion => d != null)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  } catch (err) {
    console.warn('listDiscussions failed:', err)
    return []
  }
}

export function getDiscussion(id: string): Discussion | undefined {
  try {
    return listDiscussions().find((d) => d.id === id)
  } catch (err) {
    console.warn('getDiscussion failed:', err)
    return undefined
  }
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
  if (useLiveCollab() && supabase) {
    void supabase
      .from('discussions')
      .insert({
        id: d.id,
        week_number: d.week_number,
        title: d.title,
        description_md: d.description_md,
        kind: d.kind,
        author_id: d.author_id,
        is_resolved: d.is_resolved,
        created_at: d.created_at,
        updated_at: d.updated_at,
      })
      .then(({ error }) => {
        if (error) console.warn('discussions insert:', error.message)
      })
  }
  return d
}

export function setDiscussionResolved(id: string, resolved: boolean) {
  const all = listDiscussions().map((d) =>
    d.id === id ? { ...d, is_resolved: resolved, updated_at: new Date().toISOString() } : d,
  )
  writeJson(DISC_KEY, all)
  broadcast({ type: 'discussions' })
  if (useLiveCollab() && supabase) {
    void supabase
      .from('discussions')
      .update({ is_resolved: resolved, updated_at: new Date().toISOString() })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('discussions resolve:', error.message)
      })
  }
}

export function listPosts(discussionId: string): DiscussionPost[] {
  try {
    const raw = readJson<unknown>(POST_KEY, [])
    return asArray<unknown>(raw)
      .map((row, i) => normalizePost(row, i))
      .filter((p): p is DiscussionPost => p != null && p.discussion_id === discussionId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
  } catch (err) {
    console.warn('listPosts failed:', err)
    return []
  }
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
  const rawPosts = readJson<unknown>(POST_KEY, [])
  const all = asArray<unknown>(rawPosts)
    .map((row, i) => normalizePost(row, i))
    .filter((p): p is DiscussionPost => p != null)
  all.push(post)
  writeJson(POST_KEY, all)
  const discs = listDiscussions().map((d) =>
    d.id === input.discussion_id ? { ...d, updated_at: post.created_at } : d,
  )
  writeJson(DISC_KEY, discs)
  broadcast({ type: 'posts' })
  broadcast({ type: 'discussions' })
  if (useLiveCollab() && supabase) {
    void supabase
      .from('discussion_posts')
      .insert({
        id: post.id,
        discussion_id: post.discussion_id,
        author_id: post.author_id,
        body_md: post.body_md,
        parent_id: post.parent_id,
        quote_md: post.quote_md,
        attachment_name: post.attachment_name,
        created_at: post.created_at,
      })
      .then(({ error }) => {
        if (error) console.warn('discussion_posts insert:', error.message)
      })
  }
  return post
}

export function listAssignmentComments(code: string): AssignmentComment[] {
  try {
    const raw = readJson<unknown>(ACOMM_KEY, [])
    return asArray<unknown>(raw)
      .filter((c): c is AssignmentComment => {
        if (!c || typeof c !== 'object') return false
        const row = c as Partial<AssignmentComment>
        return (
          typeof row.id === 'string' &&
          typeof row.assignment_code === 'string' &&
          row.assignment_code === code &&
          typeof row.author_id === 'string' &&
          typeof row.body_md === 'string'
        )
      })
      .map((c) => ({
        ...c,
        created_at: safeIso(c.created_at),
        quote_md: typeof c.quote_md === 'string' ? c.quote_md : null,
      }))
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
  } catch (err) {
    console.warn('listAssignmentComments failed:', err)
    return []
  }
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
  const cached = readProfileCache()[userId]
  if (cached) {
    const name = canonicalDisplayName(cached)
    if (name !== 'Участник') return name
    if (cached.display_name) return cached.display_name
  }
  const demo = DEMO_USERS.find((u) => u.profile.id === userId)?.profile
  if (demo) {
    const name = canonicalDisplayName(demo)
    return isDemoAuth ? `${name} (демо)` : name
  }
  return 'Участник'
}

/** Live mode: drop fake demo forum personas from local cache. */
function purgeDemoForumSeedsIfLive() {
  if (isDemoAuth) return
  try {
    const discs = asArray<unknown>(readJson<unknown>(DISC_KEY, []))
      .map((row, i) => normalizeDiscussion(row, i))
      .filter((d): d is Discussion => d != null && !DEMO_SEED_DISCUSSION_IDS.has(d.id) && !d.id.startsWith('seed-'))
    const posts = asArray<unknown>(readJson<unknown>(POST_KEY, []))
      .map((row, i) => normalizePost(row, i))
      .filter(
        (p): p is DiscussionPost =>
          p != null &&
          !DEMO_SEED_POST_IDS.has(p.id) &&
          !p.id.startsWith('seed-') &&
          !DEMO_SEED_DISCUSSION_IDS.has(p.discussion_id),
      )
    writeJson(DISC_KEY, discs)
    writeJson(POST_KEY, posts)
    localStorage.removeItem(SEEDED_KEY)
  } catch (err) {
    console.warn('purgeDemoForumSeedsIfLive failed:', err)
  }
}

function ensureForumSeed() {
  // Live / Supabase: only real allowlisted authors — never invent demo personas.
  if (!isDemoAuth) {
    purgeDemoForumSeedsIfLive()
    return
  }

  try {
    if (localStorage.getItem(SEEDED_KEY) === '1') {
      const existing = asArray<unknown>(readJson<unknown>(DISC_KEY, []))
        .map((row, i) => normalizeDiscussion(row, i))
        .filter((d): d is Discussion => d != null)
      if (existing.length > 0) return
    }
  } catch {
    // corrupt seed flag / storage — reseed below
  }
  const a = DEMO_USERS[0].profile.id
  const b = DEMO_USERS[1].profile.id
  rememberProfile({ id: a, email: DEMO_USERS[0].profile.email, display_name: DEMO_USERS[0].profile.display_name })
  rememberProfile({ id: b, email: DEMO_USERS[1].profile.email, display_name: DEMO_USERS[1].profile.display_name })
  const now = Date.now()
  const seeds: Discussion[] = [
    {
      id: 'seed-debate-w1',
      week_number: 1,
      title: '[демо] Дебаты недели 1: маркетинг до 10 личных сделок?',
      description_md:
        'Демо-тема. Можно ли масштабировать маркетинг до того, как основатель лично закрыл 10 сделок? Аргументы с доказательствами.',
      kind: 'debate',
      author_id: a,
      is_resolved: false,
      created_at: new Date(now - 86400000 * 3).toISOString(),
      updated_at: new Date(now - 86400000 * 2).toISOString(),
    },
    {
      id: 'seed-q-qualification',
      week_number: 3,
      title: '[демо] Вопрос: какие критерии квалификации у вас сработали?',
      description_md:
        'Демо-тема. Поделитесь 2–3 критериями «идём / не идём» из практики недели 3.',
      kind: 'question',
      author_id: b,
      is_resolved: false,
      created_at: new Date(now - 86400000 * 2).toISOString(),
      updated_at: new Date(now - 86400000).toISOString(),
    },
    {
      id: 'seed-case-stakeholder',
      week_number: 2,
      title: '[демо] Кейс: чемпион говорит «да», финдиректор молчит',
      description_md:
        'Демо-тема. Разберите план на 10 дней. Кто следующий разговор и с какой конкретной просьбой?',
      kind: 'case',
      author_id: a,
      is_resolved: false,
      created_at: new Date(now - 86400000).toISOString(),
      updated_at: new Date(now - 86400000).toISOString(),
    },
    {
      id: 'seed-source-yc-sales',
      week_number: 1,
      title: '[демо] Источник: руководство YC по продажам — что вынесли?',
      description_md:
        'Демо-тема. После чтения https://www.ycombinator.com/library/Mo-the-sales-playbook-for-founders — один инсайт и один следующий шаг.',
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
      body_md:
        'Считаю, что без личных сделок маркетинг оптимизирует тщеславие. Сначала 10 разговоров с явным следующим шагом.',
      parent_id: null,
      quote_md: null,
      attachment_name: null,
      created_at: new Date(now - 86400000 * 2).toISOString(),
    },
    {
      id: 'seed-post-2',
      discussion_id: 'seed-debate-w1',
      author_id: a,
      body_md:
        'Согласна частично: контент можно, но метрика должна быть «разговор», не просмотры.',
      parent_id: 'seed-post-1',
      quote_md: 'Сначала 10 разговоров с явным следующим шагом.',
      attachment_name: null,
      created_at: new Date(now - 86400000 * 2 + 3600000).toISOString(),
    },
    {
      id: 'seed-post-3',
      discussion_id: 'seed-source-yc-sales',
      author_id: a,
      body_md:
        'Инсайт: следующий шаг сделки важнее идеального питча. Шаг: 5 касаний с явной просьбой о встрече.',
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
