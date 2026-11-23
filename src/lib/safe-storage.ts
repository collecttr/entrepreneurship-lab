/**
 * Safari ITP / private mode / corrupt JSON can throw or hang auth restore.
 * Never let storage access take down the module graph before React paints.
 */

export const AUTH_STORAGE_KEY = 'elab-auth'
export const SKIP_RESTORE_KEY = 'elab-skip-auth-restore'

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function rawLocalStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    const ls = window.localStorage
    const probe = '__elab_ls_probe__'
    ls.setItem(probe, '1')
    ls.removeItem(probe)
    return ls
  } catch {
    return null
  }
}

/** Clear corrupt or unreadable auth blob so GoTrue does not choke on parse. */
export function sanitizeAuthStorage(): void {
  const ls = rawLocalStorage()
  if (!ls) return
  try {
    const raw = ls.getItem(AUTH_STORAGE_KEY)
    if (raw == null || raw === '') return
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      ls.removeItem(AUTH_STORAGE_KEY)
    }
  } catch {
    try {
      ls.removeItem(AUTH_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }
}

export function shouldSkipAuthRestore(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    if (params.get('skip_restore') === '1' || params.get('skip_auth') === '1') {
      try {
        sessionStorage.setItem(SKIP_RESTORE_KEY, '1')
      } catch {
        /* ignore */
      }
      return true
    }
    return sessionStorage.getItem(SKIP_RESTORE_KEY) === '1'
  } catch {
    return false
  }
}

export function clearSkipAuthRestore(): void {
  try {
    sessionStorage.removeItem(SKIP_RESTORE_KEY)
  } catch {
    /* ignore */
  }
}

/** Memory fallback when localStorage is blocked (Safari private / ITP edge). */
function memoryStorage(): StorageLike {
  const map = new Map<string, string>()
  return {
    getItem: (key) => (map.has(key) ? map.get(key)! : null),
    setItem: (key, value) => {
      map.set(key, String(value))
    },
    removeItem: (key) => {
      map.delete(key)
    },
  }
}

/**
 * Supabase-compatible storage: never throws; falls back to memory if LS blocked.
 */
export function createSafeAuthStorage(): StorageLike {
  sanitizeAuthStorage()
  const ls = rawLocalStorage()
  const mem = memoryStorage()
  const backend = ls ?? mem

  return {
    getItem(key) {
      try {
        return backend.getItem(key)
      } catch {
        return null
      }
    },
    setItem(key, value) {
      try {
        backend.setItem(key, value)
      } catch {
        try {
          mem.setItem(key, value)
        } catch {
          /* ignore */
        }
      }
    },
    removeItem(key) {
      try {
        backend.removeItem(key)
      } catch {
        /* ignore */
      }
      try {
        mem.removeItem(key)
      } catch {
        /* ignore */
      }
    },
  }
}
