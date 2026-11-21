import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute() {
  const { profile, loading, hasSession, authError, retryProfile } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate">
        Загрузка сессии…
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
      </div>
    )
  }

  if (!profile) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
