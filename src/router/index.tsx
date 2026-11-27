import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import HomePage from '../pages/Home/HomePage'
import PrizesPage from '../pages/PrizesPage'
import SurprisePage from '../pages/SurprisePage'
import SecureLoginPage from '../pages/admin/SecureLoginPage'
import DashboardPage from '../pages/admin/DashboardPage'
import AdminPrizesPage from '../pages/admin/PrizesPage'
import SiteSettingsPage from '../pages/admin/SiteSettingsPage'
import AdminGuard from '../pages/admin/AdminGuard'
import AdminLayout from '../pages/admin/AdminLayout'

function NotFoundPage() {
  return <Navigate to="/#home" replace />
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/admin" element={<SecureLoginPage />} />
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/prizes" element={<AdminPrizesPage />} />
          <Route path="/admin/settings" element={<SiteSettingsPage />} />
        </Route>
      </Route>
      <Route path="/surprise" element={<SurprisePage />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/prizes" element={<PrizesPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
