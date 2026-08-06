import { navLinks } from '../../constants/site'

function Navbar() {
  return (
    <div className="hidden border-b border-slate-100/80 bg-white/80 backdrop-blur-md md:block">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}

export default Navbar
