/**
 * Cross-device UI context: last chat peer, forum topic, program week/section, routes.
 * LocalStorage remains the fast cache; Supabase `ui_prefs` syncs phone ↔ PC (own RLS).
 */
import {
  getForumContext,
  getPeerProfile,
  setChatPeer,
  setForumListFilters,
  setLastForumDiscussion,
  type ForumKind,
  type ForumListContext,
  type PeerContact,
} from '@/lib/collab-store'
import { isDemoAuth, supabase, supabaseConfigured } from '@/lib/supabase'

const LOCAL_KEY_PREFIX = 'elab_ui_prefs_v1:'
const UI_PREFS_EVENT = 'elab-ui-prefs'
const PUSH_DEBOUNCE_MS = 450

export type UiPrefsPayload = {
  version: 1
  chatPeer: PeerContact | null
  forum: ForumListContext
  lastPath: string | null
  lastWeekNumber: number | null
  lastWeekSection: string | null
  clientUpdatedAt: string
}

type LocalRoutePrefs = {
  lastPath: string | null
  lastWeekNumber: number | null
  lastWeekSection: string | null
  clientUpdatedAt: string
}

const DEFAULT_FORUM: ForumListContext = { kind: 'all', q: '', lastDiscussionId: null }

let suppressCloudPush = false
let pushTimer: ReturnType<typeof setTimeout> | null = null
let lastPushedAt = ''
let restoreDoneForUser: string | null = null

function localKey(userId: string) {
  return `${LOCAL_KEY_PREFIX}${userId}`
}

function readLocalRoute(userId: string): LocalRoutePrefs {
  try {
    const raw = localStorage.getItem(localKey(userId))
    if (!raw) {
      return {
        lastPath: null,
        lastWeekNumber: null,
        lastWeekSection: null,
        clientUpdatedAt: '1970-01-01T00:00:00.000Z',
      }
    }
    const row = JSON.parse(raw) as Partial<LocalRoutePrefs>
    return {
      lastPath: typeof row.lastPath === 'string' && row.lastPath.startsWith('/') ? row.lastPath : null,
      lastWeekNumber:
        typeof row.lastWeekNumber === 'number' && Number.isFinite(row.lastWeekNumber)
          ? row.lastWeekNumber
          : null,
      lastWeekSection:
        typeof row.lastWeekSection === 'string' && row.lastWeekSection ? row.lastWeekSection : null,
      clientUpdatedAt:
        typeof row.clientUpdatedAt === 'string' && row.clientUpdatedAt
          ? row.clientUpdatedAt
          : '1970-01-01T00:00:00.000Z',
    }
  } catch {
    return {
      lastPath: null,
      lastWeekNumber: null,
      lastWeekSection: null,
      clientUpdatedAt: '1970-01-01T00:00:00.000Z',
    }
  }
}

function writeLocalRoute(userId: string, patch: Partial<LocalRoutePrefs>) {
  const prev = readLocalRoute(userId)
  const next: LocalRoutePrefs = {
    lastPath: patch.lastPath !== undefined ? patch.lastPath : prev.lastPath,
    lastWeekNumber: patch.lastWeekNumber !== undefined ? patch.lastWeekNumber : prev.lastWeekNumber,
    lastWeekSection:
      patch.lastWeekSection !== undefined ? patch.lastWeekSection : prev.lastWeekSection,
    clientUpdatedAt: new Date().toISOString(),
  }
  try {
    localStorage.setItem(localKey(userId), JSON.stringify(next))
  } catch (err) {
    console.warn('ui prefs local write failed:', err)
  }
  return next
}

function normalizePeer(raw: unknown): PeerContact | null {
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

function normalizeForum(raw: unknown): ForumListContext {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_FORUM }
  const row = raw as Partial<ForumListContext>
  const kind: ForumKind | 'all' =
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
    lastDiscussionId:
      typeof row.lastDiscussionId === 'string' && row.lastDiscussionId
        ? row.lastDiscussionId
        : null,
  }
}

function normalizePayload(raw: unknown): UiPrefsPayload | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Partial<UiPrefsPayload>
  const routeBits =
    typeof row.lastPath === 'string' ||
    typeof row.lastWeekNumber === 'number' ||
    typeof row.lastWeekSection === 'string' ||
    row.chatPeer != null ||
    row.forum != null
  if (!routeBits && row.version !== 1) return null
  return {
    version: 1,
    chatPeer: normalizePeer(row.chatPeer),
    forum: normalizeForum(row.forum),
    lastPath: typeof row.lastPath === 'string' && row.lastPath.startsWith('/') ? row.lastPath : null,
    lastWeekNumber:
      typeof row.lastWeekNumber === 'number' && Number.isFinite(row.lastWeekNumber)
        ? row.lastWeekNumber
        : null,
    lastWeekSection:
      typeof row.lastWeekSection === 'string' && row.lastWeekSection ? row.lastWeekSection : null,
    clientUpdatedAt:
      typeof row.clientUpdatedAt === 'string' && row.clientUpdatedAt
        ? row.clientUpdatedAt
        : '1970-01-01T00:00:00.000Z',
  }
}

