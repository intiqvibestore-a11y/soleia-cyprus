import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, Phone, Clock } from 'lucide-react'
import { supabase } from '../utils/supabase/client'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'

// Fix Leaflet default marker icon with bundlers (Vite)
const customMarker = L.divIcon({
  html: `<div style="width:22px;height:22px;background:#C9A882;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  className: '',
})

const NICOSIA = [34.6786, 33.0413]

export default function BusinessProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: biz }, { data: svcs }] = await Promise.all([
        supabase.from('businesses').select('*').eq('id', id).single(),
        supabase.from('services').select('*').eq('business_id', id).order('price'),
      ])
      setBusiness(biz)
      setServices(svcs || [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C9A882', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-8 text-center" style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }}>
        <p className="text-[18px] font-semibold" style={{ color: '#3D2B1F' }}>Δεν βρέθηκε ο χώρος</p>
        <button onClick={() => navigate(-1)} className="text-[14px] underline cursor-pointer" style={{ color: '#C9A882', background: 'none', border: 'none' }}>
          Επιστροφή
        </button>
      </div>
    )
  }

  const lat = business.lat ?? business.latitude ?? NICOSIA[0]
  const lng = business.lng ?? business.longitude ?? NICOSIA[1]
  const mapCenter = [lat, lng]

  return (
    <div className="min-h-screen pb-28" style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }}>

      {/* Hero */}
      <div className="relative w-full" style={{ height: 260 }}>
        {business.cover_url ? (
          <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#E8D5B7] to-[#C9A882]" />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, transparent 55%)' }} />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-4 w-10 h-10 flex items-center justify-center rounded-full cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', border: 'none' }}
          aria-label="Πίσω"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
        </button>
      </div>

      <div className="px-5 pt-5">

        {/* Name */}
        <h1 className="text-[24px] font-bold leading-tight" style={{ color: '#3D2B1F' }}>{business.name}</h1>
        {business.category && (
          <p className="text-[14px] font-semibold mt-1" style={{ color: '#C9A882' }}>{business.category}</p>
        )}

        {/* Rating + city */}
        <div className="flex flex-wrap items-center gap-4 mt-2.5">
          {business.rating != null && (
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" strokeWidth={0} />
              <span className="text-[14px] font-semibold" style={{ color: '#1C1917' }}>
                {Number(business.rating).toFixed(1)}
              </span>
              {business.review_count != null && (
                <span className="text-[13px]" style={{ color: '#78716C' }}>
                  ({business.review_count} αξιολογήσεις)
                </span>
              )}
            </div>
          )}
          {business.city && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" style={{ color: '#A8A29E' }} strokeWidth={1.7} />
              <span className="text-[13px]" style={{ color: '#78716C' }}>{business.city}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {business.description && (
          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: '#78716C' }}>{business.description}</p>
        )}

        {/* Phone */}
        {business.phone && (
          <a
            href={`tel:${business.phone}`}
            className="inline-flex items-center gap-2.5 mt-4"
            style={{ textDecoration: 'none' }}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F0EBE5' }}>
              <Phone className="w-4 h-4" style={{ color: '#C9A882' }} strokeWidth={1.7} />
            </div>
            <span className="text-[14px] font-medium" style={{ color: '#3D2B1F' }}>{business.phone}</span>
          </a>
        )}

        {/* Book CTA */}
        <button
          onClick={() => navigate(`/booking/${id}`)}
          className="w-full py-[15px] rounded-full font-semibold text-[16px] cursor-pointer mt-5"
          style={{ background: '#1C1917', color: 'white', border: 'none' }}
        >
          Κλείστε ραντεβού
        </button>

        {/* Services */}
        {services.length > 0 && (
          <div className="mt-7">
            <h2 className="text-[18px] font-bold mb-3" style={{ color: '#3D2B1F' }}>Υπηρεσίες</h2>
            <div className="flex flex-col gap-3">
              {services.map(svc => (
                <div
                  key={svc.id}
                  className="bg-white rounded-2xl px-4 py-4 flex items-center justify-between gap-3"
                  style={{ boxShadow: '0 1px 6px rgba(28,25,23,0.07)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold" style={{ color: '#1C1917' }}>{svc.name}</p>
                    {(svc.duration || svc.price != null) && (
                      <div className="flex items-center gap-3 mt-0.5">
                        {svc.duration && (
                          <span className="flex items-center gap-1 text-[12px]" style={{ color: '#78716C' }}>
                            <Clock className="w-3 h-3" strokeWidth={1.7} />{svc.duration}
                          </span>
                        )}
                        {svc.price != null && (
                          <span className="text-[13px] font-semibold" style={{ color: '#C9A882' }}>€{svc.price}</span>
                        )}
                      </div>
                    )}
                    {svc.description && (
                      <p className="text-[12px] mt-1 leading-relaxed" style={{ color: '#A8A29E' }}>{svc.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/booking/${id}?service=${svc.id}`)}
                    className="shrink-0 px-4 py-2.5 rounded-full text-[13px] font-semibold cursor-pointer"
                    style={{ background: '#1C1917', color: 'white', border: 'none' }}
                  >
                    Κράτηση
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map */}
        <div className="mt-7 mb-4">
          <h2 className="text-[18px] font-bold mb-3" style={{ color: '#3D2B1F' }}>Τοποθεσία</h2>
          <div className="rounded-2xl overflow-hidden" style={{ height: 200, zIndex: 0 }}>
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              scrollWheelZoom={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={mapCenter} icon={customMarker} />
            </MapContainer>
          </div>
          {business.address && (
            <p className="mt-2 text-[13px]" style={{ color: '#78716C' }}>{business.address}</p>
          )}
        </div>

      </div>
    </div>
  )
}
