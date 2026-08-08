import { useEffect, useState } from 'react'
import { getFacebookPosts, type FacebookPost } from '../../api/facebook'

export default function FeaturedPostsPage() {
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getFacebookPosts(10)
        setPosts(data)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        <h1 className="mb-8 text-4xl font-bold">
          ⭐ إدارة المنشورات المميزة
        </h1>

        {loading ? (
          <p>جارٍ تحميل المنشورات...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="overflow-hidden rounded-3xl bg-white shadow"
              >
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    className="h-56 w-full object-cover"
                    alt=""
                  />
                )}

                <div className="p-5">

                  <p className="line-clamp-4 text-sm">
                    {post.message}
                  </p>

                  <button
  onClick={async () => {
    const response = await fetch('/api/admin/featured-posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    })

    const result = await response.json()

    if (result.success) {
      alert('✅ تم تثبيت المنشور')
    } else {
      alert('❌ فشل تثبيت المنشور')
    }
  }}
  className="mt-5 w-full rounded-xl bg-rose-600 py-3 text-white transition hover:bg-rose-700"
>
  📌 تثبيت المنشور
</button>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}