import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Share2 } from 'lucide-react'
import { useT } from '../context/LanguageContext'

function SoleiaLogoSmall() {
  return (
    <svg width="28" height="22" viewBox="0 0 46 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M10 28C10 20.82 15.59 15 23 15C30.41 15 36 20.82 36 28" stroke="#C9A882" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M7 31.5Q14.5 27.5 23 31.5Q31.5 35.5 39 31.5" stroke="#C9A882" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <line x1="23" y1="12" x2="23" y2="6.5"  stroke="#C9A882" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="31.5" y1="14.5" x2="34.5" y2="10.5" stroke="#C9A882" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="14.5" y1="14.5" x2="11.5" y2="10.5" stroke="#C9A882" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="37.5" y1="20.5" x2="41.5" y2="18" stroke="#C9A882" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="8.5"  y1="20.5" x2="4.5"  y2="18" stroke="#C9A882" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

function InstagramIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  )
}

export default function Footer() {
  const T = useT()
  return (
    <footer className="bg-[#1C1917] text-[#A8A29E]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <SoleiaLogoSmall />
              <span className="font-display font-medium text-xl text-white" style={{ letterSpacing: '-0.02em' }}>soleia</span>
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-[#C9A882] mb-4">{T.footer_tagline}</p>
            <p className="text-sm leading-relaxed text-[#78716C]">{T.footer_desc}</p>
            <div className="flex gap-4 mt-6">
              <a href="#" aria-label="Instagram" className="hover:text-[#C9A882] transition-colors duration-200 cursor-pointer">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Share" className="hover:text-[#C9A882] transition-colors duration-200 cursor-pointer">
                <Share2 className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">{T.footer_services}</h4>
            <ul className="space-y-2.5 text-sm">
              {T.footer_service_links.map(s => (
                <li key={s}><Link to="/services" className="hover:text-[#C9A882] transition-colors duration-200">{s}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">{T.footer_company}</h4>
            <ul className="space-y-2.5 text-sm">
              {T.footer_company_links.map(p => (
                <li key={p}><a href="#" className="hover:text-[#C9A882] transition-colors duration-200 cursor-pointer">{p}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">{T.footer_contact}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-[#C9A882] mt-0.5 shrink-0" /><span>Limassol & Nicosia, Cyprus</span></li>
              <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-[#C9A882] shrink-0" /><span>+357 25 000 000</span></li>
              <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-[#C9A882] shrink-0" /><span>hello@soleia.cy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#5C5652]">
          <p>{T.footer_copyright}</p>
          <p>{T.footer_made}</p>
        </div>
      </div>
    </footer>
  )
}
