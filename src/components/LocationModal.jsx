import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Search, MapPin, Navigation, X } from 'lucide-react'

export const LOCATION_KEY = 'soleia_location'
export const HISTORY_KEY  = 'soleia_location_history'

export function loadLocation() {
  try { return JSON.parse(localStorage.getItem(LOCATION_KEY)) } catch { return null }
}
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}
function saveLocation(item) {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(item))
  const hist = loadHistory().filter(h => h.label !== item.label).slice(0, 2)
  localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...hist]))
  window.dispatchEvent(new Event('soleia_location_changed'))
}

export default function LocationModal({ onClose, onSelect }) {
  const [query,      setQuery]      = useState('')
  const [results,    setResults]    = useState([])
  const [history,    setHistory]    = useState(() => loadHistory())
  const [gpsLoading, setGpsLoading] = useState(false)
  const inputRef = useRef(null)
  const timer    = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 150)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=cy&format=json&limit=5`
        )
        setResults(await res.json())
      } catch { setResults([]) }
    }, 350)
    return () => clearTimeout(timer.current)
  }, [query])

  const handleSelect = (item) => {
    saveLocation(item)
    onSelect?.(item)
    onClose()
  }

  const handleGPS = () => {
    setGpsLoading(true)
    if (!navigator.geolocation) {
      handleSelect({ label: 'Κύπρος', lat: 35.0, lng: 33.0 })
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setGpsLoading(false)
        handleSelect({ label: 'Τρέχουσα τοποθεσία', lat, lng })
      },
      () => { setGpsLoading(false); handleSelect({ label: 'Κύπρος', lat: 35.0, lng: 33.0 }) },
      { timeout: 8000 }
    )
  }

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY)
    setHistory([])
  }

  return (
    <div
      className="fixed inset-0 z-[500] flex flex-col"
      style={{ background: 'white', overscrollBehavior: 'contain' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center cursor-pointer shrink-0"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
        </button>
        <span className="text-[18px] font-bold" style={{ color: '#1C1917' }}>Κατάστημα</span>
      </div>

      {/* Search input */}
      <div className="px-4 pb-3">
        <div
          className="flex items-center gap-3 px-4 rounded-2xl"
          style={{ background: '#F5F0EB', border: '1.5px solid #E8E0D8', height: 48 }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: '#A8A29E' }} strokeWidth={1.7} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Αναζήτηση τοποθεσίας..."
            className="flex-1 bg-transparent outline-none"
            style={{ color: '#1C1917', fontSize: '16px', border: 'none' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 0 }}
            >
              <X className="w-4 h-4" style={{ color: '#A8A29E' }} strokeWidth={1.7} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">

        {/* Current location */}
        <button
          onClick={handleGPS}
          disabled={gpsLoading}
          className="w-full flex items-center gap-4 px-5 py-4 cursor-pointer"
          style={{ background: 'none', border: 'none', borderBottom: '1px solid #F5F0EB', textAlign: 'left' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#EEF2FF' }}>
            <Navigation className="w-5 h-5" style={{ color: '#6366F1' }} strokeWidth={1.7} />
          </div>
          <span className="text-[15px] font-semibold" style={{ color: '#1C1917' }}>
            {gpsLoading ? 'Εντοπισμός...' : 'Τρέχουσα τοποθεσία'}
          </span>
        </button>

        {/* Nominatim results */}
        {results.length > 0 && results.map((r, i) => {
          const parts = r.display_name.split(',')
          const label = parts.slice(0, 2).join(',').trim()
          const sub   = parts.slice(2, 4).join(',').trim()
          return (
            <button
              key={i}
              onClick={() => handleSelect({ label, lat: parseFloat(r.lat), lng: parseFloat(r.lon) })}
              className="w-full flex items-center gap-4 px-5 py-3.5 cursor-pointer"
              style={{ background: 'none', border: 'none', borderBottom: '1px solid #F5F0EB', textAlign: 'left' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#F5F0EB' }}>
                <MapPin className="w-4 h-4" style={{ color: '#C9A882' }} strokeWidth={1.7} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold truncate" style={{ color: '#1C1917' }}>{label}</p>
                {sub && <p className="text-[12px] truncate" style={{ color: '#A8A29E' }}>{sub}</p>}
              </div>
            </button>
          )
        })}

        {/* Recent history (shown only when not searching) */}
        {!query && history.length > 0 && results.length === 0 && (
          <div>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: '#78716C' }}>Πρόσφατα</span>
              <button
                onClick={clearHistory}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <span className="text-[13px] font-semibold" style={{ color: '#C9A882' }}>Εκκαθάριση</span>
              </button>
            </div>
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => handleSelect(h)}
                className="w-full flex items-center gap-4 px-5 py-3.5 cursor-pointer"
                style={{ background: 'none', border: 'none', borderBottom: '1px solid #F5F0EB', textAlign: 'left' }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#F5F0EB' }}>
                  <MapPin className="w-4 h-4" style={{ color: '#C9A882' }} strokeWidth={1.7} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium" style={{ color: '#1C1917' }}>{h.label}</p>
                </div>
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
