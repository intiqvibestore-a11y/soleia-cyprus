import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Star, ChevronRight, ChevronLeft, Shield, Clock, MapPin, ChevronDown, Search, X, Calendar } from 'lucide-react'
import { useT } from '../context/LanguageContext'
import { supabase } from '../utils/supabase/client'
import LocationModal, { loadLocation } from '../components/LocationModal'

const FALLBACK_GRADIENTS = [
  'from-[#E8D5B7] to-[#C9A882]',
  'from-[#F2E3D9] to-[#DBBAA8]',
  'from-[#DDD5CC] to-[#BFB4A8]',
  'from-[#D5E0D5] to-[#A8BEA8]',
  'from-[#E8D9D5] to-[#C9AFA8]',
  'from-[#D9E0E8] to-[#A8B5C9]',
]

const WHY_ICONS = [Shield, Clock, Star]

const HOME_CATEGORIES = [
  { key: '',                       label: 'Όλα',                    icon: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></> },
  { key: 'Μαλλιά και χτένισμα',   label: 'Μαλλιά και χτένισμα',   icon: <><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M19 5L8.5 15.5M14 14l5 5M8.5 8.5l3.5 3.5"/></> },
  { key: 'Φρύδια & βλεφαρίδες',   label: 'Φρύδια & βλεφαρίδες',   icon: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></> },
  { key: 'Μασάζ',                 label: 'Μασάζ',                  icon: <><path d="M19 11V9a2 2 0 00-4 0v1m0 0V8a2 2 0 00-4 0v2m0 0V9a2 2 0 00-4 0v6c0 3.5 3 6 7 6h1c3 0 5-2 5-5v-5a2 2 0 00-4 0v1"/></> },
  { key: 'Σπα και σάουνα',        label: 'Σπα και σάουνα',         icon: <><path d="M12 22V12m0 0C12 7 7 4 2 6c0 5 3 9 10 9m0-9c0-5 5-8 10-6 0 5-3 9-10 9"/></> },
  { key: 'Νύχια',                 label: 'Νύχια',                  icon: <><rect x="8" y="2" width="8" height="11" rx="4"/><path d="M6 17h12a1 1 0 011 1v2a1 1 0 01-1 1H6a1 1 0 01-1-1v-2a1 1 0 011-1z"/></> },
  { key: 'Αποτρίχωση',            label: 'Αποτρίχωση',             icon: <><rect x="4" y="9" width="16" height="7" rx="2"/><path d="M8 9V7a4 4 0 018 0v2M12 12v2"/></> },
  { key: 'Περιποίηση προσώπου',   label: 'Περιποίηση προσώπου',    icon: <><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M9 15.5a4.5 4.5 0 006 0"/></> },
  { key: 'Κουρείο',               label: 'Κουρείο',                icon: <><path d="M5 3h14M5 3l2.5 4M19 3l-2.5 4m-9 0h9m-9 0L5 21m12-14L19 21M5 21h14"/></> },
  { key: 'Αισθητικές υπηρεσίες', label: 'Αισθητικές υπηρεσίες',  icon: <><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></> },
]

function HomeCatIcon({ paths, large }) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className={large ? 'w-8 h-8' : 'w-6 h-6'}
    >
      {paths}
    </svg>
  )
}

