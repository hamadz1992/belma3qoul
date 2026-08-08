import { useNavigate } from 'react-router-dom'
export default function SettingsPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl">

        <h1 className="mb-8 text-4xl font-bold">
          ⚙️ الإعدادات
        </h1>

        <div className="grid gap-6">

          <div className="rounded-3xl bg-white p-6 shadow">

            <h2 className="text-2xl font-bold">
              Facebook
            </h2>

            <p className="mt-2 text-slate-500">
              ربط صفحة Facebook بالموقع.
            </p>

            <button
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              🔗 ربط Facebook
            </button>

          </div>
<div className="rounded-3xl bg-white p-6 shadow">
  <h2 className="text-2xl font-bold">
    🌐 إعدادات الموقع
  </h2>

  <p className="mt-2 text-slate-500">
    تعديل اسم المحل والوصف وبيانات التواصل.
  </p>

  <button
    onClick={() => navigate('/admin/settings/site')}
    className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
  >
    فتح إعدادات الموقع
  </button>
</div>
        </div>

      </div>
    </div>
  )
}