/** Course calendar: week 1 starts 2026-11-23 Europe/Moscow. */

export const COURSE_START_DATE = '2026-11-23'
export const COURSE_TIMEZONE = 'Europe/Moscow'
export const TOTAL_COURSE_WEEKS = 26

const MS_DAY = 86_400_000

/** YYYY-MM-DD for an instant in Europe/Moscow. */
export function moscowDateString(at: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: COURSE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at)
}

function parseYmd(ymd: string): { y: number; m: number; d: number } {
  const [y, m, d] = ymd.split('-').map(Number)
  return { y: y || 1970, m: m || 1, d: d || 1 }
}

/** UTC noon for a Moscow calendar date — stable day arithmetic across DST. */
function utcNoonForYmd(ymd: string): Date {
  const { y, m, d } = parseYmd(ymd)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
}

function addDaysYmd(ymd: string, days: number): string {
  const dt = utcNoonForYmd(ymd)
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

function dayDiff(fromYmd: string, toYmd: string): number {
  return Math.round((utcNoonForYmd(toYmd).getTime() - utcNoonForYmd(fromYmd).getTime()) / MS_DAY)
}

/**
 * Program week number (1…26) for a Moscow calendar date.
 * Before course start → 1; after week 26 → 26.
 */
export function courseWeekNumber(
  onYmd: string = moscowDateString(),
  startYmd: string = COURSE_START_DATE,
): number {
  const diff = dayDiff(startYmd, onYmd)
  if (diff < 0) return 1
  return Math.min(TOTAL_COURSE_WEEKS, Math.floor(diff / 7) + 1)
}

/** First calendar day (Moscow) of program week N. */
export function weekStartDate(weekNumber: number, startYmd: string = COURSE_START_DATE): string {
  const n = Math.max(1, Math.min(TOTAL_COURSE_WEEKS, Math.floor(weekNumber)))
  return addDaysYmd(startYmd, (n - 1) * 7)
}

/** Last calendar day (Moscow) of program week N — deadline end-of-day. */
export function weekDeadlineDate(weekNumber: number, startYmd: string = COURSE_START_DATE): string {
  return addDaysYmd(weekStartDate(weekNumber, startYmd), 6)
}

/** Days from Moscow today until week deadline (negative = overdue). */
export function daysUntilDeadline(
  weekNumber: number,
  onYmd: string = moscowDateString(),
  startYmd: string = COURSE_START_DATE,
): number {
  return dayDiff(onYmd, weekDeadlineDate(weekNumber, startYmd))
}

export function formatRuDate(ymd: string): string {
  const { y, m, d } = parseYmd(ymd)
  const months = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ]
  return `${d} ${months[(m || 1) - 1]} ${y}`
}
