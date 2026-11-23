import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

/** Match AuthProvider fail-open — never trap PWA /dashboard on a spinner. */
const FAIL_OPEN_MS = 2000

export function ProtectedRoute() {
  const { profile, loading, hasSession, authError, retryProfile } = useAuth()
  const location = useLocation()
  const [failOpen, setFailOpen] = useState(false)

  useEffect(() => {
    if (!loading) {
      setFailOpen(false)
      return
    }
    const t = window.setTimeout(() => setFailOpen(true), FAIL_OPEN_MS)
    return () => window.clearTimeout(t)
  }, [loading])

  if (loading && failOpen && !hasSession) {
    return (
      <Navigate
        to={`/login?skip_restore=1&from=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-slate">Загрузка сессии…</p>
        <a
          href={`/login?skip_restore=1`}
          className="rounded-xl bg-teal px-4 py-3 text-[15px] font-semibold text-on-accent hover:bg-teal-deep"
        >
          Перейти ко входу
        </a>
      </div>
    )
  }

  // Session valid but profile still loading/failed — do not bounce to login
  if (!profile && hasSession) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-slate" role="alert">
          {authError ??
            'Сессия есть, но профиль ещё не загрузился. Подождите или нажмите «Повторить».'}
        </p>
        <button
          type="button"
          onClick={() => void retryProfile()}
          className="rounded-xl bg-teal px-4 py-3 text-[15px] font-semibold text-on-accent hover:bg-teal-deep"
        >
          Повторить
        </button>
        <a
          href="/login?skip_restore=1"
          className="text-sm font-medium text-teal hover:underline"
        >
          К форме входа
        </a>
      </div>
    )
  }

  if (!profile) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
