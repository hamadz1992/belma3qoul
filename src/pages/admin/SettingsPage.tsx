export default function SettingsPage() {
  function connectFacebook() {
    window.location.href = '/auth/facebook'
  }

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
              type="button"
              onClick={connectFacebook}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              🔗 ربط Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}