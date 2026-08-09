import { useEffect, useState } from 'react'

type AdType = 'post' | 'image' | 'banner' | 'slider' | 'video'
type AdSettings = {
  enabled: boolean
  type: AdType
  title: string
  text: string
  imageUrl: string
  videoUrl: string
  linkUrl: string
  slides: string[]
  autoplayMs: number
}

type Settings = Record<string, unknown> & { ads?: AdSettings }

const defaults: AdSettings = {
  enabled: true,
  type: 'banner',
  title: 'عروض خاصة لك',
  text: '',
  imageUrl: '',
  videoUrl: '',
  linkUrl: '',
  slides: [],
  autoplayMs: 4000,
}

export default function AdBoardPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [ads, setAds] = useState<AdSettings>(defaults)
  const [slideText, setSlideText] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    try {
      const response = await fetch('/api/settings', { cache: 'no-store' })
      const data = await response.json()
      setSettings(data || {})
      setAds({ ...defaults, ...(data?.ads || {}) })
    } catch (error) {
      console.error(error)
      setMessage('تعذر تحميل إعدادات الإعلان')
    }
  }

  async function save() {
    setSaving(true)
    setMessage('')
    try {
      const nextSettings = { ...settings, ads }
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextSettings),
      })
      if (!response.ok) throw new Error('save failed')
      setSettings(nextSettings)
      setMessage('✅ تم حفظ لوحة الإعلانات')
    } catch (error) {
      console.error(error)
      setMessage('❌ تعذر حفظ لوحة الإعلانات')
    } finally {
      setSaving(false)
    }
  }

  function addSlides() {
    const urls = slideText.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean)
    if (!urls.length) return
    setAds((current) => ({ ...current, slides: [...current.slides, ...urls] }))
    setSlideText('')
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8" dir="rtl">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-950">📢 لوحة الإعلانات</h1>
            <p className="mt-2 text-sm text-slate-500">تحكم في الإعلان الذي يظهر مكان روابط التواصل في الصفحة الرئيسية.</p>
          </div>
          <button onClick={() => void save()} disabled={saving} className="rounded-xl bg-rose-600 px-6 py-3 font-bold text-white hover:bg-rose-700 disabled:opacity-50">
            {saving ? 'جاري الحفظ...' : '💾 حفظ الإعلان'}
          </button>
        </div>

        {message && <div className="mb-6 rounded-xl bg-white p-4 text-sm shadow">{message}</div>}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl bg-white p-6 shadow">
            <label className="mb-3 flex items-center justify-between font-bold">
              <span>تفعيل لوحة الإعلانات</span>
              <input type="checkbox" checked={ads.enabled} onChange={(e) => setAds({ ...ads, enabled: e.target.checked })} className="h-5 w-5" />
            </label>

            <label className="mb-2 block font-semibold">نوع الإعلان</label>
            <select value={ads.type} onChange={(e) => setAds({ ...ads, type: e.target.value as AdType })} className="mb-5 w-full rounded-xl border p-3">
              <option value="post">📝 منشور إعلاني</option>
              <option value="image">🖼️ صورة إعلان</option>
              <option value="banner">🖥️ بانر ثابت</option>
              <option value="slider">🎞️ بانر متحرك</option>
              <option value="video">▶️ إعلان فيديو</option>
            </select>

            {(ads.type === 'post' || ads.type === 'image' || ads.type === 'banner' || ads.type === 'slider') && <>
              <label className="mb-2 block font-semibold">رابط الصورة / البانر</label>
              <input value={ads.imageUrl} onChange={(e) => setAds({ ...ads, imageUrl: e.target.value })} className="mb-5 w-full rounded-xl border p-3" dir="ltr" placeholder="https://..." />
            </>}

            {ads.type === 'video' && <>
              <label className="mb-2 block font-semibold">رابط الفيديو</label>
              <input value={ads.videoUrl} onChange={(e) => setAds({ ...ads, videoUrl: e.target.value })} className="mb-5 w-full rounded-xl border p-3" dir="ltr" placeholder="https://.../video.mp4" />
            </>}

            {(ads.type === 'post' || ads.type === 'image') && <>
              <label className="mb-2 block font-semibold">العنوان</label>
              <input value={ads.title} onChange={(e) => setAds({ ...ads, title: e.target.value })} className="mb-5 w-full rounded-xl border p-3" />
              <label className="mb-2 block font-semibold">نص الإعلان</label>
              <textarea rows={4} value={ads.text} onChange={(e) => setAds({ ...ads, text: e.target.value })} className="mb-5 w-full rounded-xl border p-3" />
            </>}

            {ads.type === 'slider' && <>
              <label className="mb-2 block font-semibold">صور البانر المتحرك</label>
              <textarea rows={4} value={slideText} onChange={(e) => setSlideText(e.target.value)} className="mb-2 w-full rounded-xl border p-3" dir="ltr" placeholder="ضع رابط كل صورة في سطر مستقل" />
              <button type="button" onClick={addSlides} className="mb-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">➕ إضافة الصور</button>
              {ads.slides.length > 0 && <div className="mb-5 space-y-2">{ads.slides.map((url, index) => <div key={`${url}-${index}`} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2"><span className="min-w-0 flex-1 truncate text-xs" dir="ltr">{url}</span><button type="button" onClick={() => setAds((current) => ({ ...current, slides: current.slides.filter((_, i) => i !== index) }))} className="rounded bg-red-100 px-2 py-1 text-red-700">حذف</button></div>)}</div>}
              <label className="mb-2 block font-semibold">مدة الانتقال (مللي ثانية)</label>
              <input type="number" min={1500} step={500} value={ads.autoplayMs} onChange={(e) => setAds({ ...ads, autoplayMs: Number(e.target.value) || 4000 })} className="mb-5 w-full rounded-xl border p-3" dir="ltr" />
            </>}

            <label className="mb-2 block font-semibold">الرابط عند الضغط</label>
            <input value={ads.linkUrl} onChange={(e) => setAds({ ...ads, linkUrl: e.target.value })} className="w-full rounded-xl border p-3" dir="ltr" placeholder="https://..." />
          </section>

          <section className="rounded-3xl bg-white p-5 shadow">
            <h2 className="mb-4 text-lg font-bold">معاينة</h2>
            <div className="overflow-hidden rounded-2xl border bg-slate-50">
              {ads.type === 'video' && ads.videoUrl ? <video src={ads.videoUrl} controls className="h-64 w-full bg-black object-cover" /> : ads.type === 'slider' && ads.slides.length ? <img src={ads.slides[0]} alt="معاينة الإعلان" className="h-64 w-full object-cover" /> : ads.imageUrl ? <img src={ads.imageUrl} alt="معاينة الإعلان" className="h-64 w-full object-cover" /> : <div className="flex h-64 items-center justify-center p-6 text-center text-slate-400">أدخل رابط صورة أو فيديو لرؤية المعاينة</div>}
              {(ads.type === 'post' || ads.type === 'image') && (ads.title || ads.text) && <div className="p-4 text-right"><h3 className="font-bold">{ads.title}</h3><p className="mt-2 text-sm text-slate-600">{ads.text}</p></div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
