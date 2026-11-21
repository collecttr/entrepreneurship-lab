import type { TrainerSlug } from '@/lib/ai-config'

const USAGE_KEY = 'elab_ai_usage'

export interface AiUsageRow {
  id: string
  user_id: string
  trainer_slug: TrainerSlug
  tokens_in: number
  tokens_out: number
  cost_units: number
  mode: 'local_examiner' | 'live_proxy' | 'blocked_spend_lock'
  created_at: string
}

function readAll(): AiUsageRow[] {
  try {
    return JSON.parse(localStorage.getItem(USAGE_KEY) ?? '[]') as AiUsageRow[]
  } catch {
    return []
  }
}

export function recordUsage(row: Omit<AiUsageRow, 'id' | 'created_at'>): void {
  const all = readAll()
  all.push({
    ...row,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  })
  localStorage.setItem(USAGE_KEY, JSON.stringify(all))
}

export function listUsage(userId: string): AiUsageRow[] {
  return readAll().filter((r) => r.user_id === userId)
}

export function monthlyCostUnits(userId: string): number {
  const month = new Date().toISOString().slice(0, 7)
  return listUsage(userId)
    .filter((r) => r.created_at.startsWith(month))
    .reduce((s, r) => s + r.cost_units, 0)
}
