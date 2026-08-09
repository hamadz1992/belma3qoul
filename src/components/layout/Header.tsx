import { useEffect, useState } from 'react'
import { siteConfig } from '../../constants/site'
import BrandMark from './BrandMark'

type HeaderProps = { onMenuClick: () => void }
type SocialSettings = { facebook: string; instagram: string; tiktok: string; telegram: string; youtube: string }

const socialPlatforms = [
  { key: 'facebook', label: 'Facebook', hint: 'تابع صفحتنا', platform: 'facebook' },
  { key: 'instagram', label: 'Instagram', hint: 'شاهد الصور', platform: 'instagram' },
  { key: 'whatsapp', label: 'WhatsApp', hint: 'تواصل مباشر', platform: 'whatsapp' },
  { key: 'messenger', label: 'Messenger', hint: 'رسالة فورية', platform: 'messenger' },
  { key: 'tiktok', label: 'TikTok', hint: 'تابع الڤيديوهات', platform: 'tiktok' },
] as const

const platformAccent: Record<string, string> = {
  facebook: 'bg-[#1877F2] text-white',
  instagram: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white',
  whatsapp: 'bg-[#25D366] text-white',
  messenger: 'bg-[#006AFF] text-white',
  tiktok: 'bg-slate-950 text-white',
}

function getPlatformInitial(label: string) { return (label.trim()[0] || '•').toUpperCase() }

function Header({ onMenuClick }: HeaderProps) {
  const [social, setSocial] = useState<SocialSettings>({ facebook: '', instagram: '', tiktok: '', telegram: '', youtube: '' })
  useEffect(() => { let mounted = true; fetch('/api/settings', { cache: 'no-store' }).then((response) => response.json()).then((data) => { if (mounted && data?.social) setSocial((current) => ({ ...current, ...data.social })) }).catch((error) => console.error('Failed to load social links:', error)); return () => { mounted = false } }, [])
  const links = socialPlatforms.map((link) => ({ ...link, href: link.key === 'whatsapp' ? `https://wa.me/${siteConfig.whatsapp.replace(/\D/g, '')}` : link.key === 'messenger' ? siteConfig.messengerUrl : social[link.key as keyof SocialSettings] }))

  return (
    <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a href="#home" aria-label="Belma3qoul" className="shrink-0"><BrandMark compact /></a>
        <div className="hidden flex-1 items-center justify-end gap-2 xl:flex">
          {links.filter((link) => Boolean(link.href?.trim())).map((link) => { const accentClass = platformAccent[link.platform] || 'bg-slate-900 text-white'; return <a key={link.key} href={link.href} target="_blank" rel="noreferrer" title={link.label} className="flex min-w-[135px] items-center gap-3 rounded-[1.3rem] border border-slate-100 bg-slate-50 px-3 py-2 transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${accentClass}`}>{getPlatformInitial(link.label)}</span><div className="min-w-0 flex-1 text-right"><p className="truncate text-xs font-semibold text-slate-950">{link.label}</p><p className="mt-0.5 truncate text-[10px] text-slate-500">{link.hint}</p></div><span className="text-sm font-semibold text-slate-400">↗</span></a> })}
        </div>
        <div className="ml-auto flex items-center gap-3 xl:hidden">
          <a href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-[1.2rem] border border-slate-100 bg-slate-50 px-3 py-2 transition hover:border-rose-200 hover:bg-rose-50"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-xs font-bold text-white shadow-sm">W</span><span className="text-xs font-semibold text-slate-950">WhatsApp</span></a>
          <button type="button" onClick={onMenuClick} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50" aria-label="فتح القائمة"><span className="space-y-1.5"><span className="block h-0.5 w-5 rounded-full bg-current" /><span className="block h-0.5 w-5 rounded-full bg-current" /><span className="block h-0.5 w-5 rounded-full bg-current" /></span></button>
        </div>
      </div>
    </header>
  )
}

export default Header
