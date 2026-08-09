import { useNavigate } from 'react-router-dom'

export default function AdminBackButton() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate('/admin/dashboard')}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-rose-300 hover:text-rose-600 hover:shadow"
    >
      <span aria-hidden="true">→</span>
      العودة إلى لوحة التحكم
    </button>
  )
}
