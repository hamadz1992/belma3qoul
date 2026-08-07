import { useEffect, useState } from 'react'
import heroBanner from '../../assets/images/hero-banner.jpg'
import SectionHeading from '../../components/common/SectionHeading'
import { featuredPosts, socialLinks, siteConfig } from '../../constants/site'
import { getFacebookPosts, type FacebookPost } from '../../api/facebook'

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('ar-DZ', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

const platformAccent: Record<string, string> = {
  facebook: 'bg-[#1877F2] text-white',
  instagram: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white',
  whatsapp: 'bg-[#25D366] text-white',
  messenger: 'bg-[#006AFF] text-white',
  tiktok: 'bg-slate-950 text-white',
}

function getPlatformInitial(label: string) {
  return (label.trim()[0] || '•').toUpperCase()
}

function HomePage() {
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadPosts() {
      try {
        const data = await getFacebookPosts(4)
        if (isMounted) {
          setPosts(data)
          setError(null)
        }
      } catch (err) {
        console.error(err)
        if (isMounted) {
          setError('تعذر تحميل المنشورات الآن')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPosts()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="pb-12">
      <section id="home" className="border-b border-rose-100 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-950 p-4 shadow-2xl shadow-slate-200/70 sm:p-5 lg:p-6">
            <img
              src={heroBanner}
              alt="كل شيء بالمعقول"
              className="h-[260px] w-full rounded-[2rem] object-cover object-center sm:h-[380px] lg:h-[520px]"
            />
          </div>
        </div>
      </section>

      <section id="featured" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <SectionHeading
              eyebrow="روابط التواصل"
              title="تواصل معنا"
              description=""
            />

            <div className="mt-6 space-y-3">
              {socialLinks.map((link) => {
                const accentClass = platformAccent[link.platform] || 'bg-slate-900 text-white'

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 rounded-[1.3rem] border border-slate-100 bg-slate-50 px-4 py-3 transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${accentClass}`}
                    >
                      {getPlatformInitial(link.label)}
                    </span>

                    <div className="min-w-0 flex-1 text-right">
                      <p className="text-sm font-semibold text-slate-950">{link.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{link.hint}</p>
                    </div>

                    <span className="text-lg font-semibold text-slate-400">↗</span>
                  </a>
                )
              })}
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <SectionHeading
              eyebrow="المنشورات المميزة"
              title=""
              description=""
            />

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {featuredPosts.map((post) => (
                <article
                  key={post.title}
                  className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold tracking-[0.2em] text-rose-500 uppercase">
                      {post.platform}
                    </span>
                    {post.badge ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
                        {post.badge}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-950">{post.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{post.text}</p>

                  <a
                    href={post.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-rose-700 transition hover:text-rose-800"
                  >
                    عرض المنشور
                    <span aria-hidden="true">↗</span>
                  </a>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="latest" className="bg-white py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_1.25fr_1fr]">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                eyebrow="آخر المنشورات"
                  titleClassName="text-lg"
                title=" جديد في بزار كل شيء بالمعقول"
                descriptionClassName="text-sm leading-6"

              />

              {loading ? (
                <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                  جارٍ تحميل المنشورات...
                </div>
              ) : error ? (
                <div className="mt-8 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
                  {error}
                </div>
              ) : posts.length === 0 ? (
                <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                  لا توجد منشورات متاحة حاليًا.
                </div>
              ) : (
                <div className="mt-8 space-y-4">
                  {posts.map((post) => (
                    <a
                      key={post.id}
                      href={post.permalinkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-3 transition duration-300 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-white hover:shadow-sm"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt={post.message}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-rose-100 via-white to-fuchsia-100" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 text-right">
                        <div className="flex items-center justify-between gap-3">
                          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-rose-600 uppercase ring-1 ring-rose-100">
                            Facebook
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {formatDate(post.createdTime)}
                          </span>
                        </div>
                        <p
                          className="mt-2 text-[13px] leading-5 text-slate-600"
  style={{
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }}
>
  {post.message}
</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </article>

            <article
              id="location"
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <SectionHeading
                eyebrow="الموقع"
                title="الوصول إلى المحل"
               description="الاتجاه نحوى المحل."             />

              <div className="mt-6">
                <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-slate-50">
                  <iframe
                    title="خريطة الوصول إلى المحل"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(siteConfig.address)}&output=embed`}
                    className="h-64 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="p-4 text-right">
                    <p className="text-sm font-semibold text-slate-950">Google Maps</p>
                    <p className="mt-1 text-sm leading-7 text-slate-600">{siteConfig.address}</p>
                    <a
                      href={siteConfig.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
                    >
                      فتح الاتجاهات
                    </a>
                  </div>
                </div>
                             </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                eyebrow="نبذة عن المحل"
                title="كل شيء بالمعقول"
                description="محل شامل يوفّر المنتجات المتنوعة بأسعار مناسبة "              />

              <div className="mt-6 space-y-4 text-right">
                <p className="text-sm leading-7 text-slate-600">{siteConfig.description}</p>

                <div className="rounded-[1.4rem] bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-3 text-sm">
                    <span className="font-semibold text-slate-950">ساعات العمل</span>
                    <span className="text-slate-600">{siteConfig.hours}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-3 text-sm">
                    <span className="font-semibold text-slate-950">واتساب</span>
                    <span className="text-slate-600" dir="ltr">{siteConfig.whatsapp}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="font-semibold text-slate-950">العنوان</span>
                    <span className="max-w-[60%] text-slate-600">{siteConfig.address}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <a
                    href={siteConfig.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
