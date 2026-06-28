import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'

const TABS = ['Ραντεβού', 'Δωροκάρτες', 'Συνδρομές', 'Προϊόντα']

const DEMO_BOOKINGS = [
  {
    id: '1',
    business: 'Wow Beauty Lab MYMALL',
    date: 'Πέμ 25 Ιουν 2026',
    time: '10:00 π.μ.',
    duration: '1 ω., 30 λ.',
    price: 170,
    services: 3,
    daysUntil: 6,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1560066984-138daaa0ad8b?w=800&q=80',
    address: 'MY MALL, Λεμεσός 3040',
  },
  {
    id: '2',
    business: 'Wow Beauty Lab MYMALL',
    date: 'Παρ 19 Ιουν 2026',
    time: '10:00 π.μ.',
    duration: '1 ω., 30 λ.',
    price: 170,
    services: 3,
    status: 'past',
    image: 'https://images.unsplash.com/photo-1560066984-138daaa0ad8b?w=400&q=80',
  },
  {
    id: '3',
    business: 'Wow Beauty Lab MYMALL',
    date: 'Σαβ 1 Φεβ 2026',
    time: '10:00 π.μ.',
    duration: '1 ω., 30 λ.',
    price: 170,
    services: 3,
    status: 'past',
    image: 'https://images.unsplash.com/photo-1560066984-138daaa0ad8b?w=400&q=80',
  },
]

function CalendarIllustration() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="actCalG" x1="4" y1="4" x2="68" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8D5B0" />
          <stop offset="1" stopColor="#C9A96E" />
        </linearGradient>
      </defs>
      <rect x="6" y="18" width="60" height="48" rx="10" fill="url(#actCalG)" opacity="0.18" />
      <rect x="6" y="18" width="60" height="48" rx="10" stroke="url(#actCalG)" strokeWidth="2.5" />
      <rect x="6" y="18" width="60" height="22" rx="10" fill="url(#actCalG)" opacity="0.45" />
      <rect x="6" y="30" width="60" height="10" fill="url(#actCalG)" opacity="0.45" />
      <line x1="24" y1="8" x2="24" y2="24" stroke="url(#actCalG)" strokeWidth="3" strokeLinecap="round" />
      <line x1="48" y1="8" x2="48" y2="24" stroke="url(#actCalG)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="22" cy="52" r="3" fill="url(#actCalG)" />
      <circle cx="36" cy="52" r="3" fill="url(#actCalG)" />
      <circle cx="50" cy="52" r="3" fill="url(#actCalG)" />
      <circle cx="22" cy="62" r="3" fill="url(#actCalG)" opacity="0.5" />
      <circle cx="36" cy="62" r="3" fill="url(#actCalG)" opacity="0.5" />
    </svg>
  )
}

