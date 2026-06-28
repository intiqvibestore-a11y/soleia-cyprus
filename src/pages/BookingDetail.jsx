import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, ChevronRight,
  CalendarPlus, MessageSquare, Store,
  RefreshCw, CalendarX, Phone, X,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const DEMO_BOOKINGS = [
  {
    id: '1',
    business: 'Wow Beauty Lab MYMALL',
    businessId: 'wow-mymall',
    phone: '+35799199569',
    date: 'Πέμ 25 Ιουν 2026',
    time: '10:00 π.μ.',
    duration: '1 ω., 30 λ. — 3 υπηρεσίες',
    price: 170,
    services: 3,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1560066984-138daaa0ad8b?w=800&q=80',
    address: 'MY MALL, Λεμεσός 3040',
    service: '6 hands (SOFT gel manicure + gel polish pedicure + eyebrow shape)',
    subtotal: 146.77,
    tax: 23.23,
    location: [34.6701, 33.0413],
    calStart: '20260625T100000',
    calEnd: '20260625T113000',
  },
  {
    id: '2',
    business: 'Wow Beauty Lab MYMALL',
    businessId: 'wow-mymall',
    phone: '+35799199569',
    date: 'Παρ 19 Ιουν 2026',
    time: '10:00 π.μ.',
    duration: '1 ω., 30 λ. — 3 υπηρεσίες',
    price: 170,
    services: 3,
    status: 'past',
    image: 'https://images.unsplash.com/photo-1560066984-138daaa0ad8b?w=800&q=80',
    address: 'MY MALL, Λεμεσός 3040',
    service: '6 hands (SOFT gel manicure + gel polish pedicure + eyebrow shape)',
    subtotal: 146.77,
    tax: 23.23,
    location: [34.6701, 33.0413],
    calStart: '20260619T100000',
    calEnd: '20260619T113000',
  },
  {
    id: '3',
    business: 'Wow Beauty Lab MYMALL',
    businessId: 'wow-mymall',
    phone: '+35799199569',
    date: 'Σαβ 1 Φεβ 2026',
    time: '10:00 π.μ.',
    duration: '1 ω., 30 λ. — 3 υπηρεσίες',
    price: 170,
    services: 3,
    status: 'past',
    image: 'https://images.unsplash.com/photo-1560066984-138daaa0ad8b?w=800&q=80',
    address: 'MY MALL, Λεμεσός 3040',
    service: '6 hands (SOFT gel manicure + gel polish pedicure + eyebrow shape)',
    subtotal: 146.77,
    tax: 23.23,
    location: [34.6701, 33.0413],
    calStart: '20260201T100000',
    calEnd: '20260201T113000',
  },
]

