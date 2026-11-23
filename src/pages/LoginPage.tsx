import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { DemoBanner } from '@/components/DemoBanner'
import { useAuth } from '@/context/AuthContext'
import { DEMO_USERS } from '@/lib/demo-data'
import { isDemoAuth } from '@/lib/supabase'

export function LoginPage() {
  const { profile, loading, signIn, isDemo, authError, hasSession, retryProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [email, setEmail] = useState(isDemoAuth ? DEMO_USERS[0].email : '')
  const [password, setPassword] = useState(isDemoAuth ? DEMO_USERS[0].password : '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && profile) {
    return <Navigate to={from} replace />
  }

  // Session restored but profile stuck — stay here with retry, do not look "logged out"
  if (!loading && hasSession && !profile) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-slate" role="alert">
          {authError ?? 'Сессия найдена, профиль ещё загружается.'}
        </p>
        <button
          type="button"
          onClick={() => void retryProfile()}
          className="rounded-xl bg-teal px-4 py-3 text-[15px] font-semibold text-on-accent hover:bg-teal-deep"
        >
          Повторить загрузку профиля
        </button>
      </div>
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await signIn(email, password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {isDemo && <DemoBanner />}
      <div className="mx-auto flex min-h-[calc(100dvh-0px)] max-w-6xl flex-col justify-center gap-8 px-4 py-8 sm:gap-10 sm:py-10 lg:flex-row lg:items-center lg:gap-16">
        <section className="max-w-xl">
          <p className="mb-3 text-sm font-medium text-teal">Закрытая академия</p>
          <h1 className="font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl">
            Лаборатория предпринимательства
          </h1>
          <p className="mt-4 max-w-md text-[16px] leading-relaxed text-slate sm:mt-5 sm:text-[17px]">
            26 недель практики: продажи, переговоры, презентации и предпринимательское мышление.
            Вход только для участников из списка допуска — публичной регистрации нет.
          </p>
        </section>

        <section className="w-full max-w-md surface rounded-2xl p-5 sm:rounded-3xl sm:p-7 md:p-9">
          <h2 className="font-display text-2xl tracking-tight text-ink">Вход</h2>
          <p className="mt-1.5 text-[15px] text-slate">Email и пароль, выданные администратором.</p>

          {loading ? (
            <p className="mt-3 rounded-xl bg-mist/80 px-3 py-2 text-sm text-slate" role="status">
              Восстанавливаем сессию… форма уже доступна.
            </p>
          ) : null}
          {authError && !hasSession ? (
            <p className="mt-3 rounded-xl bg-mist px-3 py-2 text-sm text-ink" role="status">
              {authError}
            </p>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
            <label className="block text-sm">
              <span className="mb-1.5 block text-slate">Email</span>
              <input
                type="email"
                autoComplete="username"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field min-h-11 w-full rounded-xl border border-ink/10 px-3.5 py-3 text-base outline-none focus:border-ink/25 focus:ring-2 focus:ring-ink/25 md:text-[15px]"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-slate">Пароль</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field min-h-11 w-full rounded-xl border border-ink/10 px-3.5 py-3 text-base outline-none focus:border-ink/25 focus:ring-2 focus:ring-ink/25 md:text-[15px]"
              />
            </label>

            {error && (
              <p className="rounded-xl bg-mist px-3 py-2 text-sm text-ink" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="min-h-11 w-full rounded-xl bg-teal px-4 py-3.5 text-[15px] font-semibold text-on-accent hover:bg-teal-deep active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? 'Входим…' : 'Войти'}
            </button>
          </form>

          {isDemo && (
            <div className="mt-5 rounded-2xl border border-ink/10 bg-mist/60 p-3 text-xs leading-relaxed text-ink-soft">
              <p className="font-semibold text-ink">Демо-аккаунты:</p>
              <ul className="mt-2 space-y-1">
                {DEMO_USERS.map((u) => (
                  <li key={u.email}>
                    <span className="font-medium text-ink">{u.profile.display_name}</span>
                    {' · '}
                    <code>{u.email}</code> / <code>{u.password}</code>
                    {u.profile.role === 'admin' ? ' · админ + слот B' : ' · слот A'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
