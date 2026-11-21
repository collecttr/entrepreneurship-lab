import { Link } from 'react-router-dom'
import { buildAdaptiveExercises } from '@/ai/examiners'
import { SKILLS } from '@/data/skills'
import { useAuth } from '@/context/AuthContext'
import { getSkillProgress, listSkillEvidence } from '@/lib/progress-store'

function Bar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-mist">
      <div className="h-full rounded-full bg-teal" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

export function SkillsPage() {
  const { profile } = useAuth()
  if (!profile) return null
  const progress = getSkillProgress(profile.id)
  const weak = [...progress].sort((a, b) => a.score_ema - b.score_ema).slice(0, 3)
  const evidence = listSkillEvidence(profile.id).slice(0, 12)
  const adaptive = buildAdaptiveExercises(profile.id)

  return (
    <div className="space-y-5">
      <header className="surface rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Навыки</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Карта навыков</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          Оценки обновляются только по доказательствам: сдачи заданий и локальные тренажёры (EMA). Не
          по просмотрам страниц. Платный AI не требуется.
        </p>
      </header>

      <section className="surface rounded-3xl p-5">
        <h2 className="font-display text-xl">Слабые места</h2>
        <ul className="mt-3 space-y-3">
          {weak.map((s) => {
            const meta = SKILLS.find((x) => x.id === s.skill_id)
            return (
              <li key={s.skill_id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-ink">{meta?.title_ru ?? s.skill_id}</span>
                  <span className="text-slate">{s.score_ema}/100</span>
                </div>
                <Bar value={s.score_ema} />
              </li>
            )
          })}
        </ul>
      </section>

      <section className="surface rounded-3xl p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl text-ink">Адаптивные упражнения</h2>
            <p className="mt-1 text-sm text-slate">
              Короткие задания по слабым навыкам (по желанию / замена необязательной работы).
            </p>
          </div>
          <Link to="/ai/adaptive" className="text-sm font-semibold text-teal hover:underline">
            Открыть тренажёр →
          </Link>
        </div>
        <ul className="mt-3 space-y-2">
          {adaptive.map((a, i) => (
            <li key={`${a.skill}-${i}`} className="rounded-2xl bg-paper/80 px-3 py-2.5 text-sm">
              <p className="font-medium text-ink">
                {a.skill}
                <span className="ml-2 text-xs font-normal text-slate">
                  {a.replaces_optional_work ? 'замена необязательной работы' : 'по желанию'}
                </span>
              </p>
              <p className="mt-1 text-slate">{a.exercise}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface rounded-3xl p-5">
        <h2 className="font-display text-xl text-ink">Журнал доказательств</h2>
        <p className="mt-1 text-sm text-slate">Последние события, которые сдвинули EMA.</p>
        {evidence.length === 0 ? (
          <p className="mt-3 text-sm text-slate">Пока пусто — сдайте задание или пройдите тренажёр.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {evidence.map((e) => {
              const meta = SKILLS.find((s) => s.id === e.skill_id)
              return (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-paper/80 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-ink">{e.label}</p>
                    <p className="text-xs text-slate">
                      {meta?.title_ru ?? e.skill_id} · сигнал {e.signal} ·{' '}
                      {e.source === 'assignment' ? 'задание' : e.source === 'trainer' ? 'тренажёр' : 'аттестация'}
                    </p>
                  </div>
                  <span className="text-xs text-slate">{e.at.slice(0, 10)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {SKILLS.map((skill) => {
          const s = progress.find((p) => p.skill_id === skill.id)
          const skillEvidence = listSkillEvidence(profile.id, skill.id).slice(0, 3)
          return (
            <article key={skill.id} className="surface rounded-3xl p-5">
              <p className="text-xs uppercase tracking-wide text-teal">{skill.category}</p>
              <h3 className="mt-1 font-display text-xl text-ink">{skill.title_ru}</h3>
              <p className="mt-2 text-sm text-slate">{skill.description_ru}</p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-slate">
                  <span>EMA</span>
                  <span>
                    {s?.score_ema ?? 0} · доказательств {s?.evidence_count ?? 0}
                  </span>
                </div>
                <Bar value={s?.score_ema ?? 0} />
              </div>
              {skillEvidence.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-slate">
                  {skillEvidence.map((e) => (
                    <li key={e.id}>· {e.label}</li>
                  ))}
                </ul>
              )}
            </article>
          )
        })}
      </section>
    </div>
  )
}
