import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Star, ChevronRight, ChevronLeft, Shield, Clock, MapPin, ChevronDown, Search, X, Calendar, LayoutGrid, Scissors, ScissorsLineDashed, Eye, Hand, Zap, HandHeart, Smile, Waves, PersonStanding, Brush, Sparkles, PenTool, Stethoscope, Bone, Dumbbell, Brain, Activity, Apple, Flower2, PawPrint } from 'lucide-react'
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
  { key: '',                          label: 'Όλα',                       icon: LayoutGrid        },
  { key: 'Μαλλιά και χτένισμα',      label: 'Μαλλιά και χτένισμα',      icon: Scissors          },
  { key: 'Φρύδια & βλεφαρίδες',      label: 'Φρύδια & βλεφαρίδες',      icon: Eye               },
  { key: 'Νύχια',                    label: 'Νύχια',                     icon: Hand              },
  { key: 'Αποτρίχωση',               label: 'Αποτρίχωση',                icon: Zap               },
  { key: 'Μασάζ',                    label: 'Μασάζ',                     icon: HandHeart         },
  { key: 'Περιποίηση προσώπου',      label: 'Περιποίηση προσώπου',       icon: Smile             },
  { key: 'Σπα και σάουνα',           label: 'Σπα και σάουνα',            icon: Waves             },
  { key: 'Κουρείο',                  label: 'Κουρείο',                   icon: ScissorsLineDashed},
  { key: 'Σώμα',                     label: 'Σώμα',                      icon: PersonStanding    },
  { key: 'Μακιγιάζ',                 label: 'Μακιγιάζ',                  icon: Brush             },
  { key: 'Αισθητικές υπηρεσίες',    label: 'Αισθητικές υπηρεσίες',     icon: Sparkles          },
  { key: 'Τατουάζ και piercing',     label: 'Τατουάζ και piercing',      icon: PenTool           },
  { key: 'Οδοντιατρικές υπηρεσίες', label: 'Οδοντιατρικές υπηρεσίες',  icon: Smile             },
  { key: 'Ιατρικές υπηρεσίες',      label: 'Ιατρικές υπηρεσίες',       icon: Stethoscope       },
  { key: 'Χειροπρακτική',            label: 'Χειροπρακτική',             icon: Bone              },
  { key: 'Fitness',                  label: 'Fitness',                   icon: Dumbbell          },
  { key: 'Ψυχική υγεία',             label: 'Ψυχική υγεία',              icon: Brain             },
  { key: 'Φυσικοθεραπεία',           label: 'Φυσικοθεραπεία',            icon: Activity          },
  { key: 'Διατροφή',                 label: 'Διατροφή',                  icon: Apple             },
  { key: 'Ολιστική υγεία',           label: 'Ολιστική υγεία',            icon: Flower2           },
  { key: 'Κατοικίδια',               label: 'Κατοικίδια',                icon: PawPrint          },
]

function HomeCatIcon({ icon: Icon, large }) {
  return (
    <Icon
      className={large ? 'w-8 h-8' : 'w-7 h-7'}
      strokeWidth={1.5}
      style={{ color: '#1C1917' }}
    />
  )
}

const RECENT_KEY = 'soleia_recent_searches'
function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
function saveToRecent(q) {
  if (!q?.trim()) return
  const prev = loadRecent().filter(s => s !== q).slice(0, 2)
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev]))
}

