/**
 * Spend-lock status is intentional by default — do not show a global scare banner.
 * Quiet note lives only on /ai trainers (AiPage / AiTrainerPage).
 * Kept as a no-op export so older imports do not break.
 */
export function AiDownBanner() {
  return null
}
