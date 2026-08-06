import { socialLinks, siteConfig } from '../../constants/site'
import BrandMark from './BrandMark'

function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-950 text-slate-200">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.75fr] lg:px-8">
        <div>
          <BrandMark compact />
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">{siteConfig.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-white/5 p-6">
          <h3 className="text-base font-semibold text-white">معلومات سريعة</h3>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-400">
            <li>{siteConfig.address}</li>
            <li>{siteConfig.hours}</li>
          </ul>
          <a
            href={siteConfig.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            فتح الاتجاهات
          </a>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. جميع الحقوق محفوظة.
          </p>
          <p>واجهة رسمية بسيطة وسريعة للمحل.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