function HomeSearchModal({ onClose, selectedLocation, onOpenLocation }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState(() => loadRecent())
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const sheetRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 120)
    return () => clearTimeout(t)
  }, [])

  // Swipe-to-dismiss: drag handle area OR content scrolled to top + dragging down
  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return
    let startY = 0
    let dragging = false
    let delta = 0

    const onStart = (e) => {
      startY = e.touches[0].clientY
      delta = 0
      dragging = false
      const offsetInSheet = e.touches[0].clientY - sheet.getBoundingClientRect().top
      if (offsetInSheet < 60) {
        dragging = true
        sheet.style.animation = 'none' // kill CSS animation so transform takes effect immediately
      }
    }

    const onMove = (e) => {
      const dy = e.touches[0].clientY - startY
      if (!dragging) {
        const atTop = (scrollRef.current?.scrollTop ?? 0) === 0
        if (atTop && dy > 0) {
          dragging = true
          sheet.style.animation = 'none'
        } else {
          return
        }
      }
      delta = Math.max(0, dy) // never drag upward
      sheet.style.transition = 'none'
      sheet.style.transform = `translateY(${delta}px)`
      e.preventDefault()
    }

    const onEnd = () => {
      if (!dragging) return
      if (delta > 150) {
        sheet.style.transition = 'transform 0.3s ease'
        sheet.style.transform = 'translateY(100%)'
        setTimeout(onClose, 300)
      } else {
        sheet.style.transition = 'transform 0.3s ease'
        sheet.style.transform = 'translateY(0)'
      }
      dragging = false
      delta = 0
    }

    sheet.addEventListener('touchstart', onStart, { passive: true })
    sheet.addEventListener('touchmove', onMove, { passive: false })
    sheet.addEventListener('touchend', onEnd)
    return () => {
      sheet.removeEventListener('touchstart', onStart)
      sheet.removeEventListener('touchmove', onMove)
      sheet.removeEventListener('touchend', onEnd)
    }
  }, [onClose])

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY)
    setRecent([])
  }

  const goSearch = (catKey) => {
    const q = catKey !== undefined ? catKey : query
    if (catKey === undefined && q?.trim()) saveToRecent(q.trim())
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    const qs = params.toString()
    navigate(`/services${qs ? '?' + qs : ''}`)
    onClose()
  }

  return (
    <>
      <style>{`@keyframes slideUpSheet{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

      {/* Overlay */}
      <div
        className="fixed inset-0 z-[400]"
        style={{ background: 'rgba(0,0,0,0.38)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-[401] flex flex-col"
        style={{
          height: '90vh',
          background: 'white',
          borderRadius: '20px 20px 0 0',
          animation: 'slideUpSheet 0.35s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0D8D0' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4 shrink-0">
          <span className="text-[22px] font-bold" style={{ color: '#1C1917' }}>Αναζήτηση</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 0 }}>
            <X className="w-6 h-6" style={{ color: '#1C1917' }} />
          </button>
        </div>

        {/* Scrollable body — fields + recent + categories all scroll together */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-2">

          {/* Input rows */}
          <div className="flex flex-col gap-3 pb-5">
            <div className="flex items-center gap-3 px-4 rounded-2xl" style={{ height: 52, border: '1.5px solid #E8E0D8' }}>
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
            <button onClick={onOpenLocation} className="flex items-center gap-3 px-4 rounded-2xl cursor-pointer text-left" style={{ height: 52, border: '1.5px solid #E8E0D8', background: 'white' }}>
              <MapPin className="w-4 h-4 shrink-0" style={{ color: '#A8A29E' }} strokeWidth={1.7} />
              <span style={{ fontSize: 15, color: '#1C1917' }}>{selectedLocation?.label || 'Τρέχουσα τοποθεσία'}</span>
            </button>
            <div className="flex items-center gap-3 px-4 rounded-2xl" style={{ height: 52, border: '1.5px solid #E8E0D8' }}>
              <Calendar className="w-4 h-4 shrink-0" style={{ color: '#A8A29E' }} strokeWidth={1.7} />
              <span style={{ fontSize: 15, color: '#A8A29E' }}>Οποιαδήποτε στιγμή</span>
            </div>
          </div>

          {/* Recent searches */}
          {recent.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[16px] font-bold" style={{ color: '#1C1917' }}>Πρόσφατα</p>
                <button onClick={clearRecent} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <span className="text-[13px] font-semibold" style={{ color: '#7C3AED' }}>Εκκαθάριση</span>
                </button>
              </div>
              {recent.map((r, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(r); inputRef.current?.focus() }}
                  className="w-full flex items-center gap-3 py-3 cursor-pointer"
                  style={{ background: 'none', border: 'none', borderBottom: i < recent.length - 1 ? '1px solid #F5F0EB' : 'none', textAlign: 'left' }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#EEF2FF' }}>
                    <Search className="w-4 h-4" style={{ color: '#7C3AED' }} strokeWidth={1.7} />
                  </div>
                  <span className="text-[15px]" style={{ color: '#1C1917' }}>{r}</span>
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          <p className="text-[16px] font-bold mb-3" style={{ color: '#1C1917' }}>Κατηγορίες</p>
          <div className="grid grid-cols-2 gap-2.5">
            {HOME_CATEGORIES.map(({ key, label, icon }) => (
              <button
                key={key || 'all'}
                onClick={() => goSearch(key)}
                className="flex flex-col items-center gap-2 py-3 px-3 rounded-2xl cursor-pointer"
                style={{ border: '1.5px solid #E8E0D8', background: '#FAFAFA' }}
              >
                <HomeCatIcon icon={icon} />
                <span className="text-[12px] font-medium text-center leading-snug" style={{ color: '#1C1917' }}>
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
    </>
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
          <div className="mb-5 hidden">
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
            className="w-full flex items-center gap-3 pl-5 pr-2 rounded-3xl mb-5 cursor-pointer text-left"
            style={{
              background: 'white',
              height: 56,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <Search className="w-6 h-6 shrink-0" style={{ color: '#1C1917' }} strokeWidth={1.7} />
            <span className="flex-1 text-xs whitespace-nowrap" style={{ color: '#A8A29E' }}>
              Περιήγηση σε όλες τις θεραπείες
            </span>
            <span
              className="shrink-0 px-5 rounded-full font-semibold text-[14px]"
              style={{ background: '#1C1917', color: 'white', height: 44, display: 'flex', alignItems: 'center' }}
            >
              Αναζήτηση
            </span>
          </button>

          {/* Categories 2-row horizontal scroll */}
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 mt-4">
            <div
              className="pb-1 pr-8"
              style={{
                display: 'grid',
                gap: '16px',
                gridTemplateRows: 'repeat(2, auto)',
                gridAutoFlow: 'column',
                gridAutoColumns: 'max-content',
              }}
            >
              {HOME_CATEGORIES.map(({ key, label, icon }) => (
                <button
                  key={key || 'all'}
                  onClick={() => navigate(`/services${key ? `?q=${encodeURIComponent(key)}` : ''}`)}
                  className="flex flex-col items-center gap-2 cursor-pointer shrink-0 transition-all active:scale-95 hover:opacity-75"
                  style={{ width: 72, background: 'none', border: 'none', padding: 0 }}
                >
                  <div
                    className="flex items-center justify-center rounded-2xl"
                    style={{ width: 58, height: 58, background: '#F5F0EB' }}
                  >
                    <HomeCatIcon icon={icon} />
                  </div>
                  <span
                    className="text-[10px] font-semibold text-center leading-tight w-full"
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
