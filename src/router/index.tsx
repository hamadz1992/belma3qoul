import { Navigate, Route, Routes } from 'react-router-dom'
import SettingsPage from '../pages/admin/SettingsPage'
import FacebookPage from '../pages/admin/FacebookPage'
import MainLayout from '../layouts/MainLayout'
import HomePage from '../pages/Home/HomePage'
import SecureLoginPage from '../pages/admin/SecureLoginPage'
import DashboardPage from '../pages/admin/DashboardPage'
import FeaturedPostsPage from '../pages/admin/FeaturedPostsPage'
import SiteSettingsPage from '../pages/admin/SiteSettingsPage'
import ContactLinksPage from '../pages/admin/ContactLinksPage'
import AdBoardPage from '../pages/admin/AdBoardPage'
import AdminGuard from '../pages/admin/AdminGuard'

function NotFoundPage() {
  return <Navigate to="/#home" replace />
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/admin" element={<SecureLoginPage />} />
      <Route element={<AdminGuard />}>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/featured-posts" element={<FeaturedPostsPage />} />
        <Route path="/admin/facebook" element={<FacebookPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/settings/site" element={<SiteSettingsPage />} />
        <Route path="/admin/contact-links" element={<ContactLinksPage />} />
        <Route path="/admin/ads" element={<AdBoardPage />} />
      </Route>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