export default function Activity() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [authOpen, setAuthOpen]     = useState(false)
  const [activeTab, setActiveTab]   = useState('Ραντεβού')
  const [directionsOpen, setDirectionsOpen] = useState(false)
  const directionsRef = useRef(null)

  useEffect(() => {
    if (!directionsOpen) return
    const close = (e) => {
      if (directionsRef.current && !directionsRef.current.contains(e.target)) {
        setDirectionsOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [directionsOpen])

  if (loading) return <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }} />

  const upcoming = DEMO_BOOKINGS.filter(b => b.status === 'upcoming')
  const past     = DEMO_BOOKINGS.filter(b => b.status === 'past')
  const first    = upcoming[0]

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }}>

      {!user ? (
        /* ── Logged-out empty state ── */
        <div className="flex flex-col items-center justify-center px-8 text-center" style={{ paddingTop: '22vh' }}>
          <CalendarIllustration />

          <h2 className="text-[22px] font-bold mt-6" style={{ color: '#3D2B1F' }}>
            Καμία δραστηριότητα
          </h2>
          <p className="text-[14px] mt-2 leading-relaxed max-w-xs" style={{ color: '#A8A29E' }}>
            Συνδεθείτε ή εγγραφείτε για να δείτε τα επερχόμενα και τα προηγούμενα ραντεβού σας
          </p>

          <button
            onClick={() => navigate('/')}
            className="w-full max-w-xs h-[50px] rounded-full font-semibold text-[16px] mt-8 cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: '#1C1917', color: 'white', border: 'none' }}
          >
            Αναζήτηση χώρων
          </button>

          <button
            onClick={() => setAuthOpen(true)}
            className="w-full max-w-xs h-[50px] rounded-full font-semibold text-[16px] mt-3 cursor-pointer transition-colors hover:bg-[#EDE5D8]"
            style={{ background: 'transparent', color: '#3D2B1F', border: '1.5px solid rgba(61,43,31,0.35)' }}
          >
            Συνδεθείτε ή εγγραφείτε
          </button>
        </div>

      ) : (
        /* ── Logged-in content ── */
        <>
          <div className="px-5 pt-5 pb-3">
            <h1 className="text-[28px] font-bold" style={{ color: '#3D2B1F' }}>Δραστηριότητα</h1>
          </div>

          {/* Filter tabs */}
          <div
            className="flex gap-2 px-5 pb-4 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {TABS.map(tab => {
              const active = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full text-[14px] font-semibold cursor-pointer transition-colors"
                  style={active
                    ? { background: '#1C1917', color: 'white', border: 'none' }
                    : { background: 'transparent', color: '#3D2B1F', border: '1.5px solid rgba(61,43,31,0.28)' }
                  }
                >
                  {tab}
                  {active && tab === 'Ραντεβού' && upcoming.length > 0 && (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
                      style={{ background: 'rgba(255,255,255,0.22)', color: 'white' }}
                    >
                      {upcoming.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {activeTab === 'Ραντεβού' ? (
            <div className="px-5 pb-10 space-y-6">

              {/* ── Upcoming ── */}
              {first && (
                <div>
                  <h2
                    className="text-[18px] font-bold mb-3 flex items-center gap-2"
                    style={{ color: '#3D2B1F' }}
                  >
                    Επερχόμενα
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-semibold"
                      style={{ background: 'rgba(61,43,31,0.1)', color: '#3D2B1F' }}
                    >
                      {upcoming.length}
                    </span>
                  </h2>

                  <div
                    className="rounded-2xl overflow-hidden cursor-pointer"
                    style={{
                      background: '#FDFAF7',
                      boxShadow: '0 2px 16px rgba(61,43,31,0.09)',
                      border: '1px solid rgba(201,168,130,0.18)',
                    }}
                    onClick={() => navigate(`/activity/booking/${first.id}`)}
                  >
                    {/* Hero image with gradient overlay */}
                    <div className="relative w-full" style={{ height: 185 }}>
                      <img
                        src={first.image}
                        alt={first.business}
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(28,25,23,0.78) 0%, rgba(28,25,23,0.08) 55%, transparent 100%)' }}
                      />
                      <div className="absolute bottom-0 left-0 p-4">
                        <p
                          className="text-[12px] font-medium mb-1"
                          style={{ color: 'rgba(255,255,255,0.8)', letterSpacing: '0.02em' }}
                        >
                          Σε {first.daysUntil} ημέρες
                        </p>
                        <p className="text-[20px] font-bold text-white leading-tight">{first.business}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <p className="text-[15px] font-semibold" style={{ color: '#3D2B1F' }}>
                        {first.date} στις {first.time}
                      </p>
                      <p className="text-[13px] mt-0.5" style={{ color: '#A8A29E' }}>
                        {first.duration} · {first.price} € · {first.services} είδη
                      </p>

                      {/* Action buttons — stop card click propagation */}
                      <div
                        className="flex items-center gap-2 mt-3"
                        onClick={e => e.stopPropagation()}
                      >
                        {/* Directions + dropdown */}
                        <div className="relative flex-1" ref={directionsRef}>
                          <button
                            onClick={() => setDirectionsOpen(v => !v)}
                            className="w-full h-[40px] rounded-full text-[13px] font-semibold cursor-pointer transition-colors hover:bg-[#EDE5D8]"
                            style={{ background: 'transparent', color: '#3D2B1F', border: '1.5px solid rgba(61,43,31,0.28)' }}
                          >
                            Λήψη οδηγιών
                          </button>

                          {directionsOpen && (
                            <div
                              className="absolute bottom-full left-0 mb-2 z-[100] rounded-2xl overflow-hidden"
                              style={{
                                background: '#FDFAF7',
                                minWidth: 226,
                                boxShadow: '0 8px 28px rgba(28,25,23,0.16)',
                                border: '1px solid rgba(201,168,130,0.22)',
                              }}
                            >
                              <a
                                href={`maps://maps.apple.com/?q=${encodeURIComponent(first.address || first.business)}`}
                                className="block px-4 py-3.5 text-[15px] transition-colors hover:bg-[#F5F0EB]"
                                style={{ color: '#3D2B1F', textDecoration: 'none' }}
                              >
                                Άνοιγμα με Apple Maps
                              </a>
                              <div style={{ height: 1, background: 'rgba(201,168,130,0.2)' }} />
                              <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(first.address || first.business)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-4 py-3.5 text-[15px] transition-colors hover:bg-[#F5F0EB]"
                                style={{ color: '#3D2B1F', textDecoration: 'none' }}
                              >
                                Άνοιγμα με Google Maps
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Calendar+ circle button */}
                        <button
                          onClick={() => navigate(`/activity/booking/${first.id}`)}
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors hover:bg-[#EDE5D8]"
                          style={{ background: 'transparent', border: '1.5px solid rgba(61,43,31,0.28)' }}
                          aria-label="Προβολή λεπτομερειών"
                        >
                          <CalendarPlus className="w-4 h-4" style={{ color: '#3D2B1F' }} strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Previous ── */}
              {past.length > 0 && (
                <div>
                  <h2 className="text-[18px] font-bold mb-3" style={{ color: '#3D2B1F' }}>Προηγούμενα</h2>
                  <div className="space-y-3">
                    {past.map(b => (
                      <div
                        key={b.id}
                        className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-opacity hover:opacity-90"
                        style={{
                          background: '#FDFAF7',
                          boxShadow: '0 1px 8px rgba(61,43,31,0.07)',
                          border: '1px solid rgba(201,168,130,0.15)',
                        }}
                        onClick={() => navigate(`/activity/booking/${b.id}`)}
                      >
                        <img
                          src={b.image}
                          alt={b.business}
                          className="w-[68px] h-[68px] rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-bold truncate" style={{ color: '#3D2B1F' }}>
                            {b.business}
                          </p>
                          <p className="text-[13px] mt-0.5 truncate" style={{ color: '#A8A29E' }}>
                            {b.date} στις {b.time}
                          </p>
                          <p className="text-[13px]" style={{ color: '#A8A29E' }}>
                            {b.price} € · {b.services} είδη
                          </p>
                        </div>
                        <button
                          className="flex-shrink-0 px-3 h-9 rounded-full text-[13px] font-semibold cursor-pointer transition-colors hover:bg-[#EDE5D8] whitespace-nowrap"
                          style={{ background: 'transparent', color: '#3D2B1F', border: '1.5px solid rgba(61,43,31,0.28)' }}
                          onClick={e => { e.stopPropagation(); navigate('/') }}
                        >
                          Κάντε νέα κράτηση
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Other tabs — empty */
            <div className="flex flex-col items-center justify-center px-8 text-center" style={{ paddingTop: '18vh' }}>
              <CalendarIllustration />
              <p className="text-[17px] font-bold mt-5" style={{ color: '#3D2B1F' }}>Κανένα αποτέλεσμα</p>
              <p className="text-[14px] mt-2" style={{ color: '#A8A29E' }}>
                Δεν υπάρχουν {activeTab.toLowerCase()} ακόμα
              </p>
            </div>
          )}
        </>
      )}

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}
