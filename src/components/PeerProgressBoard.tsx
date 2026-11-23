import { useEffect, useState, type CSSProperties } from 'react'
import {
  COURSE_START_DATE,
  TOTAL_COURSE_WEEKS,
  formatRuDate,
  weekDeadlineDate,
} from '@/lib/course-calendar'
import {
  loadPeerProgressBoard,
  syncOwnProgressSnapshot,
  type LearnerProgressCard,
} from '@/lib/peer-progress'
import { ensureCleanCourseStart } from '@/lib/progress-store'
import type { Profile } from '@/lib/types'

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-mist">
      <div
        className="h-full rounded-full bg-teal transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

function LearnerColumn({ card, index }: { card: LearnerProgressCard; index: number }) {
  return (
    <div
      className={`board-col rounded-2xl px-4 py-4 ${
        card.is_you
          ? 'bg-gradient-to-br from-[#4a5560] to-[#3a424c] text-on-accent shadow-[0_8px_24px_rgba(60,70,90,0.18)]'
          : 'bg-mist/90 text-ink ring-1 ring-ink/5'
      }`}
      style={{ ['--i' as string]: index } as CSSProperties}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className={`font-display text-2xl tracking-tight ${card.is_you ? 'text-on-accent' : 'text-ink'}`}>
          {card.display_name}
        </h3>
        {card.is_you ? (
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-on-accent/70">
            вы
          </span>
        ) : (
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate">
            партнёр
          </span>
        )}
      </div>
      <p className={`mt-1 text-xs ${card.is_you ? 'text-on-accent/65' : 'text-slate'}`}>
        Вариант {card.participant_slot ?? '—'} · неделя {card.current_week} из {TOTAL_COURSE_WEEKS}
        {card.current_week_complete ? ' · этап закрыт' : ' · этап открыт'}
      </p>

      <p className={`mt-4 font-display text-4xl tabular-nums ${card.is_you ? 'text-on-accent' : 'text-ink'}`}>
        {card.progress_pct}%
      </p>
      <div className={`mt-2 ${card.is_you ? 'opacity-90' : ''}`}>
        <div className={`h-2 overflow-hidden rounded-full ${card.is_you ? 'bg-white/20' : 'bg-paper'}`}>
          <div
            className={`h-full rounded-full transition-all ${card.is_you ? 'bg-white' : 'bg-teal'}`}
            style={{ width: `${Math.min(100, card.progress_pct)}%` }}
          />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div>
          <dt className={card.is_you ? 'text-on-accent/60' : 'text-slate'}>Недель закрыто</dt>
          <dd className="font-medium tabular-nums">
            {card.weeks_completed} / {TOTAL_COURSE_WEEKS}
          </dd>
        </div>
        <div>
          <dt className={card.is_you ? 'text-on-accent/60' : 'text-slate'}>Осталось недель</dt>
          <dd className="font-medium tabular-nums">{card.weeks_remaining}</dd>
        </div>
        <div>
          <dt className={card.is_you ? 'text-on-accent/60' : 'text-slate'}>Модулей (этапов)</dt>
          <dd className="font-medium tabular-nums">
            {card.stages_completed} / {card.stages_total}
          </dd>
        </div>
        <div>
          <dt className={card.is_you ? 'text-on-accent/60' : 'text-slate'}>Сдачи</dt>
          <dd className="font-medium tabular-nums">
            {card.assignments_completed} / {card.assignments_total}
          </dd>
        </div>
      </dl>
      <p className={`mt-3 text-xs ${card.is_you ? 'text-on-accent/55' : 'text-slate'}`}>
        Осталось сдать: {card.assignments_remaining}
        {card.source === 'empty' ? ' · данных пока нет' : ''}
        {card.source === 'remote' ? ' · с сервера' : ''}
      </p>
    </div>
  )
}

export function PeerProgressBoard({ profile }: { profile: Profile }) {
  const [cards, setCards] = useState<LearnerProgressCard[] | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      ensureCleanCourseStart()
      await syncOwnProgressSnapshot(profile)
      const rows = await loadPeerProgressBoard(profile)
      if (!cancelled) setCards(rows)
    })()
    return () => {
      cancelled = true
    }
  }, [profile])

  const calendarWeek = cards?.[0]?.calendar_week ?? 1
  const deadline = weekDeadlineDate(calendarWeek, COURSE_START_DATE)

  return (
    <section
      className="board-enter surface rounded-3xl p-5 md:p-6"
      aria-labelledby="peer-progress-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Два участника</p>
          <h2 id="peer-progress-heading" className="mt-1 font-display text-2xl text-ink md:text-3xl">
            Прогресс: Саша и Платон
          </h2>
          <p className="mt-1 text-sm text-slate">
            Сравнение по закрытым неделям и сдачам · старт курса {formatRuDate(COURSE_START_DATE)} (МСК)
          </p>
        </div>
        <p className="text-xs text-slate">
          Календарная неделя {calendarWeek} · дедлайн {formatRuDate(deadline)}
        </p>
      </div>

      {!cards ? (
        <p className="mt-5 text-sm text-slate">Считаем прогресс…</p>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {cards.map((card, index) => (
            <LearnerColumn key={card.key} card={card} index={index} />
          ))}
        </div>
      )}

      {cards && cards.length === 2 ? (
        <div className="mt-4 rounded-2xl bg-paper/90 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate">Кто впереди</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex justify-between text-xs text-slate">
                <span>{cards[0].display_name}</span>
                <span className="tabular-nums">{cards[0].progress_pct}%</span>
              </div>
              <ProgressBar value={cards[0].progress_pct} />
            </div>
            <span className="shrink-0 text-xs text-slate">vs</span>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex justify-between text-xs text-slate">
                <span>{cards[1].display_name}</span>
                <span className="tabular-nums">{cards[1].progress_pct}%</span>
              </div>
              <ProgressBar value={cards[1].progress_pct} />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
