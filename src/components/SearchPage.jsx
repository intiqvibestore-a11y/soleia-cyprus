import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Search, Scissors, Eye, Hand, Zap, HandHeart, Smile, Waves,
  ScissorsLineDashed, PersonStanding, Brush, Sparkles, PenTool, Stethoscope,
  Bone, Dumbbell, Brain, Activity, Apple, Flower2, PawPrint } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase/client'
import { loadLocation } from './LocationModal'

const SEARCH_CATEGORIES = [
  'Μαλλιά και χτένισμα', 'Φρύδια & βλεφαρίδες', 'Νύχια', 'Αποτρίχωση',
  'Μασάζ', 'Περιποίηση προσώπου', 'Σπα και σάουνα', 'Κουρείο', 'Σώμα',
  'Μακιγιάζ', 'Αισθητικές υπηρεσίες', 'Τατουάζ και piercing',
  'Οδοντιατρικές υπηρεσίες', 'Ιατρικές υπηρεσίες', 'Χειροπρακτική',
  'Fitness', 'Ψυχική υγεία', 'Φυσικοθεραπεία', 'Διατροφή',
  'Ολιστική υγεία', 'Κατοικίδια',
]

const CATEGORY_ICONS = {
  'Μαλλιά και χτένισμα':      Scissors,
  'Φρύδια & βλεφαρίδες':      Eye,
  'Νύχια':                    Hand,
  'Αποτρίχωση':               Zap,
  'Μασάζ':                    HandHeart,
  'Περιποίηση προσώπου':      Smile,
  'Σπα και σάουνα':           Waves,
  'Κουρείο':                  ScissorsLineDashed,
  'Σώμα':                     PersonStanding,
  'Μακιγιάζ':                 Brush,
  'Αισθητικές υπηρεσίες':    Sparkles,
  'Τατουάζ και piercing':     PenTool,
  'Οδοντιατρικές υπηρεσίες': Smile,
  'Ιατρικές υπηρεσίες':      Stethoscope,
  'Χειροπρακτική':            Bone,
  'Fitness':                  Dumbbell,
  'Ψυχική υγεία':             Brain,
  'Φυσικοθεραπεία':           Activity,
  'Διατροφή':                 Apple,
  'Ολιστική υγεία':           Flower2,
  'Κατοικίδια':               PawPrint,
}

const TABS = [
  { key: 'all',           label: 'Όλα'           },
  { key: 'therapies',     label: 'Θεραπείες'     },
  { key: 'venues',        label: 'Χώροι'         },
  { key: 'professionals', label: 'Επαγγελματίες' },
]

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDist(km) {
  if (km === null || km === undefined) return ''
  if (km < 1) return `${Math.round(km * 1000)} μ.`
  return `${km.toFixed(1)} χλμ.`
}

function CatCircle({ category }) {
  const Icon = CATEGORY_ICONS[category] || Search
  return (
    <div
      className="flex items-center justify-center shrink-0 rounded-full"
      style={{ width: 40, height: 40, background: '#F5F0EB' }}
    >
      <Icon className="w-4 h-4" style={{ color: '#C9A882' }} strokeWidth={1.7} />
    </div>
  )
}

