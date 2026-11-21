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
import { useAuth } from '@/context/AuthContext'
import { TRAINERS, examinerBanner, type TrainerSlug } from '@/lib/ai-config'
import { listDocumentGroups } from '@/lib/document-store'
import { getUnlockedWeek } from '@/lib/progress-store'

/** Роли покупателя в учебной симуляции продаж — не технические «типы» из CRM. */
const CLIENT_TYPES = [
  {
    id: 'Скептик-ЛПР',
    label: 'Скептик — лицо, принимающее решение (ЛПР)',
    tip: 'Тот, кто реально говорит «да/нет» по деньгам. Сомневается в цифрах и рисках.',
  },
  {
    id: 'Энтузиаст без бюджета',
    label: 'Энтузиаст без бюджета',
    tip: 'Горит идеей, но платить не может. Нужен путь к реальному плательщику.',
  },
  {
    id: 'Занятый чемпион',
    label: 'Занятый чемпион внутри компании',
    tip: 'Ваш союзник внутри клиента; мало времени, надо помогать ему «продать» вас дальше.',
  },
  {
    id: 'Закупщик по чеклисту',
    label: 'Закупщик по чеклисту',
    tip: 'Сравнивает по формальным критериям. Важно закрыть пункты списка, а не «вдохновлять».',
  },
] as const

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

function modeLabel(mode: ExaminerResult['mode']): string {
  if (mode === 'local_examiner') return 'локальная проверка'
  return mode
}

