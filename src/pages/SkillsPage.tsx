import { SKILLS } from '@/data/skills'
import { useAuth } from '@/context/AuthContext'
import { getSkillProgress } from '@/lib/progress-store'

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

  return (
    <div className="space-y-5">
      <header className="surface rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Навыки</p>
        <h1 className="mt-2 font-display text-3xl text-ink">Карта навыков</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          Оценки обновляются при сдаче заданий (rule-based EMA). AI-оценка — этап 6; сейчас карта полностью
          работает offline от AI.
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

      <section className="grid gap-3 md:grid-cols-2">
        {SKILLS.map((skill) => {
          const s = progress.find((p) => p.skill_id === skill.id)
          return (
            <article key={skill.id} className="surface rounded-3xl p-5">
              <p className="text-xs uppercase tracking-wide text-teal">{skill.category}</p>
              <h3 className="mt-1 font-display text-xl text-ink">{skill.title_ru}</h3>
              <p className="mt-2 text-sm text-slate">{skill.description_ru}</p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-slate">
                  <span>EMA</span>
                  <span>
                    {s?.score_ema ?? 0} · evidence {s?.evidence_count ?? 0}
                  </span>
                </div>
                <Bar value={s?.score_ema ?? 0} />
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
