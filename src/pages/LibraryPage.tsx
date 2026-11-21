import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LIBRARY_SOURCES, type SourceProvider } from '@/data/sources'
import { WEEKS } from '@/data/curriculum'
import {
  INTERVIEWS,
  INTERVIEW_ROLE_LABELS_RU,
  type InterviewRoleCategory,
} from '@/data/interviews'
import {
  INTERVIEW_EXTRACT_RULE_RU,
  SOURCE_EXTRACT_RULE_RU,
} from '@/data/research-method'
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

const ROLE_FILTERS: Array<InterviewRoleCategory | 'Все'> = [
  'Все',
  'founder',
  'sme_owner',
  'enterprise_leader',
  'sales_leader',
  'b2b_seller',
  'b2c_seller',
  'marketer',
  'investor',
  'buyer',
  'customer',
  'failed_founder',
  'crisis_leader',
]

type Tab = 'sources' | 'interviews'

export function LibraryPage() {
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'interviews' ? 'interviews' : 'sources'
  const [provider, setProvider] = useState<(typeof PROVIDERS)[number]>('Все')
  const [role, setRole] = useState<(typeof ROLE_FILTERS)[number]>('Все')
  const [q, setQ] = useState('')
  const [freeOnly, setFreeOnly] = useState(true)

  const setTab = (next: Tab) => {
    const p = new URLSearchParams(params)
    if (next === 'interviews') p.set('tab', 'interviews')
    else p.delete('tab')
    setParams(p, { replace: true })
  }

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

  const interviewItems = INTERVIEWS.filter((i) => {
    if (role !== 'Все' && i.role_category !== role) return false
    if (q.trim()) {
      const hay =
        `${i.title_ru} ${i.title_original} ${i.person} ${i.company} ${i.topics.join(' ')} ${i.channel}`.toLowerCase()
      if (!hay.includes(q.trim().toLowerCase())) return false
    }
    return true
  })

  return (
    <div className="space-y-5">
      <header className="surface rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Библиотека</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Доказательная база, не биографии</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          Источники и интервью — чтобы отвечать на исследовательские вопросы (продажи, маркетинг,
          стратегия, управление). Не библиотека «историй брендов» для ознакомительного чтения.
          Только реальные открытые ссылки.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-ink">{LIBRARY_STUDY_INTRO_RU}</p>
        <p className="mt-2 max-w-2xl text-sm text-ink">
          {tab === 'interviews' ? INTERVIEW_EXTRACT_RULE_RU : SOURCE_EXTRACT_RULE_RU}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab('sources')}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            tab === 'sources' ? 'bg-teal text-on-accent' : 'surface text-ink'
          }`}
        >
          Источники ({LIBRARY_SOURCES.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('interviews')}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            tab === 'interviews' ? 'bg-teal text-on-accent' : 'surface text-ink'
          }`}
        >
          Интервью и разговоры с практиками ({INTERVIEWS.length})
        </button>
      </div>

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
        {tab === 'sources' ? (
          <>
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
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
              />
              Только бесплатные
            </label>
          </>
        ) : (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as (typeof ROLE_FILTERS)[number])}
            className="rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-sm"
          >
            {ROLE_FILTERS.map((r) => (
              <option key={r} value={r}>
                {r === 'Все' ? 'Все роли' : INTERVIEW_ROLE_LABELS_RU[r]}
              </option>
            ))}
          </select>
        )}
      </div>

      {tab === 'sources' ? (
        <ul className="space-y-3">
          {items.map((s) => {
            const weeks = weeksBySource.get(s.id) ?? []
            return (
              <li key={s.id} className="surface rounded-3xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal">
                      {s.provider}
                    </p>
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
              <p className="mt-3 text-sm text-ink">
                <strong>Зачем читать:</strong> {s.why_ru}
              </p>
              <p className="mt-1 text-sm text-ink">
                <strong>Что извлечь:</strong> {s.understand_ru}
              </p>
              <p className="mt-1 text-sm text-slate">{s.license_note}</p>
              {s.questions_ru.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-sm text-slate">
                  {s.questions_ru.map((aq) => (
                    <li key={aq}>{aq}</li>
                  ))}
                </ul>
              )}
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
                      <Link
                        key={w}
                        to={`/program/weeks/${w}`}
                        className="mr-2 text-teal hover:underline"
                      >
                        {w}
                      </Link>
                    ))}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <ul className="space-y-3">
          {interviewItems.map((i) => (
            <li key={i.id} className="surface rounded-3xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal">
                    {INTERVIEW_ROLE_LABELS_RU[i.role_category]} · {i.channel}
                  </p>
                  <h2 className="font-display text-xl text-ink">{i.title_ru}</h2>
                  <p className="text-xs text-slate">{i.title_original}</p>
                </div>
                <div className="text-right text-xs text-slate">
                  <p>{i.duration_minutes != null ? `~${i.duration_minutes} мин` : 'длительность н/д'}</p>
                  <p>{i.language}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink">
                <strong>{i.person}</strong> — {i.role_ru}, {i.company}
              </p>
              <p className="mt-1 text-sm text-slate">Темы: {i.topics.join(', ')}</p>
              <p className="mt-2 text-sm text-ink">
                <strong>Зачем:</strong> {i.why_read_ru}
              </p>
              <p className="mt-1 text-sm text-ink">
                <strong>Что извлечь:</strong> {i.extract_ru}
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate">
                {i.analysis_questions_ru.map((aq) => (
                  <li key={aq}>{aq}</li>
                ))}
              </ul>
              {i.timestamps.length > 0 && (
                <p className="mt-2 text-xs text-slate">
                  Таймкоды: {i.timestamps.map((t) => `${t.at} — ${t.label_ru}`).join(' · ')}
                </p>
              )}
              <a
                href={i.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-teal hover:underline"
              >
                Открыть оригинал →
              </a>
              {i.week_links.length > 0 && (
                <p className="mt-3 text-xs text-slate">
                  Связь с неделями:{' '}
                  {i.week_links.map((w) => (
                    <Link
                      key={w}
                      to={`/program/weeks/${w}`}
                      className="mr-2 text-teal hover:underline"
                    >
                      {w}
                    </Link>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
