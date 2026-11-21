import { Link } from 'react-router-dom'
import { TRAINERS, examinerBanner, isSpendLockOn } from '@/lib/ai-config'
import { getUnlockedWeek } from '@/lib/progress-store'
import { getWeek } from '@/data/curriculum'

export function AiPage() {
  const banner = examinerBanner()
  const week = getWeek(getUnlockedWeek())

  return (
    <div className="space-y-5">
      <header className="surface rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Бизнес-симуляторы</p>
        <h1 className="mt-2 font-display text-3xl text-ink">AI-тренеры / локальные экзаменаторы</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          Spend lock {isSpendLockOn() ? 'включён' : 'выключен'} по умолчанию. Платные API не вызываются.
          Работает rule-based «локальный экзаменатор» на данных недели.
        </p>
        <p
          className={`mt-3 rounded-xl px-3 py-2 text-xs ${
            banner.tone === 'warn' ? 'bg-amber-soft/60 text-ink' : 'bg-teal-soft/50 text-ink'
          }`}
        >
          {banner.text}
        </p>
        {week && (
          <p className="mt-3 text-sm text-slate">
            Контекст: неделя {week.week_number} — <strong className="text-ink">{week.title_ru}</strong>
          </p>
        )}
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {TRAINERS.map((t) => (
          <Link
            key={t.slug}
            to={`/ai/${t.slug}`}
            className="surface block rounded-3xl p-5 transition hover:border-teal/30"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-teal">локальный экзаменатор</p>
            <h2 className="mt-1 font-display text-xl text-ink">{t.title_ru}</h2>
            <p className="mt-2 text-sm text-slate">{t.blurb_ru}</p>
            <p className="mt-3 text-xs text-slate">навыки: {t.skills.join(', ')}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
