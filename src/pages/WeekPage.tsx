import type { ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { HowtoCollapse } from '@/components/HowtoCollapse'
import { getModule, getWeek, mandatoryMinutesForSlot } from '@/data/curriculum'
import { getInterview } from '@/data/interviews'
import {
  ASSESSMENT_FAIL_RETELL_RU,
  FEEDBACK_EVIDENCE_SUMMARY_RU,
  INTERVIEW_EXTRACT_RULE_RU,
  INTERVIEW_EXTRACT_SUMMARY_RU,
  RESEARCH_FORMAT_STEPS_RU,
  RESEARCH_FORMAT_SUMMARY_RU,
  SOURCE_EXTRACT_RULE_RU,
  SOURCE_EXTRACT_SUMMARY_RU,
} from '@/data/research-method'
import { getSource } from '@/data/sources'
import {
  STUDY_GUIDE_STEPS_RU,
  STUDY_GUIDE_SUMMARY_RU,
  STUDY_GUIDE_TITLE_RU,
  STUDY_MINUTES_CAP,
} from '@/data/study-guide'
import { useAuth } from '@/context/AuthContext'
import { getUnlockedWeek, isWeekUnlocked } from '@/lib/progress-store'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="surface rounded-3xl p-5 md:p-6">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-slate">{children}</div>
    </section>
  )
}

