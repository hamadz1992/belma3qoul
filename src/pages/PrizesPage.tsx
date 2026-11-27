import { useEffect, useState } from 'react'

type Prize = { id: string; title: string; description: string; imageUrl: string; details: string }

export default function PrizesPage() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/prizes', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'تعذر تحميل الجوائز')
        if (active) setPrizes(Array.isArray(data.prizes) ? data.prizes : [])
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'تعذر تحميل الجوائز') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <main dir="rtl" className="min-h-screen bg-[#f5f7fb] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-9 overflow-hidden rounded-[2rem] bg-gradient-to-l from-rose-700 via-rose-600 to-amber-500 px-6 py-10 text-center text-white shadow-lg sm:px-10">
          <div className="mb-3 text-5xl">🎁</div>
          <p className="text-sm font-bold tracking-wide text-rose-100">كل شيء بالمعقول</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">جوائزنا وعروضنا</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/90">اكتشف الجوائز المتاحة وتعرّف على تفاصيلها وشروط المشاركة.</p>
        </header>
        {loading ? <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">جارٍ تحميل الجوائز...</div> : error ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">{error}</div> : prizes.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">لا توجد جوائز منشورة حاليًا. تابعنا لمعرفة الجديد.</div> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {prizes.map((prize) => <article key={prize.id} className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              {prize.imageUrl ? <img src={prize.imageUrl} alt={prize.title} loading="lazy" className="h-56 w-full object-cover" /> : <div className="flex h-56 items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50 text-6xl">🎁</div>}
              <div className="p-5"><h2 className="text-xl font-extrabold text-slate-900">{prize.title}</h2><p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{prize.description}</p>{prize.details ? <details className="mt-4 border-t border-slate-100 pt-3"><summary className="cursor-pointer text-sm font-bold text-rose-600">التفاصيل وشروط المشاركة</summary><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{prize.details}</p></details> : null}</div>
            </article>)}
          </div>
        )}
      </div>
    </main>
  )
}
