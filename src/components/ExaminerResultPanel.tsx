import type { ExaminerResult } from '@/ai/examiners'

function modeLabel(mode: ExaminerResult['mode']): string {
  if (mode === 'local_examiner') return 'локальная проверка'
  return mode
}

/** Итог экзаменатора: fade/slide + staggered checklist (Apple monochrome). */
export function ExaminerResultPanel({
  result,
  endCaption,
}: {
  result: ExaminerResult
  endCaption?: string
}) {
  return (
    <section className="result-panel surface space-y-4 rounded-3xl p-5" aria-live="polite">
      <div className="result-item flex flex-wrap items-center justify-between gap-2" style={{ ['--i' as string]: 0 }}>
        <h2 className="font-display text-xl text-ink">{result.title}</h2>
        <span className="rounded-full bg-teal-soft px-3 py-1 text-sm font-semibold text-teal-deep">
          {result.overall}/100 · {modeLabel(result.mode)}
        </span>
      </div>

      {endCaption ? (
        <p className="result-item text-sm text-slate" style={{ ['--i' as string]: 1 }}>
          {endCaption}
        </p>
      ) : null}

      {result.refused_weak_agreement && (
        <p
          className="result-item rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger"
          style={{ ['--i' as string]: 1 }}
        >
          Ответ слишком короткий или пустой — разверните мысль.
        </p>
      )}

      <ul className="space-y-2">
        {result.rubrics.map((r, i) => (
          <li key={r.id} className="result-item" style={{ ['--i' as string]: i + 2 }}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-ink">{r.label}</span>
              <span className="text-slate">
                {r.score}/{r.max}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-mist">
              <div
                className="result-bar h-full rounded-full bg-teal"
                style={{ width: `${Math.min(100, (r.score / r.max) * 100)}%` }}
              />
            </div>
            {r.note ? <p className="mt-1 text-xs text-slate">{r.note}</p> : null}
          </li>
        ))}
      </ul>

      {result.strengths.length > 0 && (
        <div className="result-item" style={{ ['--i' as string]: result.rubrics.length + 2 }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">Сильные стороны</p>
          <ul className="mt-1 space-y-1">
            {result.strengths.map((g, i) => (
              <li
                key={g}
                className="result-check flex gap-2 text-sm text-ink"
                style={{ ['--i' as string]: i }}
              >
                <span className="text-slate" aria-hidden>
                  ✓
                </span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.gaps.length > 0 && (
        <div className="result-item" style={{ ['--i' as string]: result.rubrics.length + 3 }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">Проблемы</p>
          <ul className="mt-1 space-y-1">
            {result.gaps.map((g, i) => (
              <li
                key={g}
                className="result-check flex gap-2 text-sm text-ink"
                style={{ ['--i' as string]: i }}
              >
                <span className="text-slate" aria-hidden>
                  ·
                </span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.next_actions.length > 0 && (
        <div className="result-item" style={{ ['--i' as string]: result.rubrics.length + 4 }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">Что потренировать</p>
          <ul className="mt-1 space-y-1">
            {result.next_actions.map((g, i) => (
              <li
                key={g}
                className="result-check flex gap-2 text-sm text-ink"
                style={{ ['--i' as string]: i }}
              >
                <span className="text-slate" aria-hidden>
                  →
                </span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className="result-item rounded-2xl bg-paper/80 p-3 text-sm whitespace-pre-wrap text-slate"
        style={{ ['--i' as string]: result.rubrics.length + 5 }}
      >
        {result.reply_md}
      </div>
      <p className="result-item text-xs text-slate" style={{ ['--i' as string]: result.rubrics.length + 6 }}>
        Балл обновляет карту навыков (скользящая оценка). Платный AI не вызывался.
      </p>
    </section>
  )
}
