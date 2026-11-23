import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const rootEl = document.getElementById('root')
if (rootEl) {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (err) {
    console.error('React mount failed', err)
    rootEl.innerHTML =
      '<p style="margin:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:#5c5c66;background:#ebebef;padding:1.5rem;text-align:center">Не удалось запустить приложение. <a href="/login?skip_restore=1">Открыть вход</a></p>'
  }
}

/**
 * Unregister stale PWA / third-party SW after first paint.
 * Never await this before createRoot — iOS can stall on getRegistrations.
 */
function cleanupServiceWorkers() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
  const run = () => {
    void navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) {
        void reg.unregister().catch(() => {})
      }
    })
    try {
      if ('caches' in window) {
        void caches.keys().then((keys) => {
          for (const key of keys) {
            if (/workbox|precache|offline|sw/i.test(key)) {
              void caches.delete(key)
            }
          }
        })
      }
    } catch {
      /* ignore */
    }
  }
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => run(), { timeout: 3000 })
  } else {
    window.setTimeout(run, 0)
  }
}

cleanupServiceWorkers()