export function AiTrainerPage() {
  const { trainerSlug } = useParams()
  const { profile } = useAuth()
  const meta = TRAINERS.find((t) => t.slug === trainerSlug)
  const week = getWeek(getUnlockedWeek())
  const banner = examinerBanner()
  const [result, setResult] = useState<ExaminerResult | null>(null)

  const [text, setText] = useState('')
  const [clientType, setClientType] = useState<string>(CLIENT_TYPES[0].id)
  const [goal, setGoal] = useState('')
  const [reservation, setReservation] = useState('')
  const [batna, setBatna] = useState('')
  const [interests, setInterests] = useState('')
  const [concessions, setConcessions] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [options, setOptions] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [docId, setDocId] = useState('')

  const docs = useMemo(
    () => (profile ? listDocumentGroups().filter((g) => g.owner_id === profile.id) : []),
    [profile, result],
  )

  if (!meta || !trainerSlug) return <Navigate to="/ai" replace />
  if (!profile) return null

  const slug = trainerSlug as TrainerSlug
  const selectedClient = CLIENT_TYPES.find((c) => c.id === clientType) ?? CLIENT_TYPES[0]

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

  return (
    <div className="space-y-4">
      <header className="surface rounded-3xl p-6">
        <Link to="/ai" className="text-sm font-semibold text-teal">
          ← К списку тренажёров
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-teal">
          проверка без платного AI
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">{meta.title_ru}</h1>
        <p className="mt-2 text-sm text-slate">{meta.blurb_ru}</p>
        <p
          className={`mt-3 rounded-xl px-3 py-2 text-xs ${banner.tone === 'warn' ? 'bg-amber-soft/60' : 'bg-teal-soft/50'} text-ink`}
        >
          {banner.text}
        </p>
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

      <form onSubmit={run} className="surface space-y-4 rounded-3xl p-5">
        {slug === 'sales' && (
          <>
            <p className="text-sm text-slate">
              Шаг 1 — выберите, с кем говорите. Шаг 2 — вставьте реплики разговора. Шаг 3 — нажмите
              «Проверить».
            </p>
            <Field
              label="Роль клиента в разговоре"
              tip="Кого вы «продаёте» в этом раунде — как в живой сделке, не как в CRM."
            >
              <select
                value={clientType}
                onChange={(e) => setClientType(e.target.value)}
                className="w-full rounded-xl border border-ink/10 px-3 py-2"
              >
                {CLIENT_TYPES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <Tip>{selectedClient.tip}</Tip>
            </Field>
            <Field
              label="Текст разговора"
              tip="Диалог своими словами или стенограмма. Чем конкретнее реплики, тем точнее разбор."
            >
              <textarea
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                placeholder="Например: «Какую задачу сейчас решаете?» — «…» — «Когда удобно созвониться на 20 минут?»"
                className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
              />
            </Field>
          </>
        )}

        {slug === 'negotiation' && (
          <>
            <p className="text-sm text-slate">
              Сначала заполните подготовку к встрече, затем — что произошло в раунде.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Ваша цель" tip="Чего хотите добиться на этой встрече (одна фраза).">
                <input
                  className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                  placeholder="Например: согласовать пилот на 2 недели"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  required
                />
              </Field>
              <Field
                label="Красная линия"
                tip="Ниже чего не опускаетесь: цена, срок, условия — ваш предел."
              >
                <input
                  className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                  placeholder="Например: не ниже X ₽ / не без предоплаты"
                  value={reservation}
                  onChange={(e) => setReservation(e.target.value)}
                  required
                />
              </Field>
              <div className="md:col-span-2">
                <Field
                  label="BATNA — запасной план, если сделка сорвётся"
                  tip="Что сделаете без этой сделки (другой клиент, отложить, сделать сами). Без BATNA легко сдаться."
                >
                  <textarea
                    className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Если не договоримся — …"
                    value={batna}
                    onChange={(e) => setBatna(e.target.value)}
                    required
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field
                  label="Интересы сторон"
                  tip="Не позиции («хочу скидку»), а зачем: скорость, статус, риск, бюджет."
                >
                  <textarea
                    className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Мы: … · Они: …"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    required
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field
                  label="Возможный обмен (необязательно)"
                  tip="Что можете отдать взамен чего — пакет «если…, то…», а не односторонняя уступка."
                >
                  <textarea
                    className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Если они…, то мы…"
                    value={concessions}
                    onChange={(e) => setConcessions(e.target.value)}
                  />
                </Field>
              </div>
            </div>
            <Field label="Заметки по раунду" tip="Что сказали, что предложили, где застряли.">
              <textarea
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder="Кратко по ходу переговоров…"
                className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
              />
            </Field>
          </>
        )}

        {slug === 'presentation' && (
          <Field
            label="Скрипт выступления"
            tip="Структура: проблема слушателя → доказательства → конкретная просьба (что сделать дальше)."
          >
            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              placeholder="Начните с боли аудитории, не с «мы компания…»"
              className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
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
              className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
            />
          </Field>
        )}

        {slug === 'voice-practice' && (
          <>
            <Field
              label="Текст выступления (стенограмма)"
              tip="Распознавание речи в приложении не подключено — вставьте текст вручную. Тон и темп голоса здесь не оцениваются."
            >
              <textarea
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                placeholder="Вставьте текст того, что сказали вслух…"
                className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
              />
            </Field>
            <Field
              label="Аудиофайл (по желанию)"
              tip="Сохраняется только имя файла; разбор идёт по тексту выше."
            >
              <input type="file" accept="audio/*" className="block w-full text-sm" />
            </Field>
          </>
        )}

        {slug === 'adaptive' && (
          <Field
            label="Что сделали по упражнению"
            tip="Короткий отчёт: шаги и результат, не лозунг."
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              placeholder="Опишите выполнение — что сделали и что получилось…"
              className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
            />
          </Field>
        )}

        {slug === 'business-case' && (
          <>
            <p className="text-sm text-slate">Три блока: в чём проблема → какие варианты → что выбираете и почему.</p>
            <Field label="Диагноз" tip="В чём суть проблемы кейса — своими словами.">
              <textarea
                required
                rows={3}
                className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                placeholder="Ситуация и корень проблемы…"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </Field>
            <Field label="Варианты" tip="Не меньше двух осмысленных путей.">
              <textarea
                required
                rows={3}
                className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                placeholder="Вариант 1… Вариант 2…"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
              />
            </Field>
            <Field
              label="Рекомендация"
              tip="Что выбираете, почему, какой риск и как проверите за неделю."
            >
              <textarea
                required
                rows={3}
                className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                placeholder="Рекомендую… потому что… риск… проверка…"
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
              />
            </Field>
          </>
        )}

        {slug === 'writing-evaluator' && (
          <>
            <Field
              label="Документ из библиотеки (по желанию)"
              tip="Можно привязать к уже загруженному файлу — или проверить любой текст ниже."
            >
              <select
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
                className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
              >
                <option value="">Без привязки к документу</option>
                {docs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Текст на проверку"
              tip="Разбор структуры и ясности; полную перепись текст не получит — правки за вами."
            >
              <textarea
                required
                rows={10}
                className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
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
            Нажмите «Разобрать карту» — кратко объясним слабые места по вашим баллам и что потренировать
            дальше. Платный AI не нужен.
          </p>
        )}

        {slug === 'adaptive' && adaptivePreview.length === 0 && (
          <p className="text-sm text-slate">Пока нет данных по навыкам — сначала сдайте задание или другой тренажёр.</p>
        )}

        <button
          type="submit"
          className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-teal-deep"
        >
          {slug === 'skill-map' ? 'Разобрать карту' : 'Проверить'}
        </button>
      </form>

      {result && (
        <section className="surface space-y-3 rounded-3xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl text-ink">{result.title}</h2>
            <span className="rounded-full bg-teal-soft px-3 py-1 text-sm font-semibold text-teal-deep">
              {result.overall}/100 · {modeLabel(result.mode)}
            </span>
          </div>
          {result.refused_weak_agreement && (
            <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
              Ответ слишком короткий или пустой — разверните мысль.
            </p>
          )}
          <ul className="space-y-2">
            {result.rubrics.map((r) => (
              <li key={r.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-ink">{r.label}</span>
                  <span className="text-slate">
                    {r.score}/{r.max}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-mist">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${Math.min(100, (r.score / r.max) * 100)}%` }}
                  />
                </div>
                {r.note && <p className="mt-1 text-xs text-slate">{r.note}</p>}
              </li>
            ))}
          </ul>
          {result.gaps.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-teal">Что улучшить</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-ink">
                {result.gaps.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
          )}
          {result.next_actions.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-teal">Дальше</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-ink">
                {result.next_actions.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-2xl bg-paper/80 p-3 text-sm whitespace-pre-wrap text-slate">{result.reply_md}</div>
          <p className="text-xs text-slate">
            Балл обновляет карту навыков (скользящая оценка). Платный AI не вызывался.
          </p>
        </section>
      )}
    </div>
  )
}
