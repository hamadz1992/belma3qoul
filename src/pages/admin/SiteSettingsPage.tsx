import { useEffect, useState } from 'react'

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState({
    site: {
      name: '',
      description: '',
    },
  })

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()

      setSettings(data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold">
          🌐 إعدادات الموقع
        </h1>

        <div className="rounded-3xl bg-white p-8 shadow">

          <div className="mb-6">
            <label className="mb-2 block font-semibold">
              اسم المحل
            </label>

            <input
              type="text"
              value={settings.site.name}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  site: {
                    ...settings.site,
                    name: e.target.value,
                  },
                })
              }
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-semibold">
              الوصف
            </label>

            <textarea
              rows={8}
              value={settings.site.description}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  site: {
                    ...settings.site,
                    description: e.target.value,
                  },
                })
              }
              className="w-full rounded-xl border p-3"
            />
          </div>

          <button
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
          >
            💾 حفظ
          </button>

        </div>
      </div>
    </div>
  )
}