export default function SearchPage({ onClose, onCloseAll }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [businesses, setBusinesses] = useState([])
  const inputRef = useRef(null)
  const userLoc = loadLocation()

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    supabase
      .from('businesses')
      .select('id, name, city, category, lat, lng, cover_url, rating')
      .then(({ data }) => { if (data) setBusinesses(data) })
  }, [])

  const q = query.toLowerCase().trim()

  const filteredCats = q
    ? SEARCH_CATEGORIES.filter(c => c.toLowerCase().includes(q))
    : SEARCH_CATEGORIES

  const filteredVenues = q
    ? businesses
        .filter(b =>
          b.name?.toLowerCase().includes(q) ||
          b.city?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q)
        )
        .map(b => ({
          ...b,
          dist: (userLoc?.lat && b.lat && b.lng)
            ? haversine(userLoc.lat, userLoc.lng, b.lat, b.lng)
            : null,
        }))
        .sort((a, b) => (a.dist ?? 9999) - (b.dist ?? 9999))
    : []

  const handleCategory = (key) => {
    onClose(key)
  }

  const handleBusiness = (id) => {
    navigate(`/business/${id}`)
    onCloseAll(null)
  }

  const showTherapies = tab === 'all' || tab === 'therapies'
  const showVenues    = tab === 'all' || tab === 'venues'

  const catsToShow  = tab === 'therapies' ? filteredCats : filteredCats.slice(0, q ? 5 : filteredCats.length)
  const venuesToShow = tab === 'venues'   ? filteredVenues : filteredVenues.slice(0, 5)

  return (
    <>
      <div
        className="fixed inset-0 z-[450] flex flex-col bg-white overflow-hidden"
        style={{ borderRadius: '20px 20px 0 0' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-6 pb-3 shrink-0">
          <button
            onClick={() => onClose()}
            onTouchStart={e => e.stopPropagation()}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 0 }}
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" style={{ color: '#1C1917' }} strokeWidth={2} />
          </button>
          <span className="text-[20px] font-bold" style={{ color: '#1C1917' }}>Αναζήτηση</span>
        </div>

        {/* Search input */}
        <div className="px-4 pb-3 shrink-0">
          <div
            className="flex items-center gap-3 px-4 rounded-2xl"
            style={{ height: 48, border: '1.5px solid #E8E0D8', background: '#FAFAFA' }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: '#A8A29E' }} strokeWidth={1.7} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Αναζήτηση..."
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 16, color: '#1C1917', border: 'none' }}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="overflow-x-auto scrollbar-hide shrink-0">
          <div className="flex gap-2 px-4 pb-3 w-max">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-4 py-2 rounded-full font-semibold text-[13px] cursor-pointer whitespace-nowrap"
                style={{
                  background: tab === t.key ? '#1C1917' : 'white',
                  color:      tab === t.key ? 'white'   : '#1C1917',
                  border: `1.5px solid ${tab === t.key ? '#1C1917' : '#E8E0D8'}`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">

          {/* Θεραπείες */}
          {showTherapies && catsToShow.length > 0 && (
            <div className="mb-6">
              <p className="text-[15px] font-bold py-2" style={{ color: '#1C1917' }}>Θεραπείες</p>
              {catsToShow.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => handleCategory(cat)}
                  className="w-full flex items-center gap-4 py-3 cursor-pointer"
                  style={{
                    background: 'none', border: 'none', textAlign: 'left',
                    borderBottom: i < catsToShow.length - 1 ? '1px solid #F5F0EB' : 'none',
                  }}
                >
                  <CatCircle category={cat} />
                  <span className="text-[15px]" style={{ color: '#1C1917' }}>{cat}</span>
                </button>
              ))}
              {q && tab !== 'therapies' && filteredCats.length > 5 && (
                <button onClick={() => setTab('therapies')} className="py-2 cursor-pointer" style={{ background: 'none', border: 'none' }}>
                  <span className="text-[14px] font-semibold" style={{ color: '#C9A882' }}>Δείτε περισσότερα</span>
                </button>
              )}
            </div>
          )}

          {/* Χώροι */}
          {showVenues && q && filteredVenues.length > 0 && (
            <div className="mb-6">
              <p className="text-[15px] font-bold py-2" style={{ color: '#1C1917' }}>Χώροι</p>
              {venuesToShow.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => handleBusiness(b.id)}
                  className="w-full flex items-center gap-3 py-3 cursor-pointer"
                  style={{
                    background: 'none', border: 'none', textAlign: 'left',
                    borderBottom: i < venuesToShow.length - 1 ? '1px solid #F5F0EB' : 'none',
                  }}
                >
                  <div className="rounded-xl overflow-hidden shrink-0" style={{ width: 48, height: 48, background: '#F5F0EB' }}>
                    {b.cover_url && <img src={b.cover_url} alt={b.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold truncate" style={{ color: '#1C1917' }}>{b.name}</p>
                    <p className="text-[12px] truncate" style={{ color: '#A8A29E' }}>
                      {[b.category, b.city].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  {b.dist !== null && (
                    <span className="text-[12px] shrink-0 ml-2" style={{ color: '#A8A29E' }}>{formatDist(b.dist)}</span>
                  )}
                </button>
              ))}
              {tab !== 'venues' && filteredVenues.length > 5 && (
                <button onClick={() => setTab('venues')} className="py-2 cursor-pointer" style={{ background: 'none', border: 'none' }}>
                  <span className="text-[14px] font-semibold" style={{ color: '#C9A882' }}>Δείτε περισσότερα</span>
                </button>
              )}
            </div>
          )}

          {q && filteredCats.length === 0 && filteredVenues.length === 0 && (
            <p className="text-[14px] text-center mt-10" style={{ color: '#A8A29E' }}>
              Δεν βρέθηκαν αποτελέσματα για &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>
    </>
  )
}
