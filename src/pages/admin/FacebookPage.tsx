export default function FacebookPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl">

        <h1 className="mb-8 text-4xl font-bold">
          📘 Facebook
        </h1>

        <div className="rounded-3xl bg-white p-8 shadow">

          <div className="space-y-4">

            <div className="flex items-center justify-between border-b pb-4">
              <span className="font-semibold">الحالة</span>
              <span className="rounded-full bg-red-100 px-4 py-1 text-red-700">
                غير متصل
              </span>
            </div>

            <div className="flex items-center justify-between border-b py-4">
              <span className="font-semibold">الصفحة</span>
              <span className="text-slate-500">—</span>
            </div>

            <div className="flex items-center justify-between border-b py-4">
              <span className="font-semibold">آخر مزامنة</span>
              <span className="text-slate-500">—</span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="font-semibold">انتهاء الصلاحية</span>
              <span className="text-slate-500">—</span>
            </div>

          </div>

          <div className="mt-8 flex flex-wrap gap-4">

            <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
              🔗 ربط Facebook
            </button>

            <button className="rounded-xl bg-slate-800 px-6 py-3 font-semibold text-white hover:bg-slate-900">
              🔄 اختبار الاتصال
            </button>

            <button className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">
              📥 جلب المنشورات
            </button>

          </div>

        </div>

      </div>
    </div>
  )
}