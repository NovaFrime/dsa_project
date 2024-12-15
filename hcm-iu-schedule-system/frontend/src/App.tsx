import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import LoginPage from '@/pages/LoginPage'
import DashboardLayout from '@/layouts/DashboardLayout'
import UtilsPanel from '@/pages/UtilsPage'
import SettingsPage from '@/pages/SettingsPage'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster' 
import TimetablePanel from './pages/TimetablePage'
import GcsTimetablePage from './pages/gcsTimetablePage'
import GcsExamPage from './pages/gcsExamPage'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth()
  return auth && auth.isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/utils" replace />} />
              <Route path="utils" element={<UtilsPanel />} />
              <Route path="timetable" element={<TimetablePanel/>}/>
              <Route path="gcsExams" element={<GcsExamPage />} />
              <Route path="gcsTimetables" element={<GcsTimetablePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
        <Toaster /> 
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App