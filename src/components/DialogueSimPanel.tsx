import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  endReasonLabel,
  formatTranscript,
  MAX_DIALOGUE_TURNS,
  nextClientTurn,
  personasFor,
  type DialogueEndReason,
  type DialogueKind,
  type DialogueMessage,
  type DialoguePersona,
} from '@/ai/dialogue-sim'
import type { ExaminerResult } from '@/ai/examiners'
import { ExaminerResultPanel } from '@/components/ExaminerResultPanel'

export function DialogueSimPanel({
  kind,
  weekNumber,
  onFinished,
  buildResult,
  prepSlot,
}: {
  kind: DialogueKind
  weekNumber?: number
  /** Called when dialogue ends and result is ready (for skill bump already inside examine*). */
  onFinished?: (result: ExaminerResult) => void
  buildResult: (persona: DialoguePersona, transcript: string) => ExaminerResult
  /** Optional prep fields above the chat (negotiation). */
  prepSlot?: ReactNode
}) {
  const personas = personasFor(kind)
  const [personaId, setPersonaId] = useState(personas[0]!.id)
  const [phase, setPhase] = useState<'pick' | 'chat' | 'done'>('pick')
  const [messages, setMessages] = useState<DialogueMessage[]>([])
  const [draft, setDraft] = useState('')
  const [endReason, setEndReason] = useState<DialogueEndReason | null>(null)
  const [result, setResult] = useState<ExaminerResult | null>(null)
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const persona = personas.find((p) => p.id === personaId) ?? personas[0]!
  const userTurns = messages.filter((m) => m.role === 'user').length

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, typing, phase])

  function startChat() {
    setMessages([{ role: 'client', text: persona.opening }])
    setDraft('')
    setEndReason(null)
    setResult(null)
    setPhase('chat')
  }

  function finish(reason: DialogueEndReason, msgs: DialogueMessage[]) {
    const transcript = formatTranscript(msgs)
    const r = buildResult(persona, transcript)
    setEndReason(reason)
    setResult(r)
    setPhase('done')
    onFinished?.(r)
  }

  function sendPhrase(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || typing || phase !== 'chat') return

    const withUser: DialogueMessage[] = [...messages, { role: 'user', text }]
    setMessages(withUser)
    setDraft('')
    setTyping(true)

    // Small delay so the «client» feels turn-based, not instant spam.
    window.setTimeout(() => {
      const turn = nextClientTurn(persona.id, text, messages)
      const withClient: DialogueMessage[] = [...withUser, { role: 'client', text: turn.reply }]
      setMessages(withClient)
      setTyping(false)
      if (turn.endReason) {
        window.setTimeout(() => finish(turn.endReason!, withClient), 280)
      }
    }, 420)
  }

  function endByUser() {
    if (phase !== 'chat') return
    finish('user_ended', messages)
  }

  function resetAll() {
    setPhase('pick')
    setMessages([])
    setDraft('')
    setEndReason(null)
    setResult(null)
    setTyping(false)
  }

  return (
    <div className="space-y-4">
      {prepSlot}

      {phase === 'pick' && (
        <div className="space-y-3">
          <p className="text-sm text-slate">
            {kind === 'sales'
              ? 'Выберите тип собеседника, затем пишите по одной фразе — «клиент» отвечает по правилам (без платного AI).'
              : 'Выберите тип контрагента и ведите раунд фраза за фразой. Оценка — по процессу, не «кто победил».'}
          </p>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-ink">
              {kind === 'sales' ? 'Тип клиента' : 'Тип контрагента'}
            </legend>
            <div className="grid gap-2">
              {personas.map((p) => {
                const selected = p.id === personaId
                return (
                  <label
                    key={p.id}
                    className={`cursor-pointer rounded-2xl border px-4 py-3 transition ${
                      selected ? 'border-ink/40 bg-mist/80' : 'border-ink/10 hover:border-ink/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`persona-${kind}`}
                      className="sr-only"
                      checked={selected}
                      onChange={() => setPersonaId(p.id)}
                    />
                    <span className="block text-sm font-semibold text-ink">{p.label}</span>
                    <span className="mt-1 block text-xs leading-snug text-slate">{p.tip}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
          <button
            type="button"
            onClick={startChat}
            className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-teal-deep"
          >
            Начать диалог
          </button>
          {weekNumber != null ? (
            <p className="text-xs text-slate">Контекст недели {weekNumber} учитывается в итоге.</p>
          ) : null}
        </div>
      )}

      {(phase === 'chat' || phase === 'done') && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink">{persona.label}</p>
            <p className="text-xs text-slate">
              Реплика {Math.min(userTurns, MAX_DIALOGUE_TURNS)}/{MAX_DIALOGUE_TURNS}
            </p>
          </div>

          <div className="max-h-[28rem] space-y-2 overflow-y-auto rounded-2xl bg-mist/50 p-3">
            {messages.map((m, i) => (
              <div
                key={`${i}-${m.role}`}
                className={`dialogue-bubble flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ ['--i' as string]: Math.min(i, 6) }}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                    m.role === 'user'
                      ? 'bg-ink text-on-accent'
                      : 'border border-ink/10 bg-paper text-ink'
                  }`}
                >
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-60">
                    {m.role === 'user' ? 'Вы' : kind === 'sales' ? 'Клиент' : 'Контрагент'}
                  </p>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="dialogue-bubble flex justify-start" style={{ ['--i' as string]: 0 }}>
                <div className="rounded-2xl border border-ink/10 bg-paper px-3.5 py-2 text-sm text-slate">
                  печатает…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {phase === 'chat' && (
            <form onSubmit={sendPhrase} className="space-y-2">
              <label className="block text-sm font-medium text-ink">
                Ваша фраза
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  disabled={typing}
                  placeholder="Одна реплика — затем ответ клиента…"
                  className="field mt-1.5 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={typing || !draft.trim()}
                  className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-teal-deep disabled:opacity-40"
                >
                  Отправить
                </button>
                <button
                  type="button"
                  onClick={endByUser}
                  disabled={typing || messages.length < 2}
                  className="rounded-xl border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-mist disabled:opacity-40"
                >
                  Завершить и получить итог
                </button>
              </div>
            </form>
          )}

          {phase === 'done' && result && endReason && (
            <>
              <ExaminerResultPanel
                result={result}
                endCaption={`Итог: ${endReasonLabel(endReason)}`}
              />
              <button
                type="button"
                onClick={resetAll}
                className="rounded-xl border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-mist"
              >
                Новый диалог
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
