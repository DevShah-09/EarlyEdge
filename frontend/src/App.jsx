import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUp'
import UploadPage from './pages/UploadPage'
import DashboardPage from './pages/DashboardPage'
import PatientsPage from './pages/PatientsPage'
import PatientDetailPage from './pages/PatientDetailPage'
import RiskSimulatorPage from './pages/RiskSimulatorPage'
import ASHATasksPage from './pages/ASHATasksPage'
import ScreeningCampsPage from './pages/ScreeningCampsPage'
import CalendarPage from './pages/CalendarPage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Protected routes wrapped in Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/patients/:id" element={<PatientDetailPage />} />
                <Route path="/simulator" element={<RiskSimulatorPage />} />
                <Route path="/asha-tasks" element={<ASHATasksPage />} />
                <Route path="/screening-camps" element={<ScreeningCampsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