/** Safe in-app paths only (no login / external). */
export function isRestorablePath(path: string | null | undefined): path is string {
  if (!path || !path.startsWith('/')) return false
  if (path.startsWith('/login')) return false
  if (path.includes('://')) return false
  return true
}

export function collectLocalUiPrefs(userId: string): UiPrefsPayload {
  const route = readLocalRoute(userId)
  return {
    version: 1,
    chatPeer: getPeerProfile(userId),
    forum: getForumContext(userId),
    lastPath: route.lastPath,
    lastWeekNumber: route.lastWeekNumber,
    lastWeekSection: route.lastWeekSection,
    clientUpdatedAt: route.clientUpdatedAt,
  }
}

export function getLastPath(userId: string): string | null {
  const path = readLocalRoute(userId).lastPath
  return isRestorablePath(path) ? path : null
}

export function getLastWeekSection(userId: string): {
  weekNumber: number | null
  section: string | null
} {
  const row = readLocalRoute(userId)
  return { weekNumber: row.lastWeekNumber, section: row.lastWeekSection }
}

function notifyLocal() {
  try {
    window.dispatchEvent(new Event(UI_PREFS_EVENT))
  } catch {
    // ignore
  }
}

/** Apply cloud/local payload into device caches without echoing back to cloud. */
export function applyUiPrefsLocally(userId: string, prefs: UiPrefsPayload) {
  suppressCloudPush = true
  try {
    if (prefs.chatPeer && prefs.chatPeer.id !== userId) {
      setChatPeer(prefs.chatPeer, userId)
    } else if (prefs.chatPeer === null) {
      // Keep existing peer if remote cleared — only overwrite when remote has a peer
    }
    setForumListFilters(userId, { kind: prefs.forum.kind, q: prefs.forum.q })
    setLastForumDiscussion(userId, prefs.forum.lastDiscussionId)
    writeLocalRoute(userId, {
      lastPath: prefs.lastPath,
      lastWeekNumber: prefs.lastWeekNumber,
      lastWeekSection: prefs.lastWeekSection,
      clientUpdatedAt: prefs.clientUpdatedAt,
    })
    notifyLocal()
  } finally {
    // Allow next tick so collab setters finish before push re-enables
    window.setTimeout(() => {
      suppressCloudPush = false
    }, 0)
  }
}

function mergeNewer(local: UiPrefsPayload, remote: UiPrefsPayload): UiPrefsPayload {
  const localTs = Date.parse(local.clientUpdatedAt) || 0
  const remoteTs = Date.parse(remote.clientUpdatedAt) || 0
  if (remoteTs > localTs) return remote
  return local
}

