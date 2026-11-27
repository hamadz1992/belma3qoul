import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const navigate = useNavigate()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => undefined)
    navigate('/admin', { replace: true })
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-rose-600">كل شيء بالمعقول</p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-950">لوحة الإدارة</h1>
            <p className="mt-2 text-slate-500">إدارة الجوائز وإعدادات الموقع من مكان واحد.</p>
          </div>
          <button onClick={() => void logout()} className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-rose-300 hover:text-rose-600">تسجيل الخروج</button>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <button type="button" onClick={() => navigate('/admin/prizes')} className="rounded-3xl border border-rose-100 bg-white p-7 text-right shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <span className="text-4xl">🎁</span><h2 className="mt-4 text-xl font-extrabold text-slate-950">إدارة الجوائز</h2><p className="mt-2 text-sm leading-7 text-slate-500">إضافة الجوائز وتعديلها وحذفها والتحكم في ظهورها للزوار.</p><span className="mt-5 inline-block font-bold text-rose-600">فتح إدارة الجوائز ←</span>
          </button>
          <button type="button" onClick={() => navigate('/admin/settings')} className="rounded-3xl border border-slate-200 bg-white p-7 text-right shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <span className="text-4xl">⚙️</span><h2 className="mt-4 text-xl font-extrabold text-slate-950">إعدادات الموقع</h2><p className="mt-2 text-sm leading-7 text-slate-500">تعديل اسم الموقع والوصف ومعلومات الاتصال وروابط التواصل.</p><span className="mt-5 inline-block font-bold text-rose-600">فتح الإعدادات ←</span>
          </button>
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          صفحة الجوائز العامة: <a href="/prizes" target="_blank" rel="noreferrer" className="font-bold text-rose-600 underline">فتح صفحة الجوائز</a>
        </div>
      </div>
    </main>
  )
}