function HomeSearchModal({ onClose, selectedLocation, onOpenLocation }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 120)
    return () => clearTimeout(t)
  }, [])

  const goSearch = (catKey) => {
    const params = new URLSearchParams()
    const q = catKey !== undefined ? catKey : query
    if (q) params.set('q', q)
    const qs = params.toString()
    navigate(`/services${qs ? '?' + qs : ''}`)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[400] flex flex-col"
      style={{ background: 'white', overscrollBehavior: 'contain' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 shrink-0">
        <span className="text-[22px] font-bold" style={{ color: '#1C1917' }}>Αναζήτηση</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 0 }}
        >
          <X className="w-6 h-6" style={{ color: '#1C1917' }} />
        </button>
      </div>

      {/* Input rows */}
      <div className="px-5 flex flex-col gap-3 shrink-0">
        {/* Search */}
        <div
          className="flex items-center gap-3 px-4 rounded-2xl"
          style={{ height: 52, border: '1.5px solid #E8E0D8' }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: '#A8A29E' }} strokeWidth={1.7} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && goSearch()}
            placeholder="Οποιεσδήποτε θεραπείες, χώροι ή επαγγελμ..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 15, color: '#1C1917', border: 'none' }}
          />
        </div>

        {/* Location */}
        <button
          onClick={onOpenLocation}
          className="flex items-center gap-3 px-4 rounded-2xl cursor-pointer text-left"
          style={{ height: 52, border: '1.5px solid #E8E0D8', background: 'white' }}
        >
          <MapPin className="w-4 h-4 shrink-0" style={{ color: '#A8A29E' }} strokeWidth={1.7} />
          <span style={{ fontSize: 15, color: '#1C1917' }}>
            {selectedLocation?.label || 'Τρέχουσα τοποθεσία'}
          </span>
        </button>

        {/* Date */}
        <div
          className="flex items-center gap-3 px-4 rounded-2xl"
          style={{ height: 52, border: '1.5px solid #E8E0D8' }}
        >
          <Calendar className="w-4 h-4 shrink-0" style={{ color: '#A8A29E' }} strokeWidth={1.7} />
          <span style={{ fontSize: 15, color: '#A8A29E' }}>Οποιαδήποτε στιγμή</span>
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-2">
        <p className="text-[18px] font-bold mb-4" style={{ color: '#1C1917' }}>Κατηγορίες</p>
        <div className="grid grid-cols-2 gap-3">
          {HOME_CATEGORIES.map(({ key, label, icon }) => (
            <button
              key={key || 'all'}
              onClick={() => goSearch(key)}
              className="flex flex-col items-center gap-3 py-5 px-3 rounded-2xl cursor-pointer"
              style={{ border: '1.5px solid #E8E0D8', background: '#FAFAFA' }}
            >
              <HomeCatIcon paths={icon} large />
              <span className="text-[13px] font-medium text-center leading-snug" style={{ color: '#1C1917' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom button */}
      <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid #F0EAE3' }}>
        <button
          onClick={() => goSearch()}
          className="w-full py-4 rounded-full font-semibold cursor-pointer"
          style={{ background: '#1C1917', color: 'white', border: 'none', fontSize: 16 }}
        >
          Αναζήτηση
        </button>
      </div>
    </div>
  )
}

function BusinessCard({ business, index }) {
  const gradient = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length]
  return (
    <Link
      to={`/business/${business.id}`}
      className="shrink-0 w-[240px] sm:w-[280px] group"
      style={{ textDecoration: 'none' }}
    >
      <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '3 / 2' }}>
        {business.cover_url ? (
          <img
            src={business.cover_url}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} transition-transform duration-300 group-hover:scale-105`} />
        )}
      </div>
      <div className="pt-2.5 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base leading-tight" style={{ color: '#3D2B1F' }}>{business.name}</h3>
          {business.rating != null && (
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold" style={{ color: '#1C1917' }}>{Number(business.rating).toFixed(1)}</span>
            </div>
          )}
        </div>
        <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
          {[business.city, business.category].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  )
}

function EmptyPlaceholder() {
  return (
    <div className="shrink-0 flex items-center justify-center rounded-2xl px-6 py-8" style={{ minWidth: 220, background: '#F0EBE5' }}>
      <p className="text-[13px] text-center" style={{ color: '#A8A29E' }}>Σύντομα διαθέσιμα καταστήματα</p>
    </div>
  )
}

function ScrollRow({ children, label }) {
  const ref = useRef(null)
  const scroll = (dir) => { if (ref.current) ref.current.scrollBy({ left: dir * 280, behavior: 'smooth' }) }
  return (
    <section className="py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="font-display font-medium text-xl sm:text-3xl text-[#1C1917]">{label}</h2>
          <div className="hidden sm:flex gap-2">
            <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-full border border-[#E8E0D8] flex items-center justify-center hover:border-[#C9A882] hover:text-[#C9A882] transition-colors cursor-pointer text-[#78716C]" aria-label="Scroll left">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll(1)} className="w-9 h-9 rounded-full border border-[#E8E0D8] flex items-center justify-center hover:border-[#C9A882] hover:text-[#C9A882] transition-colors cursor-pointer text-[#78716C]" aria-label="Scroll right">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div ref={ref} className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {children}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const T = useT()
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [locModalOpen, setLocModalOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)

  useEffect(() => {
    setSelectedLocation(loadLocation())
    const handler = () => setSelectedLocation(loadLocation())
    window.addEventListener('soleia_location_changed', handler)
    return () => window.removeEventListener('soleia_location_changed', handler)
  }, [])

  useEffect(() => {
    supabase
      .from('businesses')
      .select('*')
      .limit(10)
      .then(({ data, error }) => {
        console.log('businesses:', data, error)
        if (data?.length) setBusinesses(data)
      })
  }, [])

  return (
    <div style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }}>
      {locModalOpen && (
        <LocationModal
          onClose={() => setLocModalOpen(false)}
          onSelect={(loc) => setSelectedLocation(loc)}
        />
      )}

      {searchModalOpen && (
        <HomeSearchModal
          onClose={() => setSearchModalOpen(false)}
          selectedLocation={selectedLocation}
          onOpenLocation={() => setLocModalOpen(true)}
        />
      )}

      <section>
        <div className="flex flex-col px-4 sm:px-5 pt-8 pb-6 sm:pt-12 sm:pb-8">

          {/* Location picker */}
          <div className="mb-5">
            <button
              onClick={() => setLocModalOpen(true)}
              className="flex items-center gap-2 cursor-pointer"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <MapPin className="w-5 h-5 shrink-0" style={{ color: '#1C1917' }} strokeWidth={2} />
              <span className="text-[15px] font-semibold" style={{ color: '#1C1917' }}>
                {selectedLocation?.label || 'Τρέχουσα τοποθεσία'}
              </span>
              <ChevronDown className="w-4 h-4 shrink-0" style={{ color: '#78716C' }} strokeWidth={1.7} />
            </button>
          </div>

          {/* Simple search bar */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 rounded-2xl mb-5 cursor-pointer text-left"
            style={{
              background: 'white',
              border: '1.5px solid #E8E0D8',
              height: 52,
              boxShadow: '0 2px 12px rgba(28,25,23,0.08)',
            }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: '#A8A29E' }} strokeWidth={1.7} />
            <span className="flex-1 text-[15px]" style={{ color: '#A8A29E' }}>
              Περιήγηση σε όλες τις θεραπείες
            </span>
            <span
              className="shrink-0 px-4 py-2 rounded-full font-semibold text-[13px]"
              style={{ background: '#1C1917', color: 'white' }}
            >
              Αναζήτηση
            </span>
          </button>

          {/* Categories horizontal scroll */}
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-3 w-max pb-1">
              {HOME_CATEGORIES.map(({ key, label, icon }) => (
                <button
                  key={key || 'all'}
                  onClick={() => navigate(`/services${key ? `?q=${encodeURIComponent(key)}` : ''}`)}
                  className="flex flex-col items-center gap-2 py-3 rounded-2xl cursor-pointer shrink-0"
                  style={{
                    width: 76,
                    paddingLeft: 6,
                    paddingRight: 6,
                    background: 'white',
                    border: '1.5px solid #E8E0D8',
                  }}
                >
                  <HomeCatIcon paths={icon} />
                  <span
                    className="text-[11px] font-medium text-center leading-tight w-full"
                    style={{ color: '#1C1917' }}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      <div>
        <ScrollRow label={T.home_recommended}>
          {businesses.length > 0
            ? businesses.map((b, i) => <BusinessCard key={b.id} business={b} index={i} />)
            : <EmptyPlaceholder />
          }
        </ScrollRow>

        <ScrollRow label={T.home_new}>
          {businesses.length > 0
            ? businesses.map((b, i) => <BusinessCard key={b.id} business={b} index={i + 3} />)
            : <EmptyPlaceholder />
          }
        </ScrollRow>
      </div>

      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {T.home_why.map(({ title, desc }, i) => {
              const Icon = WHY_ICONS[i]
              return (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#C9A882]/15 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#C9A882]" strokeWidth={1.8} />
                  </div>
                  <h3 className="font-display font-medium text-lg text-[#1C1917] mb-1">{title}</h3>
                  <p className="text-sm text-[#78716C] leading-relaxed max-w-xs">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="bg-[#1C1917] rounded-2xl sm:rounded-3xl px-6 sm:px-16 py-10 sm:py-14 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 text-center sm:text-left">
            <div>
              <p className="text-[#C9A882] text-xs font-semibold uppercase tracking-widest mb-3">{T.home_cta_tag}</p>
              <h2 className="font-display-italic text-3xl sm:text-4xl text-white mb-2">
                {T.home_cta_title[0]}<br />{T.home_cta_title[1]}
              </h2>
              <p className="text-white/60 text-sm leading-relaxed max-w-md">{T.home_cta_sub}</p>
            </div>
            <button className="btn-press shrink-0 bg-[#C9A882] hover:bg-[#A8845E] text-white font-semibold px-8 py-3.5 rounded-full transition-colors duration-200 text-sm whitespace-nowrap">
              {T.home_cta_btn}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