async function pushToCloud(userId: string, prefs: UiPrefsPayload) {
  if (isDemoAuth || !supabaseConfigured || !supabase) return
  if (prefs.clientUpdatedAt && prefs.clientUpdatedAt === lastPushedAt) return
  try {
    const { error } = await supabase.from('ui_prefs').upsert(
      {
        user_id: userId,
        prefs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    if (error) {
      console.warn('ui_prefs upsert:', error.message)
      return
    }
    lastPushedAt = prefs.clientUpdatedAt
  } catch (err) {
    console.warn('ui_prefs upsert failed:', err)
  }
}

/** Debounced cloud upsert of current local prefs (no-op in demo / without Supabase). */
export function scheduleUiPrefsCloudSync(userId: string) {
  if (suppressCloudPush) return
  if (isDemoAuth || !supabaseConfigured || !supabase) return
  if (pushTimer) window.clearTimeout(pushTimer)
  pushTimer = window.setTimeout(() => {
    pushTimer = null
    const prefs = collectLocalUiPrefs(userId)
    void pushToCloud(userId, prefs)
  }, PUSH_DEBOUNCE_MS)
}

/** Touch last path / week section and schedule cloud sync. */
export function rememberLastPath(userId: string, path: string) {
  if (!isRestorablePath(path)) return
  const weekMatch = path.match(/^\/program\/weeks\/(\d+)/)
  const weekNumber = weekMatch ? Number(weekMatch[1]) : null
  writeLocalRoute(userId, {
    lastPath: path,
    ...(weekNumber != null && Number.isFinite(weekNumber) ? { lastWeekNumber: weekNumber } : {}),
  })
  scheduleUiPrefsCloudSync(userId)
  notifyLocal()
}

export function rememberWeekSection(userId: string, weekNumber: number, section: string | null) {
  if (!Number.isFinite(weekNumber) || weekNumber < 1) return
  const path = section
    ? `/program/weeks/${weekNumber}#${section}`
    : `/program/weeks/${weekNumber}`
  writeLocalRoute(userId, {
    lastPath: path,
    lastWeekNumber: weekNumber,
    lastWeekSection: section,
  })
  scheduleUiPrefsCloudSync(userId)
  notifyLocal()
}

/** Call after chat/forum local writes so cloud mirrors them. */
export function noteCollabUiChange(userId: string) {
  writeLocalRoute(userId, {}) // bump clientUpdatedAt
  scheduleUiPrefsCloudSync(userId)
}

/**
 * Pull remote prefs, LWW-merge with local, apply winner.
 * Safe if table/migration missing.
 */
export async function pullAndMergeUiPrefs(userId: string): Promise<UiPrefsPayload> {
  const local = collectLocalUiPrefs(userId)
  if (isDemoAuth || !supabaseConfigured || !supabase) return local

  try {
    const { data, error } = await supabase
      .from('ui_prefs')
      .select('prefs, updated_at')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) {
      console.warn('ui_prefs fetch:', error.message)
      return local
    }
    const remote = normalizePayload(data?.prefs)
    if (!remote) {
      // Seed cloud from this device
      void pushToCloud(userId, local)
      return local
    }
    // Prefer remote clientUpdatedAt; fall back to row updated_at
    if (!remote.clientUpdatedAt || remote.clientUpdatedAt === '1970-01-01T00:00:00.000Z') {
      if (typeof data?.updated_at === 'string') remote.clientUpdatedAt = data.updated_at
    }
    const winner = mergeNewer(local, remote)
    if (winner === remote) {
      applyUiPrefsLocally(userId, winner)
    } else {
      void pushToCloud(userId, winner)
    }
    return winner
  } catch (err) {
    console.warn('ui_prefs pull failed:', err)
    return local
  }
}

/** Once per signed-in session: restore last path when opening default dashboard. */
export function consumeRestorePath(userId: string, currentPath: string): string | null {
  if (restoreDoneForUser === userId) return null
  restoreDoneForUser = userId
  if (currentPath !== '/dashboard' && currentPath !== '/') return null
  const last = getLastPath(userId)
  if (!last || last === '/dashboard' || last === '/') return null
  return last
}

export function resetUiPrefsRestoreFlag() {
  restoreDoneForUser = null
}

export function subscribeUiPrefsLocal(onChange: () => void): () => void {
  const handler = () => onChange()
  window.addEventListener(UI_PREFS_EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(UI_PREFS_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}

let realtimeRefCount = 0
let realtimeCleanup: (() => void) | null = null
let realtimeUserId: string | null = null

/** Realtime + login pull for own ui_prefs row. */
export function subscribeUiPrefsCloud(userId: string, onRemote: () => void): () => void {
  const localUnsub = subscribeUiPrefsLocal(onRemote)

  if (isDemoAuth || !supabaseConfigured || !supabase) {
    return localUnsub
  }

  const live = supabase
  realtimeRefCount += 1
  realtimeUserId = userId
  if (realtimeRefCount === 1 || !realtimeCleanup) {
    try {
      const channel = live
        .channel(`elab-ui-prefs-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ui_prefs',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            void pullAndMergeUiPrefs(userId).then(() => onRemote())
          },
        )
        .subscribe((status, err) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('realtime ui_prefs:', err?.message ?? status)
          }
        })
      realtimeCleanup = () => {
        try {
          void live.removeChannel(channel)
        } catch (removeErr) {
          console.warn('realtime ui_prefs remove failed:', removeErr)
        }
        realtimeCleanup = null
      }
    } catch (err) {
      console.warn('realtime ui_prefs subscribe failed:', err)
      realtimeCleanup = null
    }
  }

  return () => {
    localUnsub()
    if (!isDemoAuth && supabaseConfigured && supabase) {
      realtimeRefCount = Math.max(0, realtimeRefCount - 1)
      if (realtimeRefCount === 0 || realtimeUserId !== userId) {
        realtimeCleanup?.()
        if (realtimeUserId === userId) realtimeUserId = null
      }
    }
  }
}
