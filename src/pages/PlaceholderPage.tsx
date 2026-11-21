import { Link } from 'react-router-dom'

interface Props {
  title: string
  stage: string
  description: string
}

export function PlaceholderPage({ title, stage, description }: Props) {
  return (
    <div className="surface rounded-3xl p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">{stage}</p>
      <h1 className="mt-2 font-display text-3xl text-ink">{title}</h1>
      <p className="mt-3 max-w-2xl text-slate">{description}</p>
      <p className="mt-6 text-sm text-slate">
        Это заглушка этапа 2. Полная функциональность появится позже по плану архитектуры.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-teal-deep"
      >
        Вернуться на дашборд
      </Link>
    </div>
  )
}
