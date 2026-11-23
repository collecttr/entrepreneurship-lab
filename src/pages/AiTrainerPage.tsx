import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getWeek } from '@/data/curriculum'
import {
  buildAdaptiveExercises,
  examineAdaptive,
  examineBusinessCase,
  examineNegotiation,
  examinePresentation,
  examineSales,
  examineSkillMap,
  examineSocratic,
  examineVoice,
  examineWriting,
  type ExaminerResult,
} from '@/ai/examiners'
import { DialogueSimPanel } from '@/components/DialogueSimPanel'
import { ExaminerResultPanel } from '@/components/ExaminerResultPanel'
import { useAuth } from '@/context/AuthContext'
import { TRAINERS, examinerBanner, type TrainerSlug } from '@/lib/ai-config'
import { listDocumentGroups } from '@/lib/document-store'
import { getUnlockedWeek } from '@/lib/progress-store'

function Tip({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs leading-snug text-slate">{children}</p>
}

function Field({
  label,
  tip,
  children,
}: {
  label: string
  tip?: string
  children: ReactNode
}) {
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      {tip ? <Tip>{tip}</Tip> : null}
      <div className="mt-1.5 font-normal">{children}</div>
    </label>
  )
}

type PracticeMode = 'dialogue' | 'transcript'

export function AiTrainerPage() {
  const { trainerSlug } = useParams()
  const { profile } = useAuth()
  const meta = TRAINERS.find((t) => t.slug === trainerSlug)
  const week = getWeek(getUnlockedWeek())
  const banner = examinerBanner()
  const [result, setResult] = useState<ExaminerResult | null>(null)

  const [text, setText] = useState('')
  const [clientType, setClientType] = useState('Скептичный руководитель с бюджетом')
  const [goal, setGoal] = useState('')
  const [reservation, setReservation] = useState('')
  const [batna, setBatna] = useState('')
  const [interests, setInterests] = useState('')
  const [concessions, setConcessions] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [options, setOptions] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [docId, setDocId] = useState('')
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('dialogue')

  const docs = useMemo(
    () => (profile ? listDocumentGroups().filter((g) => g.owner_id === profile.id) : []),
    [profile, result],
  )

  if (!meta || !trainerSlug) return <Navigate to="/ai" replace />
  if (!profile) return null

  const slug = trainerSlug as TrainerSlug
  const usesDialogue = slug === 'sales' || slug === 'negotiation'

  function run(e: FormEvent) {
    e.preventDefault()
    setResult(null)
    let r: ExaminerResult
    switch (slug) {
      case 'sales':
        r = examineSales(profile!.id, { clientType, transcript: text, weekNumber: week?.week_number })
        break
      case 'negotiation':
        r = examineNegotiation(profile!.id, {
          goal,
          reservation,
          batna,
          interests,
          concessions,
          roundNotes: text,
          weekNumber: week?.week_number,
        })
        break
      case 'presentation':
        r = examinePresentation(profile!.id, { script: text, weekNumber: week?.week_number })
        break
      case 'socratic':
        r = examineSocratic(profile!.id, { answer: text, weekNumber: week?.week_number })
        break
      case 'business-case':
        r = examineBusinessCase(profile!.id, {
          diagnosis,
          options,
          recommendation,
          weekNumber: week?.week_number,
        })
        break
      case 'writing-evaluator':
        r = examineWriting(profile!.id, { text, documentGroupId: docId || undefined })
        break
      case 'voice-practice':
        r = examineVoice(profile!.id, { transcript: text })
        break
      case 'skill-map':
        r = examineSkillMap(profile!.id)
        break
      case 'adaptive':
        r = examineAdaptive(profile!.id, { notes: text })
        break
      default:
        return
    }
    setResult(r)
  }

  const adaptivePreview = slug === 'adaptive' ? buildAdaptiveExercises(profile.id) : []

  function negotiationPrepFields(required: boolean) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Ваша цель" tip="Чего хотите добиться на этой встрече (одна фраза).">
          <input
            className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
            placeholder="Например: согласовать пилот на 2 недели"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required={required}
          />
        </Field>
        <Field label="Красная линия" tip="Ниже чего не опускаетесь: цена, срок, условия.">
          <input
            className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
            placeholder="Например: не ниже X ₽ / не без предоплаты"
            value={reservation}
            onChange={(e) => setReservation(e.target.value)}
            required={required}
          />
        </Field>
        <div className="md:col-span-2">
          <Field
            label="BATNA — запасной план, если сделка сорвётся"
            tip="Что сделаете без этой сделки. Без BATNA легко сдаться."
          >
            <textarea
              className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
              rows={2}
              placeholder="Если не договоримся — …"
              value={batna}
              onChange={(e) => setBatna(e.target.value)}
              required={required}
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field
            label="Интересы сторон"
            tip="Не позиции («хочу скидку»), а зачем: скорость, статус, риск, бюджет."
          >
            <textarea
              className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
              rows={2}
              placeholder="Мы: … · Они: …"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              required={required}
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field
            label="Возможный обмен (по желанию)"
            tip="Пакет «если…, то…», а не односторонняя уступка."
          >
            <textarea
              className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
              rows={2}
              placeholder="Если они…, то мы…"
              value={concessions}
              onChange={(e) => setConcessions(e.target.value)}
            />
          </Field>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <header className="surface rounded-3xl p-6">
        <Link to="/ai" className="text-sm font-semibold text-teal">
          ← К списку тренажёров
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-teal">
          локальная проверка
        </p>
        <h1 className="mt-1 font-display text-2xl text-ink md:text-3xl">{meta.title_ru}</h1>
        <p className="mt-2 text-sm text-slate">{meta.blurb_ru}</p>
        <p className="mt-3 text-xs text-slate">{banner.text}</p>
        {week && (
          <div className="mt-3 rounded-2xl bg-paper/80 p-3 text-xs text-slate">
            <p className="font-semibold text-ink">
              Неделя {week.week_number}: {week.title_ru}
            </p>
            <p className="mt-1">Сценарий недели: {week.simulation_ru}</p>
            <p className="mt-1">Практика продаж на неделю: {week.sales_drill_ru}</p>
          </div>
        )}
      </header>

      {usesDialogue && (
        <div className="surface space-y-4 rounded-3xl p-5">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Режим практики">
            <button
              type="button"
              role="tab"
              aria-selected={practiceMode === 'dialogue'}
              onClick={() => {
                setPracticeMode('dialogue')
                setResult(null)
              }}
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold ${
                practiceMode === 'dialogue'
                  ? 'bg-ink text-on-accent'
                  : 'border border-ink/15 text-ink hover:bg-mist'
              }`}
            >
              Диалог по фразам
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={practiceMode === 'transcript'}
              onClick={() => {
                setPracticeMode('transcript')
                setResult(null)
              }}
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold ${
                practiceMode === 'transcript'
                  ? 'bg-ink text-on-accent'
                  : 'border border-ink/15 text-ink hover:bg-mist'
              }`}
            >
              {slug === 'sales' ? 'Вставить весь текст разговора' : 'Заметки раунда без диалога'}
            </button>
          </div>

          {practiceMode === 'dialogue' && (
            <DialogueSimPanel
              kind={slug === 'sales' ? 'sales' : 'negotiation'}
              weekNumber={week?.week_number}
              prepSlot={slug === 'negotiation' ? negotiationPrepFields(false) : undefined}
              buildResult={(persona, transcript) => {
                if (slug === 'sales') {
                  return examineSales(profile.id, {
                    clientType: persona.label,
                    transcript,
                    weekNumber: week?.week_number,
                  })
                }
                return examineNegotiation(profile.id, {
                  goal: goal || 'Цель раунда',
                  reservation: reservation || 'Красная линия не указана',
                  batna: batna || 'BATNA не указана',
                  interests: interests || 'Интересы не указаны',
                  concessions,
                  roundNotes: transcript,
                  weekNumber: week?.week_number,
                })
              }}
            />
          )}

          {practiceMode === 'transcript' && slug === 'sales' && (
            <form onSubmit={run} className="space-y-4">
              <p className="text-sm text-slate">
                Старый путь: вставьте весь разговор целиком и получите разбор. Для тренировки удобнее
                режим «Диалог по фразам».
              </p>
              <Field
                label="Роль клиента (для подписи в итоге)"
                tip="Кратко — кого вы имели в виду в этом тексте."
              >
                <input
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value)}
                  className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                  placeholder="Например: скептичный руководитель с бюджетом"
                />
              </Field>
              <Field
                label="Текст разговора"
                tip="Диалог своими словами или стенограмма."
              >
                <textarea
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  placeholder="Например: «Какую задачу сейчас решаете?» — «…» — «Когда удобно созвониться?»"
                  className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                />
              </Field>
              <button
                type="submit"
                className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-teal-deep"
              >
                Проверить
              </button>
            </form>
          )}

          {practiceMode === 'transcript' && slug === 'negotiation' && (
            <form onSubmit={run} className="space-y-4">
              <p className="text-sm text-slate">
                Заполните подготовку и кратко опишите раунд — без пошагового диалога.
              </p>
              {negotiationPrepFields(true)}
              <Field label="Заметки по раунду" tip="Что сказали, что предложили, где застряли.">
                <textarea
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  placeholder="Кратко по ходу переговоров…"
                  className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                />
              </Field>
              <button
                type="submit"
                className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-teal-deep"
              >
                Проверить
              </button>
            </form>
          )}
        </div>
      )}

      {!usesDialogue && (
        <form onSubmit={run} className="surface space-y-4 rounded-3xl p-5">
          {slug === 'presentation' && (
            <Field
              label="Скрипт выступления"
              tip="Структура: проблема слушателя → доказательства → конкретная просьба."
            >
              <textarea
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                placeholder="Начните с боли аудитории, не с «мы компания…»"
                className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
              />
            </Field>
          )}

          {slug === 'socratic' && (
            <Field
              label="Ваш ответ"
              tip="Развёрнуто, со своим примером. Короткое «да/согласен» не засчитывается."
            >
              <textarea
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                placeholder="Свяжите ответ с понятиями текущей недели…"
                className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
              />
            </Field>
          )}

          {slug === 'voice-practice' && (
            <>
              <Field
                label="Текст выступления (стенограмма)"
                tip="Распознавание речи не подключено — вставьте текст вручную."
              >
                <textarea
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  placeholder="Вставьте текст того, что сказали вслух…"
                  className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Аудиофайл (по желанию)" tip="Сохраняется только имя файла.">
                <input type="file" accept="audio/*" className="block w-full text-sm" />
              </Field>
            </>
          )}

          {slug === 'adaptive' && (
            <Field label="Что сделали по упражнению" tip="Короткий отчёт: шаги и результат.">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                placeholder="Опишите результат…"
                className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
              />
            </Field>
          )}

          {slug === 'business-case' && (
            <>
              <p className="text-sm text-slate">
                Три блока: в чём проблема → какие варианты → что выбираете и почему.
              </p>
              <Field label="Диагноз" tip="В чём суть проблемы кейса.">
                <textarea
                  required
                  rows={3}
                  className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                  placeholder="Ситуация и корень проблемы…"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </Field>
              <Field label="Варианты" tip="Не меньше двух осмысленных путей.">
                <textarea
                  required
                  rows={3}
                  className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                  placeholder="Вариант 1… Вариант 2…"
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                />
              </Field>
              <Field label="Рекомендация" tip="Что выбираете, почему, риск и проверка за неделю.">
                <textarea
                  required
                  rows={3}
                  className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                  placeholder="Рекомендую… потому что… риск… проверка…"
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                />
              </Field>
            </>
          )}

          {slug === 'writing-evaluator' && (
            <>
              <Field label="Документ из библиотеки (по желанию)" tip="Можно привязать к файлу.">
                <select
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                  className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                >
                  <option value="">Без привязки к документу</option>
                  {docs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Текст на проверку" tip="Разбор структуры и ясности.">
                <textarea
                  required
                  rows={10}
                  className="field w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                  placeholder="Вставьте текст…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </Field>
            </>
          )}

          {slug === 'adaptive' && adaptivePreview.length > 0 && (
            <ul className="space-y-2 rounded-2xl bg-teal-soft/40 p-3 text-sm">
              {adaptivePreview.map((a) => (
                <li key={a.skill}>
                  <strong className="text-ink">{a.skill}</strong>
                  {a.replaces_optional_work ? ' · замена необязательной работы' : ' · по желанию'}:{' '}
                  {a.exercise}
                </li>
              ))}
            </ul>
          )}

          {slug === 'skill-map' && (
            <p className="text-sm text-slate">
              Нажмите «Разобрать карту» — слабые места по баллам и что потренировать. Платный AI не
              нужен.
            </p>
          )}

          {slug === 'adaptive' && adaptivePreview.length === 0 && (
            <p className="text-sm text-slate">
              Пока нет данных по навыкам — сначала сдайте задание или другой тренажёр.
            </p>
          )}

          <button
            type="submit"
            className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-teal-deep"
          >
            {slug === 'skill-map' ? 'Разобрать карту' : 'Проверить'}
          </button>
        </form>
      )}

      {result && practiceMode === 'transcript' && <ExaminerResultPanel result={result} />}
      {result && !usesDialogue && <ExaminerResultPanel result={result} />}
    </div>
  )
}
