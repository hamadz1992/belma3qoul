import { Route, Routes, Navigate } from 'react-router-dom'

import MainLayout from '../layouts/MainLayout'
import HomePage from '../pages/Home/HomePage'

import LoginPage from '../pages/admin/LoginPage'
import DashboardPage from '../pages/admin/DashboardPage'
import FeaturedPostsPage from '../pages/admin/FeaturedPostsPage'
import SettingsPage from '../pages/admin/SettingsPage'

function NotFoundPage() {
  return <Navigate to="/#home" replace />
}

function AppRouter() {
  return (
    <Routes>
      {/* صفحات الإدارة */}
      <Route path="/admin" element={<LoginPage />} />
      <Route path="/admin/dashboard" element={<DashboardPage />} />
      <Route
        path="/admin/featured-posts"
        element={<FeaturedPostsPage />}
      />
      <Route
        path="/admin/settings"
        element={<SettingsPage />}
      />

      {/* الموقع الرئيسي */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* صفحة غير موجودة */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter