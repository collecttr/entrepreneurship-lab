import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const AppShell = lazy(() =>
  import('@/components/AppShell').then((m) => ({ default: m.AppShell })),
)
const AdminRoute = lazy(() =>
  import('@/components/AdminRoute').then((m) => ({ default: m.AdminRoute })),
)
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const ProgramPage = lazy(() =>
  import('@/pages/ProgramPage').then((m) => ({ default: m.ProgramPage })),
)
const WeekPage = lazy(() =>
  import('@/pages/WeekPage').then((m) => ({ default: m.WeekPage })),
)
const LibraryPage = lazy(() =>
  import('@/pages/LibraryPage').then((m) => ({ default: m.LibraryPage })),
)
const AssignmentsPage = lazy(() =>
  import('@/pages/AssignmentsPage').then((m) => ({ default: m.AssignmentsPage })),
)
const AssignmentDetailPage = lazy(() =>
  import('@/pages/AssignmentDetailPage').then((m) => ({ default: m.AssignmentDetailPage })),
)
const SkillsPage = lazy(() =>
  import('@/pages/SkillsPage').then((m) => ({ default: m.SkillsPage })),
)
const AdminPage = lazy(() =>
  import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })),
)
const ChatPage = lazy(() =>
  import('@/pages/ChatPage').then((m) => ({ default: m.ChatPage })),
)
const ForumPage = lazy(() =>
  import('@/pages/ForumPage').then((m) => ({ default: m.ForumPage })),
)
const ForumTopicPage = lazy(() =>
  import('@/pages/ForumTopicPage').then((m) => ({ default: m.ForumTopicPage })),
)
const DocumentsPage = lazy(() =>
  import('@/pages/DocumentsPage').then((m) => ({ default: m.DocumentsPage })),
)
const DocumentDetailPage = lazy(() =>
  import('@/pages/DocumentDetailPage').then((m) => ({ default: m.DocumentDetailPage })),
)
const AiPage = lazy(() => import('@/pages/AiPage').then((m) => ({ default: m.AiPage })))
const AiTrainerPage = lazy(() =>
  import('@/pages/AiTrainerPage').then((m) => ({ default: m.AiTrainerPage })),
)
const ExamPage = lazy(() =>
  import('@/pages/ExamPage').then((m) => ({ default: m.ExamPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/stubs').then((m) => ({ default: m.NotFoundPage })),
)

function MarkAppReady() {
  useEffect(() => {
    document.getElementById('root')?.setAttribute('data-elab-ready', '1')
  }, [])
  return null
}

function RouteFallback() {
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-md items-center justify-center px-4 text-center">
      <p className="text-sm text-slate">Загрузка раздела…</p>
    </div>
  )
}

function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary
        title="Приложение временно недоступно"
        hint="Произошла ошибка интерфейса. Нажмите «Повторить». Если не поможет — обновите страницу."
      >
        <BrowserRouter>
          <MarkAppReady />
          <Routes>
            <Route
              path="/login"
              element={
                <LazyRoute>
                  <LoginPage />
                </LazyRoute>
              }
            />
            <Route element={<ProtectedRoute />}>
              <Route
                element={
                  <LazyRoute>
                    <AppShell />
                  </LazyRoute>
                }
              >
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <LazyRoute>
                      <DashboardPage />
                    </LazyRoute>
                  }
                />
                <Route
                  path="/program"
                  element={
                    <LazyRoute>
                      <ProgramPage />
                    </LazyRoute>
                  }
                />
                <Route
                  path="/program/weeks/:weekNumber"
                  element={
                    <LazyRoute>
                      <WeekPage />
                    </LazyRoute>
                  }
                />
                <Route
                  path="/library"
                  element={
                    <LazyRoute>
                      <LibraryPage />
                    </LazyRoute>
                  }
                />
                <Route
                  path="/assignments"
                  element={
                    <LazyRoute>
                      <AssignmentsPage />
                    </LazyRoute>
                  }
                />
                <Route
                  path="/assignments/:id"
                  element={
                    <LazyRoute>
                      <AssignmentDetailPage />
                    </LazyRoute>
                  }
                />
                <Route
                  path="/skills"
                  element={
                    <LazyRoute>
                      <SkillsPage />
                    </LazyRoute>
                  }
                />
                <Route
                  path="/exams/:id"
                  element={
                    <LazyRoute>
                      <ExamPage />
                    </LazyRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <LazyRoute>
                      <ChatPage />
                    </LazyRoute>
                  }
                />
                <Route
                  path="/forum"
                  element={
                    <LazyRoute>
                      <ForumPage />
                    </LazyRoute>
                  }
                />
                <Route
                  path="/forum/:discussionId"
                  element={
                    <LazyRoute>
                      <ForumTopicPage />
                    </LazyRoute>
                  }
                />
                <Route
                  path="/documents"
                  element={
                    <LazyRoute>
                      <DocumentsPage />
                    </LazyRoute>
                  }
                />
                <Route
                  path="/documents/:id"
                  element={
                    <LazyRoute>
                      <DocumentDetailPage />
                    </LazyRoute>
                  }
                />
                <Route
                  path="/ai"
                  element={
                    <LazyRoute>
                      <AiPage />
                    </LazyRoute>
                  }
                />
                <Route
                  path="/ai/:trainerSlug"
                  element={
                    <LazyRoute>
                      <AiTrainerPage />
                    </LazyRoute>
                  }
                />
                <Route
                  element={
                    <LazyRoute>
                      <AdminRoute />
                    </LazyRoute>
                  }
                >
                  <Route
                    path="/admin"
                    element={
                      <LazyRoute>
                        <AdminPage />
                      </LazyRoute>
                    }
                  />
                </Route>
              </Route>
            </Route>
            <Route
              path="*"
              element={
                <LazyRoute>
                  <NotFoundPage />
                </LazyRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  )
}
