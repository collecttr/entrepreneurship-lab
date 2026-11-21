import { useMemo, useState, type FormEvent } from 'react'
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

const CLIENT_TYPES = [
  'Скептик-ЛПР',
  'Энтузиаст без бюджета',
  'Занятый чемпион',
  'Закупщик по чеклисту',
]

export function AiTrainerPage() {
  const { trainerSlug } = useParams()
  const { profile } = useAuth()
  const meta = TRAINERS.find((t) => t.slug === trainerSlug)
  const week = getWeek(getUnlockedWeek())
  const banner = examinerBanner()
  const [result, setResult] = useState<ExaminerResult | null>(null)

  // shared fields
  const [text, setText] = useState('')
  const [clientType, setClientType] = useState(CLIENT_TYPES[0])
  const [goal, setGoal] = useState('')
  const [reservation, setReservation] = useState('')
  const [batna, setBatna] = useState('')
  const [interests, setInterests] = useState('')
  const [concessions, setConcessions] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [options, setOptions] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [docId, setDocId] = useState('')

  const docs = useMemo(() => (profile ? listDocumentGroups().filter((g) => g.owner_id === profile.id) : []), [profile, result])

  if (!meta || !trainerSlug) return <Navigate to="/ai" replace />
  if (!profile) return null

  const slug = trainerSlug as TrainerSlug

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
          ← Каталог
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-teal">локальный экзаменатор</p>
        <h1 className="mt-1 font-display text-3xl text-ink">{meta.title_ru}</h1>
        <p className="mt-2 text-sm text-slate">{meta.blurb_ru}</p>
        <p className={`mt-3 rounded-xl px-3 py-2 text-xs ${banner.tone === 'warn' ? 'bg-amber-soft/60' : 'bg-teal-soft/50'} text-ink`}>
          {banner.text}
        </p>
        {week && (
          <div className="mt-3 rounded-2xl bg-paper/80 p-3 text-xs text-slate">
            <p className="font-semibold text-ink">
              Неделя {week.week_number}: {week.title_ru}
            </p>
            <p className="mt-1">Симуляция: {week.simulation_ru}</p>
            <p className="mt-1">Sales drill: {week.sales_drill_ru}</p>
          </div>
        )}
      </header>

      <form onSubmit={run} className="surface space-y-3 rounded-3xl p-5">
        {slug === 'sales' && (
          <>
            <label className="block text-sm">
              Тип клиента
              <select
                value={clientType}
                onChange={(e) => setClientType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/10 px-3 py-2"
              >
                {CLIENT_TYPES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder="Транскрипт / реплики раунда продаж…"
              className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
            />
          </>
        )}

        {slug === 'negotiation' && (
          <>
            <div className="grid gap-2 md:grid-cols-2">
              <input className="rounded-xl border border-ink/10 px-3 py-2 text-sm" placeholder="Цель" value={goal} onChange={(e) => setGoal(e.target.value)} required />
              <input className="rounded-xl border border-ink/10 px-3 py-2 text-sm" placeholder="Резервная цена / красная линия" value={reservation} onChange={(e) => setReservation(e.target.value)} required />
              <textarea className="rounded-xl border border-ink/10 px-3 py-2 text-sm md:col-span-2" rows={2} placeholder="BATNA" value={batna} onChange={(e) => setBatna(e.target.value)} required />
              <textarea className="rounded-xl border border-ink/10 px-3 py-2 text-sm md:col-span-2" rows={2} placeholder="Интересы сторон" value={interests} onChange={(e) => setInterests(e.target.value)} required />
              <textarea className="rounded-xl border border-ink/10 px-3 py-2 text-sm md:col-span-2" rows={2} placeholder="Возможные уступки / обмен" value={concessions} onChange={(e) => setConcessions(e.target.value)} />
            </div>
            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Заметки раунда переговоров…"
              className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
            />
          </>
        )}

        {(slug === 'presentation' || slug === 'socratic' || slug === 'voice-practice' || slug === 'adaptive') && (
          <textarea
            required={slug !== 'adaptive'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={slug === 'voice-practice' ? 8 : 7}
            placeholder={
              slug === 'presentation'
                ? 'Скрипт питча…'
                : slug === 'socratic'
                  ? 'Ваш ответ на сократический вопрос…'
                  : slug === 'voice-practice'
                    ? 'Вставьте транскрипт записи (STT не подключён — без фейкового pitch/tempo)…'
                    : 'Что сделали по адаптивному упражнению…'
            }
            className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
          />
        )}

        {slug === 'voice-practice' && (
          <label className="block text-sm text-slate">
            Аудио (опционально, только имя файла — анализ по транскрипту)
            <input type="file" accept="audio/*" className="mt-1 block w-full text-sm" />
          </label>
        )}

        {slug === 'business-case' && (
          <>
            <textarea required rows={3} className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm" placeholder="Диагноз" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
            <textarea required rows={3} className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm" placeholder="Варианты" value={options} onChange={(e) => setOptions(e.target.value)} />
            <textarea required rows={3} className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm" placeholder="Рекомендация + риск/метрика" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} />
          </>
        )}

        {slug === 'writing-evaluator' && (
          <>
            <select value={docId} onChange={(e) => setDocId(e.target.value)} className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm">
              <option value="">Без привязки к документу</option>
              {docs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
            <textarea required rows={10} className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm" placeholder="Вставьте текст на проверку (не полная перепись)…" value={text} onChange={(e) => setText(e.target.value)} />
          </>
        )}

        {slug === 'adaptive' && adaptivePreview.length > 0 && (
          <ul className="space-y-2 rounded-2xl bg-teal-soft/40 p-3 text-sm">
            {adaptivePreview.map((a) => (
              <li key={a.skill}>
                <strong className="text-ink">{a.skill}</strong>
                {a.replaces_optional_work ? ' · замена optional' : ' · optional'}: {a.exercise}
              </li>
            ))}
          </ul>
        )}

        {slug === 'skill-map' && (
          <p className="text-sm text-slate">Нажмите «Разобрать» — пояснение gaps по текущей карте навыков.</p>
        )}

        <button type="submit" className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-deep">
          {slug === 'skill-map' ? 'Разобрать карту' : 'Проверить локальным экзаменатором'}
        </button>
      </form>

      {result && (
        <section className="surface space-y-3 rounded-3xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl text-ink">{result.title}</h2>
            <span className="rounded-full bg-teal-soft px-3 py-1 text-sm font-semibold text-teal-deep">
              {result.overall}/100 · {result.mode}
            </span>
          </div>
          {result.refused_weak_agreement && (
            <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
              Экзаменатор не принял слабый/пустой ответ.
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
              <p className="text-xs font-semibold uppercase text-teal">Пробелы</p>
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
          <p className="text-xs text-slate">Балл симуляции обновляет skill map (EMA). Live AI не вызывался.</p>
        </section>
      )}
    </div>
  )
}
