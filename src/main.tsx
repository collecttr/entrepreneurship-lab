import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

/** Drop stale PWA / third-party SW so home-screen icon cannot serve a broken shell. */
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
