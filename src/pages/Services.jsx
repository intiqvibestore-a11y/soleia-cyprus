import { useState, useMemo, useRef, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Star, Heart, Search, MapPin, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useT } from '../context/LanguageContext'

const ALL_SERVICES = [
  { id: 1,  name: 'Maria Theodorou',     service: 'Deep Tissue Massage',     category: 'Massage',  location: 'Limassol', rating: 4.9, reviews: 218,  price: 65,  duration: '60 min',  tag: 'Featured', bg: 'from-[#E8D5B7] to-[#C9A882]', lat: 34.6845, lng: 33.0434 },
  { id: 2,  name: 'Elena Constantinou',  service: 'Full Lash & Brow Set',    category: 'Beauty',   location: 'Nicosia',  rating: 4.8, reviews: 174,  price: 45,  duration: '90 min',  tag: 'Featured', bg: 'from-[#F2E3D9] to-[#DBBAA8]', lat: 35.1661, lng: 33.3688 },
  { id: 3,  name: 'Ioanna Stavrou',      service: 'Balayage & Cut',          category: 'Hair',     location: 'Paphos',   rating: 4.9, reviews: 132,  price: 90,  duration: '120 min', tag: 'Featured', bg: 'from-[#DDD5CC] to-[#BFB4A8]', lat: 34.7763, lng: 32.4233 },
  { id: 4,  name: 'Andreas Petrou',      service: 'Private Yoga Session',    category: 'Wellness', location: 'Larnaca',  rating: 5.0, reviews: 89,   price: 55,  duration: '60 min',  tag: 'Featured', bg: 'from-[#D5E0D5] to-[#A8BEA8]', lat: 34.9192, lng: 33.6348 },
  { id: 5,  name: 'Sophia Andreou',      service: 'Hot Stone Massage',       category: 'Massage',  location: 'Limassol', rating: 4.7, reviews: 156,  price: 80,  duration: '75 min',  tag: null,       bg: 'from-[#E8D9D5] to-[#C9AFA8]', lat: 34.6912, lng: 33.0521 },
  { id: 6,  name: 'Natalia Kyriakidou', service: 'Gel Manicure & Pedicure', category: 'Beauty',   location: 'Nicosia',  rating: 4.8, reviews: 203,  price: 40,  duration: '75 min',  tag: null,       bg: 'from-[#EDE4D8] to-[#D4C3AE]', lat: 35.1724, lng: 33.3598 },
  { id: 7,  name: 'Christos Hadjis',    service: "Men's Cut & Beard Trim",  category: 'Hair',     location: 'Limassol', rating: 4.9, reviews: 98,   price: 30,  duration: '45 min',  tag: 'Deals',    bg: 'from-[#D9E0E8] to-[#A8B5C9]', lat: 34.6789, lng: 33.0399 },
  { id: 8,  name: 'Rena Papadopoulos',  service: 'Hatha Yoga — Beginner',   category: 'Wellness', location: 'Paphos',   rating: 4.6, reviews: 67,   price: 40,  duration: '60 min',  tag: null,       bg: 'from-[#D8E4D8] to-[#B4CAB4]', lat: 34.8023, lng: 32.4156 },
  { id: 9,  name: 'Demetra Nicolaou',   service: 'Full Body Aromatherapy',  category: 'Massage',  location: 'Nicosia',  rating: 4.9, reviews: 111,  price: 75,  duration: '90 min',  tag: null,       bg: 'from-[#ECDAD0] to-[#D4B5A5]', lat: 35.1598, lng: 33.3812 },
  { id: 10, name: 'Anna Savva',         service: 'Keratin Hair Treatment',  category: 'Hair',     location: 'Larnaca',  rating: 4.8, reviews: 144,  price: 120, duration: '180 min', tag: 'Featured', bg: 'from-[#E0D5C5] to-[#C5B49A]', lat: 34.9089, lng: 33.6423 },
  { id: 11, name: 'Yiannis Georgiou',   service: 'Personal Training',       category: 'Wellness', location: 'Limassol', rating: 4.9, reviews: 78,   price: 60,  duration: '60 min',  tag: null,       bg: 'from-[#E8DCE0] to-[#D0BBBF]', lat: 34.6923, lng: 33.0612 },
  { id: 12, name: 'Irene Loizou',       service: 'Microblading Brows',      category: 'Beauty',   location: 'Paphos',   rating: 5.0, reviews: 56,   price: 150, duration: '120 min', tag: 'Featured', bg: 'from-[#D9E0D9] to-[#B5C4B5]', lat: 34.7854, lng: 32.4089 },
]

