import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, ChevronRight,
  CalendarPlus, MessageSquare, Store,
  RefreshCw, CalendarX,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const DEMO_BOOKINGS = [
  {
    id: '1',
    business: 'Wow Beauty Lab MYMALL',
    date: 'Πέμ 25 Ιουν 2026',
    time: '10:00 π.μ.',
    duration: '1 ω., 30 λ. — 3 υπηρεσίες',
    price: 170,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1560066984-138daaa0ad8b?w=800&q=80',
    address: 'MY MALL, Λεμεσός 3040',
    service: '6 hands (SOFT gel manicure + gel polish pedicure + eyebrow shape)',
    subtotal: 146.77,
    tax: 23.23,
    location: [34.6701, 33.0413],
  },
  {
    id: '2',
    business: 'Wow Beauty Lab MYMALL',
    date: 'Παρ 19 Ιουν 2026',
    time: '10:00 π.μ.',
    duration: '1 ω., 30 λ. — 3 υπηρεσίες',
    price: 170,
    status: 'past',
    image: 'https://images.unsplash.com/photo-1560066984-138daaa0ad8b?w=800&q=80',
    address: 'MY MALL, Λεμεσός 3040',
    service: '6 hands (SOFT gel manicure + gel polish pedicure + eyebrow shape)',
    subtotal: 146.77,
    tax: 23.23,
    location: [34.6701, 33.0413],
  },
  {
    id: '3',
    business: 'Wow Beauty Lab MYMALL',
    date: 'Σαβ 1 Φεβ 2026',
    time: '10:00 π.μ.',
    duration: '1 ω., 30 λ. — 3 υπηρεσίες',
    price: 170,
    status: 'past',
    image: 'https://images.unsplash.com/photo-1560066984-138daaa0ad8b?w=800&q=80',
    address: 'MY MALL, Λεμεσός 3040',
    service: '6 hands (SOFT gel manicure + gel polish pedicure + eyebrow shape)',
    subtotal: 146.77,
    tax: 23.23,
    location: [34.6701, 33.0413],
  },
]

// Warm gold teardrop marker
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

  const CARD_STYLE = {
    background: '#FDFAF7',
    boxShadow: '0 1px 8px rgba(61,43,31,0.07)',
    border: '1px solid rgba(201,168,130,0.15)',
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB] pt-[62px]">

      {/* ── Hero image ── */}
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

        {/* Back arrow */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', border: 'none' }}
          aria-label="Πίσω"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2.2} />
        </button>

        {/* Business name */}
        <div className="absolute bottom-0 left-0 p-5">
          <h1 className="text-[24px] font-bold text-white leading-tight">
            {booking.business}
          </h1>
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="px-5 pt-5 pb-12 space-y-5">

        {/* Confirmed badge + date/time */}
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
            style={{
              background: 'rgba(201,168,130,0.16)',
              border: '1.5px solid rgba(201,168,130,0.38)',
            }}
          >
            <CheckCircle2 className="w-4 h-4" style={{ color: '#C9A882' }} strokeWidth={2} />
            <span className="text-[13px] font-semibold" style={{ color: '#C9A882' }}>Επιβεβαιωμένο</span>
          </div>

          <p className="text-[28px] font-bold leading-tight" style={{ color: '#3D2B1F' }}>
            {booking.date}
          </p>
          <p className="text-[28px] font-bold leading-tight" style={{ color: '#3D2B1F' }}>
            {booking.time}
          </p>
          <p className="text-[14px] mt-2" style={{ color: '#A8A29E' }}>{booking.duration}</p>
        </div>

        {/* Actions */}
        <div className="rounded-2xl overflow-hidden" style={CARD_STYLE}>
          <ActionRow icon={CalendarPlus} label="Προσθήκη στο ημερολόγιο" first />
          <ActionRow icon={MessageSquare} label="Αποστολή μηνύματος" onClick={() => navigate('/messages')} />
          <ActionRow icon={Store} label="Πληροφορίες για τον χώρο" />
        </div>

        {/* Επισκόπηση */}
        <div>
          <h2 className="text-[18px] font-bold mb-3" style={{ color: '#3D2B1F' }}>Επισκόπηση</h2>
          <div className="rounded-2xl overflow-hidden" style={CARD_STYLE}>
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
          <div className="rounded-2xl overflow-hidden" style={CARD_STYLE}>
            <div
              className="px-4 py-4"
              style={{ borderBottom: '1px solid rgba(201,168,130,0.15)' }}
            >
              <p className="text-[14px] font-semibold mb-1" style={{ color: '#3D2B1F' }}>Πολιτική ακύρωσης</p>
              <p className="text-[13px] leading-relaxed" style={{ color: '#A8A29E' }}>
                Δωρεάν ακύρωση εντός 24 ωρών. Μετά από αυτό, ισχύει χρέωση 50% του κόστους.
              </p>
            </div>
            <ActionRow icon={RefreshCw} label="Επαναπρογραμματισμός ραντεβού" first />
            <ActionRow icon={CalendarX} label="Ακύρωση ραντεβού" danger />
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
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution=""
              />
              <Marker position={booking.location} icon={GOLD_ICON} />
            </MapContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
