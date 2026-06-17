import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Home, Briefcase } from 'lucide-react'
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase/client'

const UA = 'SoleiaCyprus/1.0 (soleia.com.cy)'

// Listens to map drag end → reports new center coordinates
function MapMoveListener({ onMove }) {
  useMapEvents({
    moveend(e) { const c = e.target.getCenter(); onMove(c.lat, c.lng) },
  })
  return null
}

// Programmatically repositions the map when user picks a new address
function MapJumper({ target }) {
  const map = useMap()
  const prev = useRef(null)
  useEffect(() => {
    if (!target) return
    if (prev.current?.[0] === target[0] && prev.current?.[1] === target[1]) return
    prev.current = target
    map.setView(target, 16, { animate: true })
  }, [target])
  return null
}

export default function ProfileAddress() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const type   = searchParams.get('type') || 'home'
  const isHome = type === 'home'

  const [screen,         setScreen]         = useState('search') // 'search' | 'map'
  const [query,          setQuery]          = useState('')
  const [suggestions,    setSuggestions]    = useState([])
  const [selected,       setSelected]       = useState(null)    // { address, lat, lng }
  const [mapJumpTarget,  setMapJumpTarget]  = useState(null)    // [lat, lng] — jump map here
  const [displayAddress, setDisplayAddress] = useState('')
  const [saving,         setSaving]         = useState(false)
  const [locating,       setLocating]       = useState(false)
  const reverseTimer = useRef(null)
  const inputRef = useRef(null)

  // Default: center of Cyprus
  const DEFAULT_CENTER = [34.9, 33.0]

  // Load existing address from profile
  useEffect(() => {
    if (authLoading || !user) return
    supabase.from('profiles').select('addresses').eq('id', user.id).single()
      .then(({ data }) => {
        const addr = data?.addresses?.[type]
        if (addr?.lat && addr?.lng) {
          setSelected(addr)
          setMapJumpTarget([addr.lat, addr.lng])
          setDisplayAddress(addr.address)
        }
      })
  }, [user, authLoading, type])

  // Debounced Nominatim forward geocode search
  useEffect(() => {
    if (!query || query.length < 3) { setSuggestions([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`,
          { headers: { 'User-Agent': UA } }
        )
        setSuggestions(await res.json())
      } catch { setSuggestions([]) }
    }, 400)
    return () => clearTimeout(t)
  }, [query])

  const pickResult = ({ display_name, lat, lon }) => {
    const addr = { address: display_name, lat: parseFloat(lat), lng: parseFloat(lon) }
    setSelected(addr)
    setDisplayAddress(display_name)
    setMapJumpTarget([addr.lat, addr.lng])
    setSuggestions([])
    setQuery('')
    setScreen('map')
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'User-Agent': UA } }
          )
          const data = await res.json()
          pickResult({ display_name: data.display_name, lat, lon: lng })
        } catch {}
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  // Called on map moveend — reverse geocodes new center
  const handleMapMove = (lat, lng) => {
    if (reverseTimer.current) clearTimeout(reverseTimer.current)
    reverseTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { 'User-Agent': UA } }
        )
        const data = await res.json()
        const address = data.display_name || ''
        setDisplayAddress(address)
        setSelected({ address, lat, lng })
      } catch {}
    }, 350)
  }

  const handleSave = async () => {
    if (!selected || !user) return
    setSaving(true)
    const { data: profileData } = await supabase
      .from('profiles').select('addresses').eq('id', user.id).single()
    const addresses = { ...(profileData?.addresses || {}), [type]: selected }
    await supabase.from('profiles').upsert({
      id: user.id, addresses, updated_at: new Date().toISOString(),
    })
    setSaving(false)
    navigate('/profile/edit')
  }

  if (authLoading) return <div className="min-h-screen bg-white" />

  const mapCenter = selected ? [selected.lat, selected.lng] : DEFAULT_CENTER

  // ── Screen A: Address search ─────────────────────────────────────────────────
  if (screen === 'search') {
    return (
      <div className="min-h-screen bg-white pt-[62px]">
        {/* Search input acts as the page header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F0EAE3]">
          <button
            onClick={() => navigate('/profile/edit')}
            style={{ background: 'none', border: 'none', padding: 0, flexShrink: 0 }}
          >
            <ArrowLeft className="w-5 h-5 text-[#1C1917] cursor-pointer" />
          </button>
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Εκκινήστε να πληκτρολογείτε τη διεύθυνση"
            className="flex-1 text-[15px] text-[#1C1917] placeholder-[#A8A29E] outline-none bg-transparent"
          />
        </div>

        {/* Use current location */}
        <button
          onClick={handleUseLocation}
          disabled={locating}
          className="flex items-center gap-2.5 px-5 py-4 text-[14px] font-semibold cursor-pointer disabled:opacity-60"
          style={{ color: '#C9A882', background: 'none', border: 'none' }}
        >
          <MapPin className="w-4 h-4" strokeWidth={1.7} />
          {locating ? 'Εντοπισμός...' : 'Χρήση της τοποθεσίας μου'}
        </button>

        {/* Suggestion list */}
        {suggestions.map(item => (
          <button
            key={item.place_id}
            onClick={() => pickResult(item)}
            className="w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#FDFAF7]"
            style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #F5F0EB' }}
          >
            <MapPin className="w-4 h-4 text-[#C8C0B8] mt-0.5 shrink-0" strokeWidth={1.7} />
            <p className="text-[14px] text-[#1C1917] leading-snug">{item.display_name}</p>
          </button>
        ))}
      </div>
    )
  }

  // ── Screen B: Map confirmation ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white pt-[62px] flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F0EAE3] shrink-0">
        <button onClick={() => setScreen('search')} style={{ background: 'none', border: 'none', padding: 0 }}>
          <ArrowLeft className="w-5 h-5 text-[#1C1917] cursor-pointer" />
        </button>
        <h1 className="text-[16px] font-bold text-[#1C1917]">{isHome ? 'Σπίτι' : 'Εργασία'}</h1>
      </div>

      {/* Address bar — tap to go back to search */}
      <div className="px-4 py-3 shrink-0">
        <button
          onClick={() => setScreen('search')}
          className="w-full flex items-center gap-3 px-4 h-[48px] border border-[#E8E0D8] rounded-xl text-left cursor-pointer transition-colors hover:border-[#C9A882] bg-white"
        >
          <MapPin className="w-4 h-4 text-[#A8A29E] shrink-0" strokeWidth={1.7} />
          <span className="text-[14px] text-[#1C1917] truncate flex-1">{displayAddress || 'Επιλέξτε διεύθυνση'}</span>
        </button>
      </div>

      {/* Map */}
      <div className="mx-4 rounded-2xl overflow-hidden relative shrink-0" style={{ height: 280 }}>
        <MapContainer
          center={mapCenter}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapMoveListener onMove={handleMapMove} />
          <MapJumper target={mapJumpTarget} />
        </MapContainer>

        {/* Fixed center pin — map moves beneath it */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 1000 }}
        >
          <div className="flex flex-col items-center" style={{ marginTop: -54 }}>
            {/* Pin head */}
            <div className="w-12 h-12 rounded-full bg-[#1C1917] flex items-center justify-center shadow-xl">
              {isHome
                ? <Home      className="w-6 h-6 text-white" strokeWidth={1.7} />
                : <Briefcase className="w-6 h-6 text-white" strokeWidth={1.7} />
              }
            </div>
            {/* Pin tail */}
            <div style={{
              width: 0, height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '12px solid #1C1917',
            }} />
          </div>
        </div>

        {/* Drag hint tooltip */}
        <div
          className="absolute pointer-events-none"
          style={{ zIndex: 1000, bottom: 16, left: '50%', transform: 'translateX(-50%)' }}
        >
          <div
            className="text-white text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap"
            style={{ background: 'rgba(28,25,23,0.85)' }}
          >
            Σύρετε τον χάρτη για να ρυθμίσετε την πινέζα
          </div>
        </div>
      </div>

      {/* Confirmed address + Edit link */}
      <div className="px-4 py-4 flex items-start gap-3 shrink-0">
        <p className="text-[14px] text-[#1C1917] leading-snug flex-1 min-w-0">{displayAddress}</p>
        <button
          onClick={() => setScreen('search')}
          className="text-[14px] font-semibold shrink-0 cursor-pointer"
          style={{ color: '#C9A882', background: 'none', border: 'none' }}
        >
          Edit
        </button>
      </div>

      {/* Save button */}
      <div className="px-4 pb-8 mt-auto shrink-0">
        <button
          onClick={handleSave}
          disabled={saving || !selected}
          className="w-full h-[54px] rounded-full text-white font-semibold text-[16px] transition-opacity disabled:opacity-60"
          style={{ background: '#C9A882' }}
        >
          {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
        </button>
      </div>
    </div>
  )
}
