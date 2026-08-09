import { useEffect, useState } from 'react'
import heroBanner from '../../assets/images/hero-banner.jpg'
import SectionHeading from '../../components/common/SectionHeading'
import { siteConfig } from '../../constants/site'
import { getFacebookPosts, type FacebookPost } from '../../api/facebook'

type SiteSettings = {
  name: string
  description: string
  phone: string
  whatsapp: string
  address: string
  hours: string
  googleMaps: string
}

type SocialSettings = {
  facebook: string
  instagram: string
  tiktok: string
  telegram: string
  youtube: string
}

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

function normalizeUrl(value: string, fallback: string) {
  if (!value) return fallback

  const markdownMatch = value.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/)
  if (markdownMatch) return markdownMatch[2]

  return value
}

type FeaturedPost = {
  id: string
  message?: string
  createdTime?: string
  permalinkUrl?: string
  imageUrl?: string
}

function HomePage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    name: siteConfig.name || '',
    description: siteConfig.description || '',
    phone: '',
    whatsapp: siteConfig.whatsapp || '',
    address: siteConfig.address || '',
    hours: siteConfig.hours || '',
    googleMaps: siteConfig.mapsUrl || '',
  })

  const [socialSettings, setSocialSettings] = useState<SocialSettings>({
    facebook: '',
    instagram: '',
    tiktok: '',
    telegram: '',
    youtube: '',
  })

  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadSettings() {
      try {
        const response = await fetch('/api/settings')
        if (!response.ok) throw new Error('Failed to load settings')

        const data = await response.json()
        if (isMounted) {
          if (data?.site) setSiteSettings((current) => ({ ...current, ...data.site }))
          if (data?.social) setSocialSettings((current) => ({ ...current, ...data.social }))
        }
      } catch (error) {
        console.error('Failed to load site settings:', error)
      }
    }

    void loadSettings()
    return () => {
      isMounted = false
    }
  }, [])

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
        if (isMounted) setError('تعذر تحميل المنشورات الآن')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadPosts()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadFeaturedPosts() {
      try {
        const response = await fetch('/api/admin/featured-posts', { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to load featured posts')

        const data = await response.json()
        if (isMounted) setFeaturedPosts(Array.isArray(data?.posts) ? data.posts : [])
      } catch (error) {
        console.error('Failed to load featured posts:', error)
        if (isMounted) setFeaturedPosts([])
      } finally {
        if (isMounted) setFeaturedLoading(false)
      }
    }

    void loadFeaturedPosts()
    return () => {
      isMounted = false
    }
  }, [])

  const mapsUrl = normalizeUrl(siteSettings.googleMaps, siteConfig.mapsUrl)

  return (
    <div className="pb-12">
      <section id="home" className="border-b border-rose-100 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-950 p-4 shadow-2xl shadow-slate-200/70 sm:p-5 lg:p-6">
            <img src={heroBanner} alt={siteSettings.name} className="h-[260px] w-full rounded-[2rem] object-cover object-center sm:h-[380px] lg:h-[520px]" />
          </div>
        </div>
      </section>

      <section id="featured" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <SectionHeading eyebrow="روابط التواصل" title="تواصل معنا" description="" descriptionClassName="text-sm leading-6" />
            <div className="mt-6 space-y-3">
              {[
                { platform: 'facebook', label: 'Facebook', hint: 'صفحتنا على Facebook', href: socialSettings.facebook },
                { platform: 'instagram', label: 'Instagram', hint: 'تابعنا على Instagram', href: socialSettings.instagram },
                { platform: 'tiktok', label: 'TikTok', hint: 'تابعنا على TikTok', href: socialSettings.tiktok },
                { platform: 'telegram', label: 'Telegram', hint: 'قناتنا على Telegram', href: socialSettings.telegram },
                { platform: 'youtube', label: 'YouTube', hint: 'قناتنا على YouTube', href: socialSettings.youtube },
              ].filter((link) => Boolean(link.href.trim())).map((link) => {
                const accentClass = platformAccent[link.platform] || 'bg-slate-900 text-white'
                return (
                  <a key={link.platform} href={normalizeUrl(link.href, '#')} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-[1.3rem] border border-slate-100 bg-slate-50 px-4 py-3 transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${accentClass}`}>{getPlatformInitial(link.label)}</span>
                    <div className="min-w-0 flex-1 text-right"><p className="text-sm font-semibold text-slate-950">{link.label}</p><p className="mt-1 text-xs text-slate-500">{link.hint}</p></div>
                    <span className="text-lg font-semibold text-slate-400">↗</span>
                  </a>
                )
              })}

              {!Object.values(socialSettings).some((value) => value.trim()) ? (
                <div className="rounded-[1.3rem] border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">أضف روابط الشبكات الاجتماعية من لوحة التحكم لتظهر هنا.</div>
              ) : null}
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <SectionHeading eyebrow="المنشورات المميزة" title="" description="" />
            {featuredLoading ? (
              <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">جارٍ تحميل المنشورات المميزة...</div>
            ) : featuredPosts.length === 0 ? (
              <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">لا توجد منشورات مميزة حاليًا.</div>
            ) : (
              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {featuredPosts.map((post) => (
                  <article key={post.id} className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-slate-50 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                    {post.imageUrl ? <img src={post.imageUrl} alt="" className="h-48 w-full object-cover" loading="lazy" /> : null}
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold tracking-[0.2em] text-rose-500 uppercase">Facebook</span><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">مثبت</span></div>
                      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{post.message || 'منشور بدون نص'}</p>
                      <div className="mt-5 flex items-center justify-between gap-3"><span className="text-xs text-slate-500">{formatDate(post.createdTime || '')}</span>{post.permalinkUrl ? <a href={post.permalinkUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-rose-700 transition hover:text-rose-800">عرض المنشور ↗</a> : null}</div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>

      <section id="latest" className="bg-white py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_1.25fr_1fr]">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading eyebrow="آخر المنشورات" titleClassName="text-lg" title={`جديد في ${siteSettings.name}`} description="" descriptionClassName="text-sm leading-6" />
              {loading ? (
                <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">جارٍ تحميل المنشورات...</div>
              ) : error ? (
                <div className="mt-8 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">{error}</div>
              ) : posts.length === 0 ? (
                <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">لا توجد منشورات متاحة حاليًا.</div>
              ) : (
                <div className="mt-8 space-y-4">
                  {posts.map((post) => (
                    <a key={post.id} href={post.permalinkUrl} target="_blank" rel="noreferrer" className="flex gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-3 transition duration-300 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-white hover:shadow-sm">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">{post.imageUrl ? <img src={post.imageUrl} alt={post.message} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-rose-100 via-white to-fuchsia-100" />}</div>
                      <div className="min-w-0 flex-1 text-right">
                        <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-rose-600 uppercase ring-1 ring-rose-100">Facebook</span><span className="text-[11px] text-slate-500">{formatDate(post.createdTime)}</span></div>
                        <p className="mt-2 text-[13px] leading-5 text-slate-600" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.message}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </article>

            <article id="location" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading eyebrow="الموقع" title="الاتجاه نحو المحل." titleClassName="text-lg" description="" descriptionClassName="text-sm leading-6" />
              <div className="mt-6"><div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-slate-50">
                <iframe title="خريطة الوصول إلى المحل" src={`https://www.google.com/maps?q=${encodeURIComponent(siteSettings.address)}&output=embed`} className="h-64 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                <div className="p-4 text-right"><p className="text-sm font-semibold text-slate-950">Google Maps</p><p className="mt-1 text-sm leading-7 text-slate-600">{siteSettings.address}</p><a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700">فتح الاتجاهات</a></div>
              </div></div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading eyebrow="نبذة عن المحل" title={siteSettings.name} titleClassName="text-lg" description="" descriptionClassName="text-sm leading-6" />
              <div className="mt-6 space-y-4 text-right">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">{siteSettings.description}</p>
                <div className="rounded-[1.4rem] bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-3 text-sm"><span className="font-semibold text-slate-950">ساعات العمل</span><span className="whitespace-pre-line text-slate-600">{siteSettings.hours}</span></div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-3 text-sm"><span className="font-semibold text-slate-950">الهاتف</span><span className="text-slate-600" dir="ltr">{siteSettings.phone}</span></div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-3 text-sm"><span className="font-semibold text-slate-950">واتساب</span><span className="text-slate-600" dir="ltr">{siteSettings.whatsapp}</span></div>
                  <div className="flex items-center justify-between gap-4 py-3 text-sm"><span className="font-semibold text-slate-950">العنوان</span><span className="max-w-[60%] text-slate-600">{siteSettings.address}</span></div>
                </div>
                <div className="flex flex-wrap gap-3 pt-1"><a href={siteConfig.facebookUrl} target="_blank" rel="noreferrer" className="rounded-full bg-[#1877F2] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#166FE5]">Facebook</a><a href={`https://wa.me/${siteSettings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#20BD5A]">WhatsApp</a></div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
