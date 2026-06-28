import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react'
import { supabase } from '../utils/supabase/client'

// 30-min slots 09:00 – 17:30
const TIME_SLOTS = []
for (let h = 9; h < 18; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`)
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`)
}

const MONTHS_GR = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος',
  'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος',
  'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
]
const DAYS_GR = ['Κυ', 'Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα']

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate() }
function getFirstDay(y, m)    { return new Date(y, m, 1).getDay() }

function isPast(y, m, d) {
  const date  = new Date(y, m, d); date.setHours(0, 0, 0, 0)
  const today = new Date();        today.setHours(0, 0, 0, 0)
  return date < today
}

function formatDate(date) {
  if (!date) return ''
  return date.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Booking() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const preServiceId = searchParams.get('service')

  const [business,  setBusiness]  = useState(null)
  const [services,  setServices]  = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const [step,            setStep]            = useState(preServiceId ? 1 : 0)
  const [selectedService, setSelectedService] = useState(null)

  const today = new Date()
  const [viewYear,      setViewYear]      = useState(today.getFullYear())
  const [viewMonth,     setViewMonth]     = useState(today.getMonth())
  const [selectedDate,  setSelectedDate]  = useState(null)
  const [selectedTime,  setSelectedTime]  = useState(null)
  const [confirming,    setConfirming]    = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: biz }, { data: svcs }] = await Promise.all([
        supabase.from('businesses').select('id, name, city, category').eq('id', id).single(),
        supabase.from('services').select('*').eq('business_id', id).order('price'),
      ])
      setBusiness(biz)
      const list = svcs || []
      setServices(list)
      if (preServiceId) {
        const pre = list.find(s => String(s.id) === String(preServiceId))
        if (pre) setSelectedService(pre)
      }
      setLoadingData(false)
    }
    load()
  }, [id, preServiceId])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const handleConfirm = async () => {
    setConfirming(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('bookings').insert({
      business_id:  id,
      service_id:   selectedService?.id ?? null,
      service_name: selectedService?.name ?? null,
      price:        selectedService?.price ?? null,
      booking_date: selectedDate.toISOString().split('T')[0],
      booking_time: selectedTime,
      status:       'confirmed',
      user_id:      user?.id ?? null,
    })
    setConfirming(false)
    navigate('/activity')
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }}>
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: '#C9A882', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay    = getFirstDay(viewYear, viewMonth)

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-28" style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <button
          onClick={() => (step === 0 ? navigate(-1) : setStep(s => s - 1))}
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer mb-4"
          style={{ background: 'none', border: 'none' }}
          aria-label="Πίσω"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
        </button>
        <h1 className="text-[22px] font-bold leading-tight" style={{ color: '#3D2B1F' }}>
          {business?.name || 'Κράτηση'}
        </h1>
        {business?.city && (
          <p className="text-[13px] mt-0.5" style={{ color: '#A8A29E' }}>{business.city}</p>
        )}
      </div>

      {/* Step indicators */}
      <div className="flex items-start gap-0 px-5 mt-3 mb-6">
        {['Υπηρεσία', 'Ημερομηνία', 'Επιβεβαίωση'].map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
                style={{
                  background: i < step ? '#C9A882' : i === step ? '#1C1917' : '#E8E0D8',
                  color: (i < step || i === step) ? 'white' : '#A8A29E',
                }}
              >
                {i < step ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : i + 1}
              </div>
              <span className="text-[10px] font-medium whitespace-nowrap" style={{ color: i === step ? '#1C1917' : '#A8A29E' }}>
                {label}
              </span>
            </div>
            {i < 2 && (
              <div className="flex-1 h-px mx-2 mb-4" style={{ background: i < step ? '#C9A882' : '#E8E0D8' }} />
            )}
          </div>
        ))}
      </div>

      <div className="px-5">

        {/* ── Step 0: Select service ─────────────────────────────────────────── */}
        {step === 0 && (
          <div>
            <h2 className="text-[17px] font-semibold mb-4" style={{ color: '#3D2B1F' }}>Επιλέξτε υπηρεσία</h2>
            {services.length === 0 ? (
              <p className="text-center py-12 text-[14px]" style={{ color: '#A8A29E' }}>Δεν βρέθηκαν υπηρεσίες</p>
            ) : (
              <div className="flex flex-col gap-3">
                {services.map(svc => (
                  <button
                    key={svc.id}
                    onClick={() => { setSelectedService(svc); setStep(1) }}
                    className="bg-white rounded-2xl px-4 py-4 flex items-center justify-between gap-3 cursor-pointer text-left w-full"
                    style={{
                      border: `1.5px solid ${selectedService?.id === svc.id ? '#C9A882' : '#F0EBE5'}`,
                      boxShadow: '0 1px 6px rgba(28,25,23,0.07)',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold" style={{ color: '#1C1917' }}>{svc.name}</p>
                      {svc.duration && (
                        <span className="flex items-center gap-1 mt-0.5 text-[12px]" style={{ color: '#78716C' }}>
                          <Clock className="w-3 h-3" strokeWidth={1.7} />{svc.duration}
                        </span>
                      )}
                      {svc.description && (
                        <p className="text-[12px] mt-1 leading-relaxed" style={{ color: '#A8A29E' }}>{svc.description}</p>
                      )}
                    </div>
                    {svc.price != null && (
                      <span className="text-[17px] font-bold shrink-0" style={{ color: '#C9A882' }}>€{svc.price}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 1: Date + time ────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            {/* Selected service recap */}
            {selectedService && (
              <div
                className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between mb-5"
                style={{ boxShadow: '0 1px 6px rgba(28,25,23,0.07)' }}
              >
                <div>
                  <p className="text-[14px] font-semibold" style={{ color: '#1C1917' }}>{selectedService.name}</p>
                  {selectedService.duration && (
                    <p className="text-[12px]" style={{ color: '#78716C' }}>{selectedService.duration}</p>
                  )}
                </div>
                {selectedService.price != null && (
                  <p className="text-[16px] font-bold" style={{ color: '#C9A882' }}>€{selectedService.price}</p>
                )}
              </div>
            )}

            {/* Calendar */}
            <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: '0 1px 6px rgba(28,25,23,0.07)' }}>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
                  style={{ background: '#F5F0EB', border: 'none' }}
                >
                  <ChevronLeft className="w-4 h-4" style={{ color: '#78716C' }} />
                </button>
                <span className="text-[15px] font-semibold" style={{ color: '#1C1917' }}>
                  {MONTHS_GR[viewMonth]} {viewYear}
                </span>
                <button
                  onClick={nextMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
                  style={{ background: '#F5F0EB', border: 'none' }}
                >
                  <ChevronRight className="w-4 h-4" style={{ color: '#78716C' }} />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS_GR.map(d => (
                  <div key={d} className="text-center text-[11px] font-semibold py-1" style={{ color: '#A8A29E' }}>{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} />)}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day  = i + 1
                  const date = new Date(viewYear, viewMonth, day)
                  const past = isPast(viewYear, viewMonth, day)
                  const sel  = selectedDate?.toDateString() === date.toDateString()
                  return (
                    <button
                      key={day}
                      disabled={past}
                      onClick={() => { setSelectedDate(date); setSelectedTime(null) }}
                      className="aspect-square rounded-xl text-[13px] font-medium"
                      style={{
                        background:    sel  ? '#1C1917' : 'transparent',
                        color:         past ? '#D1CAC1' : sel ? 'white' : '#3D2B1F',
                        border:        'none',
                        cursor:        past ? 'not-allowed' : 'pointer',
                        transition:    'background 150ms',
                      }}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="bg-white rounded-2xl p-4 mb-5" style={{ boxShadow: '0 1px 6px rgba(28,25,23,0.07)' }}>
                <h3 className="text-[13px] font-semibold mb-3" style={{ color: '#3D2B1F' }}>
                  Επιλέξτε ώρα &middot; {formatDate(selectedDate)}
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className="py-2.5 rounded-xl text-[13px] font-medium cursor-pointer"
                      style={{
                        background: selectedTime === t ? '#1C1917' : '#F5F0EB',
                        color:      selectedTime === t ? 'white'    : '#3D2B1F',
                        border:     'none',
                        transition: 'background 150ms',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!selectedDate || !selectedTime}
              className="w-full py-[15px] rounded-full font-semibold text-[16px]"
              style={{
                background: !selectedDate || !selectedTime ? '#E8E0D8' : '#1C1917',
                color:      !selectedDate || !selectedTime ? '#A8A29E' : 'white',
                border:     'none',
                cursor:     !selectedDate || !selectedTime ? 'not-allowed' : 'pointer',
              }}
            >
              Συνέχεια
            </button>
          </div>
        )}

        {/* ── Step 2: Confirmation ───────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-[17px] font-semibold mb-4" style={{ color: '#3D2B1F' }}>Επιβεβαίωση κράτησης</h2>

            <div className="bg-white rounded-2xl overflow-hidden mb-5" style={{ boxShadow: '0 1px 6px rgba(28,25,23,0.07)' }}>
              {[
                ['Χώρος',      business?.name],
                ['Υπηρεσία',   selectedService?.name],
                ['Ημερομηνία', formatDate(selectedDate)],
                ['Ώρα',        selectedTime],
                ['Διάρκεια',   selectedService?.duration],
                ['Τιμή',       selectedService?.price != null ? `€${selectedService.price}` : null],
              ]
                .filter(([, v]) => v)
                .map(([label, value], i, arr) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-4 py-3.5"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid #F5F0EB' : 'none' }}
                  >
                    <span className="text-[13px]" style={{ color: '#78716C' }}>{label}</span>
                    <span
                      className="text-[14px] font-semibold text-right"
                      style={{ color: label === 'Τιμή' ? '#C9A882' : '#1C1917', maxWidth: '60%' }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
            </div>

            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full py-[15px] rounded-full font-semibold text-[16px] cursor-pointer"
              style={{
                background: confirming ? '#A8A29E' : '#1C1917',
                color: 'white',
                border: 'none',
                opacity: confirming ? 0.8 : 1,
              }}
            >
              {confirming ? 'Αποθήκευση...' : 'Επιβεβαίωση κράτησης'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
