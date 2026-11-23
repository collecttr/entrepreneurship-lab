import { useEffect, useId, useRef, useState } from 'react'
import { conceptDefinitionRu } from '@/data/glossary'

type ConceptPopoverProps = {
  term: string
  /** Optional override; defaults to glossary lookup. */
  definition_ru?: string
}

/** Clickable concept chip → graphite popover with RU definition. */
export function ConceptPopover({ term, definition_ru }: ConceptPopoverProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  const panelId = useId()
  const definition = definition_ru ?? conceptDefinitionRu(term)

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <span ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        className="rounded-lg bg-teal-soft/70 px-2.5 py-1 text-left text-sm text-ink underline-offset-2 transition hover:bg-teal-soft hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {term}
      </button>
      {open && (
        <span
          id={panelId}
          role="dialog"
          aria-label={term}
          className="absolute left-0 top-full z-30 mt-1.5 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-mist bg-paper p-3 text-sm leading-relaxed text-ink shadow-[0_12px_40px_rgba(44,44,46,0.14)]"
        >
          <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate">
            {term}
          </span>
          <span className="mt-1.5 block text-ink-soft">{definition}</span>
          <button
            type="button"
            className="mt-2 text-xs font-semibold text-teal hover:underline"
            onClick={() => setOpen(false)}
          >
            Закрыть
          </button>
        </span>
      )}
    </span>
  )
}
