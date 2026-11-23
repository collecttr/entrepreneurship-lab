import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import { AdminRoute } from '@/components/AdminRoute'
import { AppShell } from '@/components/AppShell'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProgramPage } from '@/pages/ProgramPage'
import { WeekPage } from '@/pages/WeekPage'
import { LibraryPage } from '@/pages/LibraryPage'
import { AssignmentsPage } from '@/pages/AssignmentsPage'
import { AssignmentDetailPage } from '@/pages/AssignmentDetailPage'
import { SkillsPage } from '@/pages/SkillsPage'
import { AdminPage } from '@/pages/AdminPage'
import { ChatPage } from '@/pages/ChatPage'
import { ForumPage } from '@/pages/ForumPage'
import { ForumTopicPage } from '@/pages/ForumTopicPage'
import { DocumentsPage } from '@/pages/DocumentsPage'
import { DocumentDetailPage } from '@/pages/DocumentDetailPage'
import { AiPage } from '@/pages/AiPage'
import { AiTrainerPage } from '@/pages/AiTrainerPage'
import { ExamPage } from '@/pages/ExamPage'
import { NotFoundPage } from '@/pages/stubs'

const queryClient = new QueryClient()

function MarkAppReady() {
  useEffect(() => {
    document.getElementById('root')?.setAttribute('data-elab-ready', '1')
  }, [])
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary
          title="Приложение временно недоступно"
          hint="Произошла ошибка интерфейса. Нажмите «Повторить». Если не поможет — обновите страницу."
        >
          <BrowserRouter>
            <MarkAppReady />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/program" element={<ProgramPage />} />
                  <Route path="/program/weeks/:weekNumber" element={<WeekPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/assignments" element={<AssignmentsPage />} />
                  <Route path="/assignments/:id" element={<AssignmentDetailPage />} />
                  <Route path="/skills" element={<SkillsPage />} />
                  <Route path="/exams/:id" element={<ExamPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/forum" element={<ForumPage />} />
                  <Route path="/forum/:discussionId" element={<ForumTopicPage />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                  <Route path="/documents/:id" element={<DocumentDetailPage />} />
                  <Route path="/ai" element={<AiPage />} />
                  <Route path="/ai/:trainerSlug" element={<AiTrainerPage />} />
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminPage />} />
                  </Route>
                </Route>
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  )
}