export function WeekPage() {
  const { weekNumber } = useParams()
  const n = Number(weekNumber)
  const week = getWeek(n)
  const { profile } = useAuth()
  const unlocked = getUnlockedWeek()

  if (!week || !Number.isFinite(n)) return <Navigate to="/program" replace />

  const isAdmin = profile?.role === 'admin'
  if (!isWeekUnlocked(n, unlocked) && !isAdmin) {
    return (
      <div className="surface rounded-3xl p-6">
        <h1 className="font-display text-2xl">Неделя {n} закрыта</h1>
        <p className="mt-2 text-slate">
          Админ ещё не открыл эту неделю (сейчас доступны недели 1–{unlocked}).
        </p>
        <Link to="/program" className="mt-4 inline-block font-semibold text-teal">
          ← К программе
        </Link>
      </div>
    )
  }

  const mod = getModule(n)
  const slot = profile?.participant_slot ?? 'A'
  const mins = mandatoryMinutesForSlot(week, slot)
  const own = slot === 'B' ? week.assignment_b : week.assignment_a
  const interviews = week.interview_ids.map((id) => getInterview(id)).filter(Boolean)

  return (
    <div className="space-y-4">
      <header className="surface rounded-2xl p-4 md:rounded-3xl md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">
          {mod.title_ru} · неделя {n}
        </p>
        <h1 className="mt-2 font-display text-2xl text-ink md:text-3xl">{week.title_ru}</h1>
        <p className="mt-2 text-sm text-slate">
          Обязательная нагрузка (вариант {slot}): <strong className="text-ink">{mins} мин</strong> /{' '}
          {STUDY_MINUTES_CAP} (~4 ч)
          {mins > STUDY_MINUTES_CAP && <span className="text-danger"> — превышение!</span>}
        </p>
        <p className="mt-2 text-sm text-ink">
          Навык исследования: <strong>{week.research_skill_label_ru}</strong>
          {week.find_own_sources ? ' · нужен свой источник' : ''}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {week.topic_tags_ru.map((t) => (
            <span key={t} className="rounded-lg bg-mist px-2.5 py-1 text-xs text-ink">
              {t}
            </span>
          ))}
        </div>
        <Link to="/program" className="mt-3 inline-block text-sm font-semibold text-teal">
          ← Все недели
        </Link>
      </header>

      <Section title={STUDY_GUIDE_TITLE_RU}>
        <HowtoCollapse summary={STUDY_GUIDE_SUMMARY_RU}>
          <ol className="list-decimal space-y-2 pl-5 text-ink">
            {STUDY_GUIDE_STEPS_RU.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </HowtoCollapse>
        <p className="mt-3 rounded-xl bg-mist/80 px-3 py-2 text-ink">{ASSESSMENT_FAIL_RETELL_RU}</p>
      </Section>

      <Section title="Формат исследования (9 шагов)">
        <HowtoCollapse summary={RESEARCH_FORMAT_SUMMARY_RU}>
          <ol className="list-decimal space-y-2 pl-5 text-ink">
            {RESEARCH_FORMAT_STEPS_RU.map((s) => (
              <li key={s.id}>
                <strong>{s.title_ru}.</strong> {s.hint_ru}
              </li>
            ))}
          </ol>
        </HowtoCollapse>
      </Section>

      <Section title="1. Исследовательский вопрос">
        <p className="text-lg font-medium text-ink">{week.research_question_ru}</p>
        <p className="mt-3 text-slate">Готовый ответ не выдаём — его нужно собрать из доказательств.</p>
      </Section>

      <Section title="2. Контекст: зачем этот вопрос">
        <p className="text-ink">{week.context_why_ru}</p>
        <p className="mt-2 text-slate">Фон недели: {week.problem_ru}</p>
      </Section>

      <Section title="Короткая теория">
        <p className="text-ink">{week.theory_short_ru}</p>
      </Section>

      <Section title="Ключевые понятия">
        <div className="flex flex-wrap gap-2">
          {week.concepts.map((c) => (
            <span key={c} className="rounded-lg bg-teal-soft/60 px-2.5 py-1 text-ink">
              {c}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Стартовые примеры (не готовый ответ)">
        <ul className="list-disc space-y-1 pl-5 text-ink">
          {week.starter_examples_ru.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </Section>

      <Section title="5. Вопросы к анализу материалов">
        <ul className="list-disc space-y-1 pl-5 text-ink">
          {week.open_questions_ru.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </Section>

      <Section title="6–8. Фиксация, сравнение, вывод">
        <p className="text-ink">
          <strong>Фиксация:</strong> {week.capture_prompt_ru}
        </p>
        <p className="mt-2 text-ink">
          <strong>Сравнение:</strong> {week.compare_prompt_ru}
        </p>
        <p className="mt-2 text-ink">
          <strong>Практический итог (один главный):</strong> {week.practical_task_ru}
        </p>
      </Section>

      <Section title="Результаты обучения">
        <ul className="list-disc space-y-1 pl-5 text-ink">
          {week.outcomes.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </Section>

      <Section title="3. Рекомендуемые источники (доказательная база)">
        <HowtoCollapse summary={SOURCE_EXTRACT_SUMMARY_RU} className="mb-3">
          <p>{SOURCE_EXTRACT_RULE_RU}</p>
        </HowtoCollapse>
        <ul className="space-y-3">
          {week.sources.map((link) => {
            const s = getSource(link.source_id)
            if (!s) return null
            return (
              <li key={link.source_id} className="rounded-2xl bg-paper/80 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-teal hover:underline"
                  >
                    {s.title_ru}
                  </a>
                  <span className="text-xs text-slate">{s.provider}</span>
                  <span className="rounded bg-mist px-1.5 text-[10px] font-semibold uppercase">
                    {link.is_mandatory ? 'обязательно' : 'по желанию'}
                  </span>
                  <span className="text-xs text-slate">{link.study_minutes_planned} мин</span>
                </div>
                <p className="mt-1 text-ink">
                  <strong>Зачем:</strong> {s.why_ru}
                </p>
                <HowtoCollapse
                  className="mt-1"
                  summary={
                    <>
                      <strong className="text-ink">Что извлечь:</strong> {s.understand_ru}
                    </>
                  }
                >
                  <p>
                    <strong className="text-ink">Что смотреть в материале:</strong> {s.parts_ru}
                  </p>
                  {s.questions_ru.length > 0 && (
                    <ul className="mt-1 list-disc pl-5 text-ink">
                      {s.questions_ru.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                  )}
                </HowtoCollapse>
              </li>
            )
          })}
        </ul>
        {week.find_own_sources && (
          <p className="mt-3 rounded-xl bg-mist/80 px-3 py-2 text-ink">
            <strong>4. Самостоятельный поиск:</strong> найдите ≥1 источник вне обязательного списка
            (URL + интерес автора + почему можно доверять).
          </p>
        )}
      </Section>

      {interviews.length > 0 && (
        <Section title="Интервью как доказательства (не биографии)">
          <HowtoCollapse summary={INTERVIEW_EXTRACT_SUMMARY_RU} className="mb-3">
            <p>{INTERVIEW_EXTRACT_RULE_RU}</p>
          </HowtoCollapse>
          <p className="mb-3 text-slate">
            Не всё обязательно. Best-fit под вопрос недели; остальное — в{' '}
            <Link to="/library?tab=interviews" className="font-semibold text-teal hover:underline">
              библиотеке
            </Link>
            .
          </p>
          <ul className="space-y-3">
            {interviews.map((i) =>
              i ? (
                <li key={i.id} className="rounded-2xl bg-paper/80 p-3">
                  <a
                    href={i.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-teal hover:underline"
                  >
                    {i.title_ru}
                  </a>
                  <p className="mt-1 text-ink">
                    {i.person} · {i.role_ru} · {i.company}
                    {i.duration_minutes != null ? ` · ~${i.duration_minutes} мин` : ''}
                  </p>
                  <HowtoCollapse
                    className="mt-2"
                    summary={
                      <>
                        <strong>Зачем:</strong> {i.topics.slice(0, 3).join(', ')}. Итог:{' '}
                        {i.practical_task_ru}
                      </>
                    }
                  >
                    <p className="text-ink">
                      <strong>Зачем (подробно):</strong> {i.why_read_ru}
                    </p>
                    <p className="mt-1 text-ink">
                      <strong>Что извлечь:</strong> {i.extract_ru}
                    </p>
                    <ul className="mt-1 list-disc pl-5 text-ink">
                      {i.analysis_questions_ru.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                    {i.timestamps.length > 0 && (
                      <p className="mt-2 text-xs text-slate">
                        Таймкоды: {i.timestamps.map((t) => `${t.at} ${t.label_ru}`).join(' · ')}
                      </p>
                    )}
                  </HowtoCollapse>
                </li>
              ) : null,
            )}
          </ul>
        </Section>
      )}

      {week.company_research && (
        <Section title={week.company_research.title_ru}>
          <p className="text-ink">{week.company_research.prompt_ru}</p>
          <p className="mt-2 text-ink">
            <strong>Сравнение:</strong> {week.company_research.compare_focus_ru}
          </p>
          <p className="mt-2 text-slate">
            Примеры: {week.company_research.company_examples_ru.join(' · ')}
          </p>
          <ul className="mt-2 list-disc pl-5 text-ink">
            {week.company_research.evidence_required_ru.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Section>
      )}

      {week.campaign_analysis && (
        <Section title={week.campaign_analysis.title_ru}>
          <p className="text-ink">{week.campaign_analysis.campaign_hint_ru}</p>
          <p className="mt-2 font-medium text-ink">Поля разбора:</p>
          <ul className="mt-1 list-disc pl-5">
            {week.campaign_analysis.fields_ru.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="mt-3 text-ink">
            <strong>9. Применение — ваша альтернатива:</strong>{' '}
            {week.campaign_analysis.alternative_task_ru}
          </p>
        </Section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title={`Задание A · ${week.assignment_a.code}`}>
          <p className="font-medium text-ink">{week.assignment_a.title_ru}</p>
          <p className="mt-2 whitespace-pre-wrap">{week.assignment_a.brief_md}</p>
          <p className="mt-2 text-xs">≤ {week.assignment_a.max_minutes} мин</p>
          {slot === 'A' && (
            <Link
              to={`/assignments/${week.assignment_a.code}`}
              className="mt-3 inline-block font-semibold text-teal"
            >
              Сдать задание A →
            </Link>
          )}
        </Section>
        <Section title={`Задание B · ${week.assignment_b.code}`}>
          <p className="font-medium text-ink">{week.assignment_b.title_ru}</p>
          <p className="mt-2 whitespace-pre-wrap">{week.assignment_b.brief_md}</p>
          <p className="mt-2 text-xs">≤ {week.assignment_b.max_minutes} мин</p>
          {slot === 'B' && (
            <Link
              to={`/assignments/${week.assignment_b.code}`}
              className="mt-3 inline-block font-semibold text-teal"
            >
              Сдать задание B →
            </Link>
          )}
        </Section>
      </div>

      <Section title={`Совместное · ${week.joint.code}`}>
        <p className="font-medium text-ink">{week.joint.title_ru}</p>
        <p className="mt-2 whitespace-pre-wrap">{week.joint.brief_md}</p>
        <Link to={`/assignments/${week.joint.code}`} className="mt-3 inline-block font-semibold text-teal">
          Сдать совместное →
        </Link>
      </Section>

      <Section title="Практика продаж (каждую неделю)">
        <p className="text-ink">{week.sales_drill_ru}</p>
      </Section>

      <Section title="Дебаты (по желанию)">
        <p className="text-ink">{week.debate_ru}</p>
      </Section>

      <Section title="Кейс (по желанию)">
        <p className="text-ink">{week.case_ru}</p>
      </Section>

      <Section title="Симуляция (по желанию)">
        <p className="text-ink">{week.simulation_ru}</p>
      </Section>

      <Section title="Рубрика оценки исследования">
        <p className="mb-3 text-ink">{week.no_retell_ru}</p>
        <ul className="space-y-2">
          {week.rubric.map((c) => (
            <li key={c.id} className="rounded-xl bg-paper/80 px-3 py-2">
              <span className="font-medium text-ink">
                {c.label} ({c.max_score})
              </span>
              <p>{c.description}</p>
            </li>
          ))}
        </ul>
        <HowtoCollapse
          className="mt-3 rounded-xl bg-mist/80 px-3 py-2"
          summary={FEEDBACK_EVIDENCE_SUMMARY_RU}
        >
          <p className="text-ink">{week.feedback_guide_ru}</p>
        </HowtoCollapse>
      </Section>

      <Section title="Рефлексия">
        <ul className="list-disc space-y-1 pl-5 text-ink">
          {week.reflection.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Section>

      <Section title="Типичные ошибки недели">
        <ul className="list-disc space-y-1 pl-5 text-danger">
          {week.error_watchlist.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </Section>

      <p className="text-xs text-slate">
        Ваше основное задание (вариант {slot}): <strong>{own.code}</strong> — {own.title_ru}
      </p>
    </div>
  )
}
