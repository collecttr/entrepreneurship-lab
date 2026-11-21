import type { ReactNode } from 'react'

type HowtoCollapseProps = {
  /** Always-visible short line (Russian). */
  summary: ReactNode
  children: ReactNode
  /** Collapsed by default; expands pedagogy detail. */
  label?: string
  className?: string
}

/** Compact how-to: short summary + native accordion «Подробнее» (collapsed by default). */
export function HowtoCollapse({
  summary,
  children,
  label = 'Подробнее',
  className = '',
}: HowtoCollapseProps) {
  return (
    <div className={className}>
      <div className="text-sm leading-relaxed text-ink">{summary}</div>
      <details className="group mt-2">
        <summary className="cursor-pointer list-none text-sm font-semibold text-ink underline-offset-2 marker:content-none hover:underline [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block text-slate transition-transform duration-200 group-open:rotate-90"
            >
              ›
            </span>
            {label}
          </span>
        </summary>
        <div className="mt-2 text-sm leading-relaxed text-slate">{children}</div>
      </details>
    </div>
  )
}
