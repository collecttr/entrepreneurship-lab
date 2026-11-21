import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Short Russian title shown when something breaks */
  title?: string
  /** Optional Russian hint under the title */
  hint?: string
}

interface State {
  error: Error | null
}

/**
 * Catches render/lifecycle errors so a single page failure cannot blank the whole SPA.
 * Does not catch async/event-handler throws — those must be guarded at the source.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('ErrorBoundary:', error.message, info.componentStack)
  }

  private retry = () => {
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    const title = this.props.title ?? 'Что-то пошло не так'
    const hint =
      this.props.hint ??
      'Раздел временно недоступен. Нажмите «Повторить» или откройте другую страницу — приложение не нужно перезагружать.'

    return (
      <div className="surface rounded-3xl p-6 md:p-8" role="alert">
        <p className="text-[13px] font-medium text-slate">Ошибка</p>
        <h1 className="mt-1 font-display text-2xl tracking-tight text-ink">{title}</h1>
        <p className="mt-3 max-w-lg text-sm text-slate">{hint}</p>
        <button
          type="button"
          onClick={this.retry}
          className="mt-5 rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-on-accent hover:bg-teal-deep"
        >
          Повторить
        </button>
      </div>
    )
  }
}