const GOLD_ICON = L.divIcon({
  html: `<div style="
    width:28px;height:28px;
    background:linear-gradient(135deg,#C9A96E,#9B7540);
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:3px solid white;
    box-shadow:0 2px 10px rgba(0,0,0,0.25);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -36],
  className: '',
})

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

// Generic bottom-sheet wrapper
function Sheet({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[400]" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(28,25,23,0.5)' }} />
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-[28px] overflow-y-auto"
        style={{
          background: '#FAF6F1',
          maxHeight: '90vh',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function SheetHeader({ title, onClose }) {
  return (
    <div className="flex items-start justify-between px-6 pt-6 pb-2">
      <h2 className="text-[22px] font-bold flex-1 pr-3 leading-tight" style={{ color: '#1C1917' }}>
        {title}
      </h2>
      <button
        onClick={onClose}
        className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer flex-shrink-0"
        style={{ background: 'rgba(61,43,31,0.08)', border: 'none' }}
        aria-label="Κλείσιμο"
      >
        <X className="w-4 h-4" style={{ color: '#3D2B1F' }} strokeWidth={2} />
      </button>
    </div>
  )
}

function MiniBookingCard({ booking, showPrice = false }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 mx-6 mb-5 rounded-2xl"
      style={{
        background: 'rgba(245,240,235,0.8)',
        border: '1px solid rgba(201,168,130,0.2)',
        boxShadow: '0 1px 4px rgba(61,43,31,0.06)',
      }}
    >
      <img
        src={booking.image}
        alt={booking.business}
        className="w-[60px] h-[60px] rounded-xl object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold leading-snug" style={{ color: '#1C1917' }}>
          {booking.business}
        </p>
        <p className="text-[13px] mt-0.5" style={{ color: '#78716C' }}>
          {booking.date} στις {booking.time}
        </p>
        {showPrice ? (
          <p className="text-[13px]" style={{ color: '#78716C' }}>
            {booking.price} € · {booking.services} είδη
          </p>
        ) : (
          <p className="text-[13px]" style={{ color: '#78716C' }}>
            Διάρκεια {booking.duration.split('—')[0].trim()}
          </p>
        )}
      </div>
    </div>
  )
}

function ActionRow({ icon: Icon, label, onClick, danger = false, first = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 cursor-pointer transition-colors text-left ${danger ? 'hover:bg-red-50' : 'hover:bg-[#F5F0EB]'}`}
      style={{
        background: 'transparent',
        border: 'none',
        borderTop: first ? 'none' : '1px solid rgba(201,168,130,0.15)',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ background: danger ? 'rgba(239,68,68,0.08)' : 'rgba(201,168,130,0.15)' }}
      >
        <Icon
          className="w-5 h-5"
          style={{ color: danger ? '#EF4444' : '#C9A882' }}
          strokeWidth={1.7}
        />
      </div>
      <span
        className="flex-1 text-[15px] font-medium"
        style={{ color: danger ? '#EF4444' : '#3D2B1F' }}
      >
        {label}
      </span>
      <ChevronRight
        className="w-4 h-4 shrink-0"
        style={{ color: danger ? 'rgba(239,68,68,0.5)' : '#D1CAC1' }}
        strokeWidth={1.7}
      />
    </button>
  )
}

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const booking = DEMO_BOOKINGS.find(b => b.id === id) ?? DEMO_BOOKINGS[0]

  const [calendarSheet,   setCalendarSheet]   = useState(false)
  const [rescheduleSheet, setRescheduleSheet] = useState(false)
  const [cancelSheet,     setCancelSheet]     = useState(false)
  const [cancelSuccess,   setCancelSuccess]   = useState(false)

  useEffect(() => {
    if (!cancelSuccess) return
    const t = setTimeout(() => navigate('/activity'), 1500)
    return () => clearTimeout(t)
  }, [cancelSuccess, navigate])

  const downloadICS = () => {
    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Soleia Cyprus//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `DTSTART:${booking.calStart}`,
      `DTEND:${booking.calEnd}`,
      `SUMMARY:${booking.business}`,
      `LOCATION:${booking.address}`,
      `DESCRIPTION:${booking.service}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'soleia-booking.ics'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setCalendarSheet(false)
  }

  const googleCalUrl = [
    'https://calendar.google.com/calendar/render?action=TEMPLATE',
    `&text=${encodeURIComponent(booking.business)}`,
    `&dates=${booking.calStart}/${booking.calEnd}`,
    `&location=${encodeURIComponent(booking.address)}`,
    `&details=${encodeURIComponent(booking.service)}`,
  ].join('')

  const CARD = {
    background: '#FDFAF7',
    boxShadow: '0 1px 8px rgba(61,43,31,0.07)',
    border: '1px solid rgba(201,168,130,0.15)',
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB]">

      {/* ── Hero ── */}
      <div className="relative w-full" style={{ height: 260 }}>
        <img
          src={booking.image}
          alt={booking.business}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(28,25,23,0.82) 0%, rgba(28,25,23,0.1) 55%, transparent 100%)' }}
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', border: 'none' }}
          aria-label="Πίσω"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2.2} />
        </button>
        <div className="absolute bottom-0 left-0 p-5">
          <h1 className="text-[24px] font-bold text-white leading-tight">{booking.business}</h1>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 pt-5 pb-12 space-y-5">

        {/* Badge + date/time */}
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(201,168,130,0.16)', border: '1.5px solid rgba(201,168,130,0.38)' }}
          >
            <CheckCircle2 className="w-4 h-4" style={{ color: '#C9A882' }} strokeWidth={2} />
            <span className="text-[13px] font-semibold" style={{ color: '#C9A882' }}>Επιβεβαιωμένο</span>
          </div>
          <p className="text-[28px] font-bold leading-tight" style={{ color: '#3D2B1F' }}>{booking.date}</p>
          <p className="text-[28px] font-bold leading-tight" style={{ color: '#3D2B1F' }}>{booking.time}</p>
          <p className="text-[14px] mt-2" style={{ color: '#A8A29E' }}>{booking.duration}</p>
        </div>

        {/* Actions */}
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          <ActionRow
            icon={CalendarPlus}
            label="Προσθήκη στο ημερολόγιο"
            onClick={() => setCalendarSheet(true)}
            first
          />
          <ActionRow
            icon={MessageSquare}
            label="Αποστολή μηνύματος"
            onClick={() => navigate(`/messages/chat/${booking.businessId}`)}
          />
          <ActionRow
            icon={Store}
            label="Πληροφορίες για τον χώρο"
            onClick={() => navigate(`/business/${booking.businessId}`)}
          />
        </div>

        {/* Επισκόπηση */}
        <div>
          <h2 className="text-[18px] font-bold mb-3" style={{ color: '#3D2B1F' }}>Επισκόπηση</h2>
          <div className="rounded-2xl overflow-hidden" style={CARD}>
            <div className="px-4 py-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium leading-snug" style={{ color: '#3D2B1F' }}>
                  {booking.service}
                </p>
                <p className="text-[13px] mt-0.5" style={{ color: '#A8A29E' }}>{booking.duration}</p>
              </div>
              <p className="text-[15px] font-semibold shrink-0" style={{ color: '#3D2B1F' }}>
                {booking.price.toFixed(2)} €
              </p>
            </div>
            <div style={{ height: 1, background: 'rgba(201,168,130,0.18)', margin: '0 16px' }} />
            <div className="px-4 py-4 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-[14px]" style={{ color: '#A8A29E' }}>Υποσύνολο</span>
                <span className="text-[14px]" style={{ color: '#3D2B1F' }}>{booking.subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px]" style={{ color: '#A8A29E' }}>Φόρος (ΦΠΑ 19%)</span>
                <span className="text-[14px]" style={{ color: '#3D2B1F' }}>{booking.tax.toFixed(2)} €</span>
              </div>
              <div style={{ height: 1, background: 'rgba(201,168,130,0.18)' }} />
              <div className="flex justify-between">
                <span className="text-[15px] font-bold" style={{ color: '#3D2B1F' }}>Σύνολο</span>
                <span className="text-[15px] font-bold" style={{ color: '#3D2B1F' }}>{booking.price.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* Περισσότερες λεπτομέρειες */}
        <div>
          <h2 className="text-[18px] font-bold mb-3" style={{ color: '#3D2B1F' }}>Περισσότερες λεπτομέρειες</h2>
          <div className="rounded-2xl overflow-hidden" style={CARD}>
            <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(201,168,130,0.15)' }}>
              <p className="text-[14px] font-semibold mb-1" style={{ color: '#3D2B1F' }}>Πολιτική ακύρωσης</p>
              <p className="text-[13px] leading-relaxed" style={{ color: '#A8A29E' }}>
                Δωρεάν ακύρωση εντός 24 ωρών. Μετά από αυτό, ισχύει χρέωση 50% του κόστους.
              </p>
            </div>
            <ActionRow
              icon={RefreshCw}
              label="Επαναπρογραμματισμός ραντεβού"
              onClick={() => setRescheduleSheet(true)}
              first
            />
            <ActionRow
              icon={CalendarX}
              label="Ακύρωση ραντεβού"
              onClick={() => setCancelSheet(true)}
              danger
            />
          </div>
        </div>

        {/* Οδηγίες */}
        <div>
          <h2 className="text-[18px] font-bold mb-1" style={{ color: '#3D2B1F' }}>Οδηγίες</h2>
          <p className="text-[13px] mb-3" style={{ color: '#A8A29E' }}>{booking.address}</p>
          <div className="rounded-2xl overflow-hidden" style={{ height: 210 }}>
            <MapContainer
              center={booking.location}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="" />
              <Marker position={booking.location} icon={GOLD_ICON} />
            </MapContainer>
          </div>
        </div>
      </div>

      {/* ══ Calendar bottom sheet ══ */}
      {calendarSheet && (
        <Sheet onClose={() => setCalendarSheet(false)}>
          <SheetHeader title="Προσθήκη στο ημερολόγιο" onClose={() => setCalendarSheet(false)} />

          {/* Booking preview */}
          <div
            className="flex items-center gap-3 mx-6 mt-4 mb-5 p-3.5 rounded-2xl"
            style={{
              background: 'rgba(245,240,235,0.9)',
              border: '1px solid rgba(201,168,130,0.2)',
            }}
          >
            <img
              src={booking.image}
              alt={booking.business}
              className="w-[54px] h-[54px] rounded-xl object-cover flex-shrink-0"
            />
            <div>
              <p className="text-[14px] font-semibold" style={{ color: '#1C1917' }}>
                {booking.date} στις {booking.time}
              </p>
              <p className="text-[13px] mt-0.5" style={{ color: '#78716C' }}>{booking.address}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="px-6 space-y-3">
            <a
              href={googleCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full h-[54px] rounded-full font-semibold text-[15px] transition-colors hover:bg-[#EDE5D8] cursor-pointer"
              style={{ background: 'transparent', color: '#1C1917', border: '1.5px solid rgba(61,43,31,0.3)', textDecoration: 'none' }}
              onClick={() => setCalendarSheet(false)}
            >
              <GoogleIcon />
              Ημερολόγιο Google
            </a>
            <button
              onClick={downloadICS}
              className="flex items-center justify-center w-full h-[54px] rounded-full font-semibold text-[15px] cursor-pointer transition-colors hover:bg-[#EDE5D8]"
              style={{ background: 'transparent', color: '#1C1917', border: '1.5px solid rgba(61,43,31,0.3)' }}
            >
              Άλλο ημερολόγιο
            </button>
          </div>
        </Sheet>
      )}

      {/* ══ Reschedule bottom sheet ══ */}
      {rescheduleSheet && (
        <Sheet onClose={() => setRescheduleSheet(false)}>
          <SheetHeader title="Επαναπρογραμματισμός ραντεβού" onClose={() => setRescheduleSheet(false)} />
          <MiniBookingCard booking={booking} />

          <div className="px-6 mb-6">
            <p className="text-[14px] leading-relaxed" style={{ color: '#78716C' }}>
              Δεν είστε σίγουροι; Επικοινωνήστε απευθείας με {booking.business}.
            </p>
            <a
              href={`tel:${booking.phone}`}
              className="inline-flex items-center gap-2 mt-3 px-4 h-[40px] rounded-full font-semibold text-[14px] transition-colors hover:bg-[#EDE5D8] cursor-pointer"
              style={{ background: 'transparent', color: '#1C1917', border: '1.5px solid rgba(61,43,31,0.3)', textDecoration: 'none' }}
            >
              <Phone className="w-4 h-4" strokeWidth={1.8} />
              Κλήση
            </a>
          </div>

          <div className="flex gap-3 px-6">
            <button
              onClick={() => setRescheduleSheet(false)}
              className="flex-1 h-[50px] rounded-full font-semibold text-[15px] cursor-pointer transition-colors hover:bg-[#EDE5D8]"
              style={{ background: 'transparent', color: '#3D2B1F', border: '1.5px solid rgba(61,43,31,0.35)' }}
            >
              Επιστροφή
            </button>
            <button
              onClick={() => { setRescheduleSheet(false); navigate(`/booking/reschedule/${id}`) }}
              className="flex-1 h-[50px] rounded-full font-semibold text-[15px] cursor-pointer transition-opacity hover:opacity-80"
              style={{ background: '#1C1917', color: 'white', border: 'none' }}
            >
              Συνέχεια
            </button>
          </div>
        </Sheet>
      )}

      {/* ══ Cancel bottom sheet ══ */}
      {cancelSheet && (
        <Sheet onClose={() => setCancelSheet(false)}>
          <SheetHeader title="Θέλετε σίγουρα να ακυρώσετε;" onClose={() => setCancelSheet(false)} />
          <MiniBookingCard booking={booking} showPrice />

          <div className="px-6 mb-6">
            <p className="text-[14px] leading-relaxed" style={{ color: '#78716C' }}>
              Δεν είστε σίγουροι; Επικοινωνήστε απευθείας με τον {booking.business}.
            </p>
            <a
              href={`tel:${booking.phone}`}
              className="inline-flex items-center gap-2 mt-3 px-4 h-[40px] rounded-full font-semibold text-[14px] transition-colors hover:bg-[#EDE5D8] cursor-pointer"
              style={{ background: 'transparent', color: '#1C1917', border: '1.5px solid rgba(61,43,31,0.3)', textDecoration: 'none' }}
            >
              <Phone className="w-4 h-4" strokeWidth={1.8} />
              Κλήση
            </a>
          </div>

          <div className="flex gap-3 px-6">
            <button
              onClick={() => setCancelSheet(false)}
              className="flex-1 h-[50px] rounded-full font-semibold text-[15px] cursor-pointer transition-colors hover:bg-[#EDE5D8]"
              style={{ background: 'transparent', color: '#3D2B1F', border: '1.5px solid rgba(61,43,31,0.35)' }}
            >
              Επιστροφή
            </button>
            <button
              onClick={() => { setCancelSheet(false); setCancelSuccess(true) }}
              className="flex-1 h-[50px] rounded-full font-semibold text-[15px] cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: '#DC2626', color: 'white', border: 'none' }}
            >
              Ναι, ακυρώστε την
            </button>
          </div>
        </Sheet>
      )}

      {/* ══ Cancel success overlay ══ */}
      {cancelSuccess && (
        <div
          className="fixed inset-0 z-[600] flex flex-col items-center justify-center"
          style={{ background: '#F5F0EB' }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'rgba(201,168,130,0.2)' }}
          >
            <CheckCircle2
              className="w-10 h-10"
              style={{ color: '#C9A882' }}
              strokeWidth={1.8}
            />
          </div>
          <p className="text-[20px] font-bold" style={{ color: '#3D2B1F' }}>
            Η ακύρωση ολοκληρώθηκε
          </p>
        </div>
      )}
    </div>
  )
}
