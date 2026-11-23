import { Link } from 'react-router-dom'
import { TRAINERS, examinerBanner, isSpendLockOn } from '@/lib/ai-config'
import { getUnlockedWeek } from '@/lib/progress-store'
import { getWeek } from '@/data/curriculum'

const SKILL_LABEL: Record<string, string> = {
  sales: 'продажи',
  psychology: 'психология покупателя',
  negotiation: 'переговоры',
  presentation: 'презентации',
  speaking: 'выступления',
  entrepreneurial: 'предпринимательское мышление',
  ops: 'операции',
}

export function AiPage() {
  const banner = examinerBanner()
  const week = getWeek(getUnlockedWeek())

  return (
    <div className="space-y-5">
      <header className="surface rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Бизнес-симуляторы</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Тренажёры и разбор практики</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          {isSpendLockOn()
            ? 'Free tier: локальный разбор на устройстве сверяет мысль с доверенными источниками недели. Облачный ChatGPT без ключа не обещаем.'
            : 'Локальная сверка с источниками всегда есть; облачный LLM — только при ключе. Контекст — текущая неделя.'}
        </p>
        <p className="mt-3 text-xs text-slate">{banner.text}</p>
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
            className="surface block rounded-3xl p-5 transition hover:border-ink/20"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-teal">
              {t.slug === 'sales' || t.slug === 'negotiation'
                ? 'диалог · локальная проверка'
                : 'локальная проверка'}
            </p>
            <h2 className="mt-1 font-display text-xl text-ink">{t.title_ru}</h2>
            <p className="mt-2 text-sm text-slate">{t.blurb_ru}</p>
            <p className="mt-3 text-xs text-slate">
              навыки: {t.skills.map((s) => SKILL_LABEL[s] ?? s).join(', ')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
