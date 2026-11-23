import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  consumeRestorePath,
  pullAndMergeUiPrefs,
  rememberLastPath,
  resetUiPrefsRestoreFlag,
  subscribeUiPrefsCloud,
} from '@/lib/ui-prefs-store'

/**
 * Keeps last route / chat / forum context in sync across devices (Supabase ui_prefs)
 * and restores the last in-app path when opening the default dashboard (PWA start).
 */
export function UiPrefsSync() {
  const { profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const pulling = useRef(false)
  const userId = profile?.id

  useEffect(() => {
    if (!userId) {
      resetUiPrefsRestoreFlag()
      return
    }
    let cancelled = false

    const run = async () => {
      if (pulling.current) return
      pulling.current = true
      try {
        await pullAndMergeUiPrefs(userId)
        if (cancelled) return
        const target = consumeRestorePath(userId, location.pathname)
        if (target && target !== `${location.pathname}${location.hash || ''}`) {
          navigate(target, { replace: true })
        }
      } finally {
        pulling.current = false
      }
    }

    void run()
    const unsub = subscribeUiPrefsCloud(userId, () => {
      // Local caches already updated by pull; refresh nav via collab listeners elsewhere.
    })
    return () => {
      cancelled = true
      unsub()
    }
    // Pull + one-shot restore only when the signed-in user changes.
  }, [userId, navigate])

  useEffect(() => {
    if (!userId) return
    const path = `${location.pathname}${location.hash || ''}`
    rememberLastPath(userId, path)
  }, [userId, location.pathname, location.hash])

  return null
}
