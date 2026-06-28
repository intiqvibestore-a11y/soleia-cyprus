import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Search, MapPin, Calendar, Clock } from 'lucide-react'
import { useT } from '../context/LanguageContext'

const CATEGORIES = [
  { name: 'Hair & styling',       icon: <><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M19 5L8.5 15.5M14 14l5 5M8.5 8.5l3.5 3.5"/></> },
  { name: 'Nails',                icon: <><rect x="8" y="2" width="8" height="11" rx="4"/><path d="M6 17h12a1 1 0 011 1v2a1 1 0 01-1 1H6a1 1 0 01-1-1v-2a1 1 0 011-1z"/></> },
  { name: 'Hair removal',         icon: <><rect x="4" y="9" width="16" height="7" rx="2"/><path d="M8 9V7a4 4 0 018 0v2M12 12v2"/></> },
  { name: 'Eyebrows & eyelashes', icon: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></> },
  { name: 'Facials & skincare',   icon: <><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M9 15.5a4.5 4.5 0 006 0"/></> },
  { name: 'Massage',              icon: <><path d="M19 11V9a2 2 0 00-4 0v1m0 0V8a2 2 0 00-4 0v2m0 0V9a2 2 0 00-4 0v6c0 3.5 3 6 7 6h1c3 0 5-2 5-5v-5a2 2 0 00-4 0v1"/></> },
  { name: 'Makeup',               icon: <><path d="M12 2v6m0 0c-1.5 0-3 1-3 2.5V15a3 3 0 006 0v-4.5C15 9 13.5 8 12 8z"/><path d="M9 20h6"/><path d="M12 15v5"/></> },
  { name: 'Aesthetics',           icon: <><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></> },
  { name: 'Barbering',            icon: <><path d="M5 3h14M5 3l2.5 4M19 3l-2.5 4m-9 0h9m-9 0L5 21m12-14L19 21M5 21h14"/></> },
  { name: 'Spa & wellness',       icon: <><path d="M12 22V12m0 0C12 7 7 4 2 6c0 5 3 9 10 9m0-9c0-5 5-8 10-6 0 5-3 9-10 9"/></> },
  { name: 'Body & skin',          icon: <><circle cx="12" cy="5" r="2.5"/><path d="M8 10.5h8l1 9H7l1-9z"/><path d="M10 10.5v5m4-5v5"/></> },
  { name: 'Tattoo & piercing',    icon: <><path d="M6 7l3-4 7 14-3 4L6 7z"/><path d="M9 3l7 14M6 7l10 4"/></> },
  { name: 'Holistic health',      icon: <><path d="M12 21C12 21 4 16 4 10a8 8 0 0116 0c0 6-8 11-8 11z"/><path d="M12 21V10m-4 3l4-3 4 3"/></> },
  { name: 'Dental',               icon: <><path d="M9 4c-2 0-4 1.5-4 4 0 3.5 2 6.5 3 9h8c1-2.5 3-5.5 3-9 0-2.5-2-4-4-4-1 0-2 .5-3 .5S10 4 9 4z"/><path d="M12 4.5V10"/></> },
]

function CatIcon({ paths }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
      {paths}
    </svg>
  )
}

const RECENTS_KEY = 'soleia-recents'
function getRecents() { try { return JSON.parse(localStorage.getItem(RECENTS_KEY)) || [] } catch { return [] } }
function saveRecent(q) {
  const next = [q, ...getRecents().filter(r => r !== q)].slice(0, 5)
  localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
}
function clearRecents() { localStorage.removeItem(RECENTS_KEY) }

export default function SearchPage() {
  const T = useT()
  const navigate = useNavigate()
  const [treatment, setTreatment] = useState('')
  const [location, setLocation] = useState('')
  const [recents, setRecents] = useState(getRecents)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const doSearch = (q = treatment, city = location) => {
    const trimQ = (q || '').trim()
    if (trimQ) saveRecent(trimQ)
    const params = new URLSearchParams()
    if (trimQ) params.set('q', trimQ)
    if (city && city.trim()) params.set('city', city.trim())
    navigate(`/services?${params.toString()}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') doSearch()
  }

  return (
    <div
      className="fixed inset-0 top-0 z-[350] bg-[#FDFAF7] flex flex-col"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-full bg-white border border-[#E8E0D8] flex items-center justify-center shrink-0 hover:bg-[#F5F0EB] transition-colors"
        >
          <X className="w-4 h-4 text-[#1C1917]" />
        </button>
        <h2 className="font-display font-semibold text-[18px] text-[#1C1917]">
          {T.search_modal_title}
        </h2>
      </div>

      {/* Input card */}
      <div className="mx-4 mb-5 bg-white rounded-2xl border border-[#E8E0D8] shadow-[0_2px_12px_rgba(28,25,23,0.07)] shrink-0">
        {/* Treatment */}
        <div className="flex items-center gap-3 px-4 py-4">
          <Search className="w-4 h-4 text-[#C9A882] shrink-0" />
          <input
            type="text"
            value={treatment}
            onChange={e => setTreatment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={T.search_modal_treatment_ph}
            autoFocus
            className="flex-1 text-[15px] text-[#1C1917] placeholder-[#B8AEA6] outline-none bg-transparent"
          />
          {treatment && (
            <button onClick={() => setTreatment('')} className="w-5 h-5 rounded-full bg-[#E8E0D8] flex items-center justify-center shrink-0">
              <X className="w-3 h-3 text-[#78716C]" />
            </button>
          )}
        </div>

        <div className="h-px bg-[#F0EAE3] mx-4" />

        {/* Location */}
        <div className="flex items-center gap-3 px-4 py-4">
          <MapPin className="w-4 h-4 text-[#C9A882] shrink-0" />
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={T.search_modal_location_ph}
            className="flex-1 text-[15px] text-[#1C1917] placeholder-[#B8AEA6] outline-none bg-transparent"
          />
          {location && (
            <button onClick={() => setLocation('')} className="w-5 h-5 rounded-full bg-[#E8E0D8] flex items-center justify-center shrink-0">
              <X className="w-3 h-3 text-[#78716C]" />
            </button>
          )}
        </div>

        <div className="h-px bg-[#F0EAE3] mx-4" />

        {/* Date (static) */}
        <div className="flex items-center gap-3 px-4 py-4">
          <Calendar className="w-4 h-4 text-[#C9A882] shrink-0" />
          <span className="text-[15px] text-[#B8AEA6]">{T.search_anytime}</span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 pb-28">

        {/* Recent searches */}
        {recents.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E]">
                {T.search_recent}
              </h3>
              <button
                onClick={() => { clearRecents(); setRecents([]) }}
                className="text-[12px] text-[#78716C] hover:text-[#1C1917] font-medium transition-colors"
              >
                {T.search_clear}
              </button>
            </div>
            {recents.map((r, i) => (
              <button
                key={i}
                onClick={() => doSearch(r)}
                className="flex items-center gap-3 w-full py-3 border-b border-[#F5F0EB] last:border-none text-left px-1"
              >
                <Clock className="w-4 h-4 text-[#C9A882] shrink-0" />
                <span className="text-[14px] text-[#1C1917]">{r}</span>
              </button>
            ))}
          </div>
        )}

        {/* Categories */}
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E] mb-3">
          {T.search_categories}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => doSearch(name, '')}
              className="flex items-center gap-3 px-3 py-3.5 rounded-2xl bg-white border border-[#E8E0D8] hover:border-[#C9A882] hover:bg-[#FDF8F2] transition-all text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F5F0EB] flex items-center justify-center shrink-0 text-[#4A403A]">
                <CatIcon paths={icon} />
              </div>
              <span className="text-[13px] font-medium text-[#1C1917] leading-tight">
                {T.cat_display[name] || name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Fixed bottom button */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pt-3 pb-4 bg-[#FDFAF7] border-t border-[#F0EAE3]"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => doSearch()}
          className="w-full bg-[#1C1917] hover:bg-[#2C2A28] active:bg-[#2C2A28] text-white font-semibold py-4 rounded-full text-[15px] transition-colors"
        >
          {T.search_btn}
        </button>
      </div>
    </div>
  )
}
