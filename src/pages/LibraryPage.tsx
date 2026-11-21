import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LIBRARY_SOURCES, type SourceProvider } from '@/data/sources'
import { WEEKS } from '@/data/curriculum'
import { LIBRARY_STUDY_INTRO_RU, STUDY_GUIDE_STEPS_RU, STUDY_GUIDE_TITLE_RU } from '@/data/study-guide'

const PROVIDERS: Array<SourceProvider | 'Все'> = [
  'Все',
  'MIT OCW',
  'YC Library',
  'HubSpot Academy',
  'OpenStax',
  'Harvard PON',
  'Strategyzer',
  'SBA',
]

export function LibraryPage() {
  const [provider, setProvider] = useState<(typeof PROVIDERS)[number]>('Все')
  const [q, setQ] = useState('')
  const [freeOnly, setFreeOnly] = useState(true)

  const weeksBySource = useMemo(() => {
    const map = new Map<string, number[]>()
    for (const w of WEEKS) {
      for (const link of w.sources) {
        const arr = map.get(link.source_id) ?? []
        arr.push(w.week_number)
        map.set(link.source_id, arr)
      }
    }
    return map
  }, [])

  const items = LIBRARY_SOURCES.filter((s) => {
    if (freeOnly && !s.is_free) return false
    if (provider !== 'Все' && s.provider !== provider) return false
    if (q.trim()) {
      const hay = `${s.title_ru} ${s.title_original} ${s.provider} ${s.tags.join(' ')}`.toLowerCase()
      if (!hay.includes(q.trim().toLowerCase())) return false
    }
    return true
  })

  return (
    <div className="space-y-5">
      <header className="surface rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Библиотека</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Проверенные бесплатные источники</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          Только официальные бесплатные материалы (MIT OCW, Y Combinator, HubSpot Academy, OpenStax,
          Harvard PON, Strategyzer, SBA). Платные книги — по желанию, без файлов и пиратских ссылок.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-ink">{LIBRARY_STUDY_INTRO_RU}</p>
      </header>

      <section className="surface rounded-3xl p-5 md:p-6">
        <h2 className="font-display text-xl text-ink">{STUDY_GUIDE_TITLE_RU}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink">
          {STUDY_GUIDE_STEPS_RU.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <div className="surface flex flex-col gap-3 rounded-3xl p-4 md:flex-row md:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск…"
          className="w-full rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-sm outline-none ring-ink focus:ring-2 md:max-w-xs"
        />
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as (typeof PROVIDERS)[number])}
          className="rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-sm"
        >
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate">
          <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} />
          Только бесплатные
        </label>
      </div>

      <ul className="space-y-3">
        {items.map((s) => {
          const weeks = weeksBySource.get(s.id) ?? []
          return (
            <li key={s.id} className="surface rounded-3xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal">{s.provider}</p>
                  <h2 className="font-display text-xl text-ink">{s.title_ru}</h2>
                  <p className="text-xs text-slate">{s.title_original}</p>
                </div>
                <div className="text-right text-xs text-slate">
                  <p>
                    {s.is_optional_paid
                      ? 'платный (необязательный)'
                      : `${s.estimated_study_minutes} мин`}
                  </p>
                  <p>{s.language}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink">{s.why_ru}</p>
              <p className="mt-1 text-sm text-slate">{s.license_note}</p>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-teal hover:underline"
              >
                Открыть источник →
              </a>
              {weeks.length > 0 && (
                <p className="mt-3 text-xs text-slate">
                  Недели:{' '}
                  {weeks.map((w) => (
                    <Link key={w} to={`/program/weeks/${w}`} className="mr-2 text-teal hover:underline">
                      {w}
                    </Link>
                  ))}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
