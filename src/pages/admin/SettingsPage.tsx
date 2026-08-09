import { useEffect, useState } from 'react'

type TickerSettings = { enabled: boolean; title: string; items: string[]; speed: number; direction: 'rtl' | 'ltr'; background: string; textColor: string; titleColor: string }
const defaults: TickerSettings = { enabled: true, title: 'آخر الأخبار', items: ['جديدنا أولاً بأول', 'تابعوا أحدث منشورات المحل', 'كل شيء بالمعقول — عروض ومنتجات جديدة'], speed: 30, direction: 'rtl', background: '#fff1f2', textColor: '#334155', titleColor: '#e11d48' }

export default function SettingsPage() {
  const [ticker, setTicker] = useState<TickerSettings>(defaults)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/settings', { cache: 'no-store' }).then((r) => r.json()).then((data) => { if (data?.newsTicker) setTicker({ ...defaults, ...data.newsTicker }) }).catch((error) => console.error(error)) }, [])
  function update<K extends keyof TickerSettings>(key: K, value: TickerSettings[K]) { setTicker((current) => ({ ...current, [key]: value })) }
  function updateItem(index: number, value: string) { setTicker((current) => ({ ...current, items: current.items.map((item, i) => i === index ? value : item) })) }
  function addItem() { setTicker((current) => ({ ...current, items: [...current.items, 'خبر جديد'] })) }
  function removeItem(index: number) { setTicker((current) => ({ ...current, items: current.items.filter((_, i) => i !== index) })) }
  async function saveTicker() {
    setSaving(true)
    try {
      const currentResponse = await fetch('/api/settings', { cache: 'no-store' })
      const current = await currentResponse.json()
      const response = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...current, newsTicker: ticker }) })
      if (!response.ok) throw new Error('Failed to save')
      alert('✅ تم حفظ الشريط الإخباري')
    } catch (error) { console.error(error); alert('❌ تعذر حفظ الشريط الإخباري') } finally { setSaving(false) }
  }
  function connectFacebook() { window.location.href = '/auth/facebook' }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold">⚙️ الإعدادات</h1>
        <div className="grid gap-6">
          <div className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold">📰 الشريط الإخباري</h2>
            <p className="mt-2 text-slate-500">هذا شريط مستقل عن المنشورات المميزة، ويمكنك التحكم بمحتواه وشكله من هنا.</p>
            <div className="mt-6 space-y-5">
              <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><span className="font-bold">تفعيل الشريط</span><input type="checkbox" checked={ticker.enabled} onChange={(e) => update('enabled', e.target.checked)} className="h-5 w-5 accent-rose-600" /></label>
              <div><label className="mb-2 block font-bold">العنوان</label><input value={ticker.title} onChange={(e) => update('title', e.target.value)} className="w-full rounded-xl border border-slate-200 p-3" /></div>
              <div><div className="mb-2 flex items-center justify-between"><label className="font-bold">الأخبار / العبارات</label><button type="button" onClick={addItem} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white">+ إضافة</button></div><div className="space-y-2">{ticker.items.map((item, index) => <div key={`${index}-${item}`} className="flex gap-2"><input value={item} onChange={(e) => updateItem(index, e.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 p-3" /><button type="button" onClick={() => removeItem(index)} className="rounded-xl border border-rose-200 px-3 text-rose-600">حذف</button></div>)}</div></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block font-bold">السرعة بالثواني</label><input type="number" min="8" max="120" value={ticker.speed} onChange={(e) => update('speed', Number(e.target.value))} className="w-full rounded-xl border border-slate-200 p-3" /></div><div><label className="mb-2 block font-bold">الاتجاه</label><select value={ticker.direction} onChange={(e) => update('direction', e.target.value as TickerSettings['direction'])} className="w-full rounded-xl border border-slate-200 p-3"><option value="rtl">من اليمين إلى اليسار</option><option value="ltr">من اليسار إلى اليمين</option></select></div></div>
              <div className="grid gap-4 sm:grid-cols-3"><label><span className="mb-2 block font-bold">الخلفية</span><input type="color" value={ticker.background} onChange={(e) => update('background', e.target.value)} className="h-12 w-full rounded-xl" /></label><label><span className="mb-2 block font-bold">النص</span><input type="color" value={ticker.textColor} onChange={(e) => update('textColor', e.target.value)} className="h-12 w-full rounded-xl" /></label><label><span className="mb-2 block font-bold">العنوان</span><input type="color" value={ticker.titleColor} onChange={(e) => update('titleColor', e.target.value)} className="h-12 w-full rounded-xl" /></label></div>
              <button type="button" onClick={saveTicker} disabled={saving} className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? '⏳ جارٍ الحفظ...' : '💾 حفظ الشريط الإخباري'}</button>
            </div>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow"><h2 className="text-2xl font-bold">Facebook</h2><p className="mt-2 text-slate-500">ربط صفحة Facebook بالموقع.</p><button type="button" onClick={connectFacebook} className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">🔗 ربط Facebook</button></div>
        </div>
      </div>
    </div>
  )
}
