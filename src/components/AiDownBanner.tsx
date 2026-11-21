import { Link } from 'react-router-dom'
import { examinerBanner, isSpendLockOn } from '@/lib/ai-config'

/** Persistent honesty banner: spend lock ON / no live AI. Platform works without AI. */
export function AiDownBanner() {
  if (!isSpendLockOn()) return null
  const banner = examinerBanner()

  return (
    <div className="border-b border-ink/10 bg-mist/80 px-4 py-2 text-center text-[13px] text-ink">
      <strong className="font-semibold">Платный AI отключён.</strong> {banner.text}{' '}
      <Link to="/ai" className="font-semibold underline underline-offset-2">
        Тренажёры
      </Link>
      {' · '}
      задания, чат, документы и карта навыков работают как обычно.
    </div>
  )
}
