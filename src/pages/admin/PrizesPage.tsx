import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

type Prize = {
  id: string
  title: string
  description: string
  imageUrl: string
  details: string
  published: boolean
}

const emptyPrize = { title: '', description: '', imageUrl: '', details: '', published: true }

export default function AdminPrizesPage() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [form, setForm] = useState(emptyPrize)
  const [editingId, setEditingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadPrizes() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/prizes?admin=1', { credentials: 'same-origin', cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'تعذر تحميل الجوائز')
      setPrizes(Array.isArray(data.prizes) ? data.prizes : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تحميل الجوائز')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadPrizes() }, [])

  function resetForm() {
    setForm(emptyPrize)
    setEditingId('')
  }

  function editPrize(prize: Prize) {
    setForm({ title: prize.title, description: prize.description, imageUrl: prize.imageUrl, details: prize.details, published: prize.published })
    setEditingId(prize.id)
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function savePrize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/prizes', {
        method: editingId ? 'PUT' : 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.error || 'تعذر حفظ الجائزة')
      resetForm()
      setNotice(editingId ? 'تم تحديث الجائزة بنجاح.' : 'تمت إضافة الجائزة بنجاح.')
      await loadPrizes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر حفظ الجائزة')
    } finally {
      setSaving(false)
    }
  }

  async function deletePrize(id: string) {
    if (!window.confirm('هل أنت متأكد من حذف هذه الجائزة؟')) return
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/prizes?id=${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'same-origin' })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.error || 'تعذر حذف الجائزة')
      if (editingId === id) resetForm()
      setPrizes((current) => current.filter((prize) => prize.id !== id))
      setNotice('تم حذف الجائزة.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر حذف الجائزة')
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm font-bold text-rose-600">إدارة الموقع</p><h1 className="mt-1 text-3xl font-extrabold text-slate-950">🎁 إدارة الجوائز</h1><p className="mt-2 text-sm text-slate-500">أضف الجوائز وعدّلها وحدد ما يظهر للزوار.</p></div>
          <a href="/prizes" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:border-rose-300">معاينة صفحة الجوائز ↗</a>
        </div>

        <form onSubmit={savePrize} className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-5 text-xl font-extrabold">{editingId ? 'تعديل الجائزة' : 'إضافة جائزة جديدة'}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold">اسم الجائزة *
              <input required maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-rose-500" placeholder="مثال: قسيمة شراء" />
            </label>
            <label className="block text-sm font-semibold">رابط صورة الجائزة
              <input type="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} dir="ltr" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-left font-normal outline-none focus:border-rose-500" placeholder="https://..." />
            </label>
            <label className="block text-sm font-semibold md:col-span-2">وصف مختصر
              <textarea rows={3} maxLength={1500} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-rose-500" placeholder="اكتب وصفًا يظهر في بطاقة الجائزة." />
            </label>
            <label className="block text-sm font-semibold md:col-span-2">التفاصيل وشروط المشاركة
              <textarea rows={3} maxLength={1500} value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-rose-500" placeholder="أضف تفاصيل أو شروطًا إضافية (اختياري)." />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} className="h-4 w-4 accent-rose-600" /> نشر الجائزة للزوار</label>
            <div className="flex gap-2">
              {editingId && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold">إلغاء التعديل</button>}
              <button disabled={saving} type="submit" className="rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60">{saving ? 'جارٍ الحفظ...' : editingId ? 'حفظ التعديلات' : 'إضافة الجائزة'}</button>
            </div>
          </div>
        </form>

        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</div>}
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold">الجوائز المسجلة</h2><span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-bold">{prizes.length} جائزة</span></div>
        {loading ? <div className="rounded-2xl bg-white p-8 text-center text-slate-500">جارٍ تحميل الجوائز...</div> : prizes.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">لم تضف أي جائزة بعد.</div> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prizes.map((prize) => <article key={prize.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {prize.imageUrl ? <img src={prize.imageUrl} alt={prize.title} className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50 text-5xl">🎁</div>}
              <div className="p-4"><div className="mb-2 flex items-center justify-between gap-2"><h3 className="font-extrabold">{prize.title}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${prize.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{prize.published ? 'منشورة' : 'مسودة'}</span></div><p className="line-clamp-2 min-h-10 text-sm text-slate-500">{prize.description || 'لا يوجد وصف.'}</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => editPrize(prize)} className="flex-1 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-bold hover:bg-slate-200">تعديل</button><button type="button" onClick={() => void deletePrize(prize.id)} className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100">حذف</button></div></div>
            </article>)}
          </div>
        )}
      </div>
    </main>
  )
}