const SNAPS = [20, 45, 90]
function snapNearest(h) {
  return SNAPS.reduce((prev, curr) => Math.abs(curr - h) < Math.abs(prev - h) ? curr : prev)
}

function makePin(rating, isActive) {
  return L.divIcon({
    html: `<div style="
      background:${isActive ? '#C9A882' : '#1C1917'};
      color:white;
      padding:5px 10px;
      border-radius:20px;
      font-size:12px;
      font-weight:700;
      box-shadow:0 2px 10px rgba(0,0,0,0.25);
      white-space:nowrap;
      border:2px solid white;
      font-family:system-ui,-apple-system,sans-serif;
    ">★ ${rating}</div>`,
    className: '',
    iconSize: [58, 28],
    iconAnchor: [29, 14],
  })
}

function ServiceMap({ providers, hoveredId }) {
  const T = useT()
  return (
    <MapContainer
      center={[35.0, 33.0]}
      zoom={9}
      className="h-full w-full"
      scrollWheelZoom
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {providers.map(p => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={makePin(p.rating, hoveredId === p.id)}
        >
          <Popup>
            <div className="text-xs min-w-[140px]">
              <p className="font-semibold text-[#1C1917]">{p.name}</p>
              <p className="text-[#78716C]">{p.service}</p>
              <p className="font-semibold text-[#1C1917] mt-1">€{p.price} · {p.duration}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{p.rating} ({p.reviews} {T.svc_reviews})</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

function VenueCard({ p, onEnter, onLeave }) {
  const T = useT()
  const tagLabel = p.tag === 'Deals' ? T.svc_deals : p.tag === 'Featured' ? T.svc_featured : p.tag
  return (
    <Link
      to={`/providers/${p.id}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="block px-4 pb-5"
    >
      {/* Photo */}
      <div
        className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${p.bg} mb-3`}
        style={{ height: '205px' }}
      >
        {/* Pagination dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`rounded-full ${i === 0 ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
            />
          ))}
        </div>
        {/* Heart */}
        <button
          aria-label="Save"
          onClick={e => e.preventDefault()}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart className="w-4 h-4 text-[#78716C]" />
        </button>
        {/* Tag */}
        {p.tag && (
          <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
            p.tag === 'Deals' ? 'bg-[#C9A882] text-white' : 'bg-white/90 text-[#1C1917]'
          }`}>
            {tagLabel}
          </span>
        )}
      </div>
      {/* Info */}
      <div className="flex items-start justify-between gap-2 mb-0.5">
        <h3 className="font-semibold text-[#1C1917] text-[15px] leading-snug">{p.name}</h3>
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-[14px] font-bold text-[#1C1917]">{p.rating}</span>
        </div>
      </div>
      <p className="text-[13px] text-[#78716C] mb-0.5">{p.location}</p>
      <p className="text-[13px] text-[#78716C]">{p.category} · {p.reviews} {T.svc_reviews}</p>
    </Link>
  )
}

export default function Services() {
  const T = useT()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [hoveredId, setHoveredId] = useState(null)
  const [sheetH, setSheetH] = useState(45)
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)
  const startH = useRef(45)

  const query = searchParams.get('q') || ''
  const city  = searchParams.get('city') || ''

  const filtered = useMemo(() => {
    let list = [...ALL_SERVICES]
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.service.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      )
    }
    if (city && city !== 'All') list = list.filter(s => s.location === city)
    return list.sort((a, b) => b.rating - a.rating)
  }, [query, city])

  const handleDragStart = (e) => {
    setIsDragging(true)
    startY.current = e.touches ? e.touches[0].clientY : e.clientY
    startH.current = sheetH
  }

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging) return
      const y = e.touches ? e.touches[0].clientY : e.clientY
      const delta = ((startY.current - y) / window.innerHeight) * 100
      setSheetH(Math.min(90, Math.max(20, startH.current + delta)))
    }
    const onEnd = () => {
      if (!isDragging) return
      setIsDragging(false)
      setSheetH(h => snapNearest(h))
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('mouseup', onEnd)
    document.addEventListener('touchend', onEnd)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('mouseup', onEnd)
      document.removeEventListener('touchend', onEnd)
    }
  }, [isDragging])

  const filterPills = [
    T.results_filter_providers,
    T.results_filter_options,
    T.results_filter_type,
  ]

  return (
    <div className="fixed inset-0 top-0 overflow-hidden">

      {/* Compact search bar over map */}
      <div className="absolute top-3 left-3 right-3 z-[200] flex items-center gap-2">
        <button
          onClick={() => navigate('/search')}
          className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl min-w-0 text-left"
          style={{
            background: 'rgba(245,240,235,0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(201,168,130,0.30)',
            boxShadow: '0 2px 12px rgba(28,25,23,0.12)',
          }}
        >
          <Search className="w-4 h-4 text-[#C9A882] shrink-0" strokeWidth={1.6} />
          <span className="text-[13px] font-medium text-[#1C1917] truncate flex-1">
            {query || T.search_all_treatments}
          </span>
          <span className="w-px h-3.5 bg-[#D5CEC8] shrink-0" />
          <MapPin className="w-3.5 h-3.5 text-[#C9A882] shrink-0" strokeWidth={1.6} />
          <span className="text-[13px] text-[#78716C] truncate max-w-[110px]">
            {city || T.search_anywhere}
          </span>
        </button>

        <button
          className="w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center"
          style={{
            background: 'rgba(245,240,235,0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(201,168,130,0.30)',
            boxShadow: '0 2px 12px rgba(28,25,23,0.12)',
          }}
        >
          <SlidersHorizontal className="w-4 h-4 text-[#1C1917]" strokeWidth={1.6} />
        </button>
      </div>

      {/* Map — fills entire area */}
      <div className="absolute inset-0 z-0">
        <ServiceMap providers={filtered} hoveredId={hoveredId} />
      </div>

      {/* Draggable bottom sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 bg-white rounded-t-[22px] flex flex-col overflow-hidden"
        style={{
          height: `${sheetH}vh`,
          transition: isDragging ? 'none' : 'height 0.35s cubic-bezier(0.32,0.72,0,1)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.11)',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-2.5 shrink-0 cursor-grab active:cursor-grabbing select-none touch-none"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="w-10 h-1 rounded-full bg-[#D0C8C0]" />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 px-4 pb-2.5 overflow-x-auto scrollbar-hide shrink-0">
          {filterPills.map(pill => (
            <button
              key={pill}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-[#E8E0D8] bg-white text-[12px] font-semibold text-[#1C1917] whitespace-nowrap hover:border-[#C9A882] transition-colors cursor-pointer shrink-0"
            >
              {pill}
              <ChevronDown className="w-3 h-3 text-[#A8A29E]" />
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-[12px] text-[#78716C] px-4 pb-2.5 shrink-0">
          <span className="font-semibold text-[#1C1917]">{filtered.length}</span>
          {' '}{T.svc_map_area}
        </p>

        <div className="h-px bg-[#F5F0EB] shrink-0 mx-4" />

        {/* Scrollable venue cards */}
        <div className="flex-1 overflow-y-auto pb-28 pt-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-8">
              <p className="text-[#78716C] mb-3 text-[14px]">{T.svc_no_results}</p>
              <Link to="/services" className="text-[#C9A882] font-semibold text-sm hover:underline">
                {T.svc_clear_filters}
              </Link>
            </div>
          ) : (
            filtered.map(p => (
              <div key={p.id} className="pt-4">
                <VenueCard
                  p={p}
                  onEnter={() => setHoveredId(p.id)}
                  onLeave={() => setHoveredId(null)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
