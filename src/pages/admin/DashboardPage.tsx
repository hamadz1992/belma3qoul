import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">لوحة التحكم</h1>
          <p className="mt-2 text-slate-500">مرحباً بك في لوحة إدارة كل شيء بالمعقول</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div onClick={() => navigate('/admin/facebook')} className="cursor-pointer rounded-3xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl">
            <h2 className="text-xl font-bold">📘 Facebook</h2>
            <p className="mt-3 text-slate-500">إدارة اتصال Facebook والمنشورات.</p>
          </div>

          <div onClick={() => navigate('/admin/featured-posts')} className="cursor-pointer rounded-3xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl">
            <h2 className="text-xl font-bold">⭐ المنشورات المميزة</h2>
            <p className="mt-3 text-slate-500">إدارة المنشورات المثبتة.</p>
          </div>

          <div onClick={() => navigate('/admin/ads')} className="cursor-pointer rounded-3xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl">
            <h2 className="text-xl font-bold">📢 لوحة الإعلانات</h2>
            <p className="mt-3 text-slate-500">منشور، صورة، بانر ثابت أو متحرك، وفيديو.</p>
          </div>

          <div onClick={() => navigate('/admin/contact-links')} className="cursor-pointer rounded-3xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl">
            <h2 className="text-xl font-bold">📱 روابط التواصل</h2>
            <p className="mt-3 text-slate-500">تعديل روابط التواصل.</p>
          </div>

          <div onClick={() => navigate('/admin/settings')} className="cursor-pointer rounded-3xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl">
            <h2 className="text-xl font-bold">⚙️ الإعدادات</h2>
            <p className="mt-3 text-slate-500">ربط Facebook وإعدادات الموقع.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
