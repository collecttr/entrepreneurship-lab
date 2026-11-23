import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute() {
  const { profile, loading, hasSession, authError, retryProfile } = useAuth()
  const location = useLocation()
  const [stuckHint, setStuckHint] = useState(false)

  useEffect(() => {
    if (!loading) {
      setStuckHint(false)
      return
    }
    const t = window.setTimeout(() => setStuckHint(true), 5000)
    return () => window.clearTimeout(t)
  }, [loading])

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-slate">Загрузка сессии…</p>
        {stuckHint ? (
          <>
            <p className="text-sm text-slate" role="status">
              Долго нет ответа от сервера входа. Можно открыть форму входа — сессия подтянется позже.
            </p>
            <a
              href="/login"
              className="rounded-xl bg-teal px-4 py-3 text-[15px] font-semibold text-on-accent hover:bg-teal-deep"
            >
              Перейти ко входу
            </a>
          </>
        ) : null}
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
        <a href="/login" className="text-sm font-medium text-teal hover:underline">
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
