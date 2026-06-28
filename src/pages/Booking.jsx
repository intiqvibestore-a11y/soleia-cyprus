import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check, Clock, MapPin, Star, Shield, CreditCard, User, Mail, Phone } from 'lucide-react'
import { useT } from '../context/LanguageContext'

const TIME_SLOTS  = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00']
const UNAVAILABLE = ['09:00','10:30','14:30']

const PROVIDERS_MAP = {
  1: { name: 'Maria Theodorou',    service: 'Deep Tissue Massage',  price: 65,  duration: '60 min',  location: 'Limassol', rating: 4.9, reviews: 218, avatar: 'MT' },
  2: { name: 'Elena Constantinou', service: 'Full Lash & Brow Set', price: 45,  duration: '90 min',  location: 'Nicosia',  rating: 4.8, reviews: 174, avatar: 'EC' },
  3: { name: 'Ioanna Stavrou',     service: 'Balayage & Cut',       price: 90,  duration: '120 min', location: 'Paphos',   rating: 4.9, reviews: 132, avatar: 'IS' },
}

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay() }

export default function Booking() {
  const T = useT()
  const { serviceId } = useParams()
  const provider = PROVIDERS_MAP[serviceId] || PROVIDERS_MAP[1]

  const today = new Date()
  const [viewYear, setViewYear]     = useState(today.getFullYear())
  const [viewMonth, setViewMonth]   = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [step, setStep]             = useState(0)
  const [form, setForm]             = useState({ name: '', email: '', phone: '', notes: '' })
  const [submitted, setSubmitted]   = useState(false)
  const [loading, setLoading]       = useState(false)

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay    = getFirstDayOfMonth(viewYear, viewMonth)

  const prevMonth = () => { if (viewMonth === 0) { setViewYear(y=>y-1); setViewMonth(11) } else setViewMonth(m=>m-1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewYear(y=>y+1); setViewMonth(0) } else setViewMonth(m=>m+1) }

  const isPast = (day) => {
    const d = new Date(viewYear, viewMonth, day); d.setHours(0,0,0,0)
    const t = new Date(); t.setHours(0,0,0,0)
    return d < t
  }

  const handleConfirm = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1400))
    setLoading(false); setSubmitted(true)
  }

  const formatDate = (date) => {
    if (!date) return ''
    return date.toLocaleDateString(T.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formFields = [
    { id: 'name',  label: T.book_full_name, type: 'text',  icon: User,  placeholder: 'Alexandra Papadopoulos' },
    { id: 'email', label: T.book_email,     type: 'email', icon: Mail,  placeholder: 'you@example.com' },
    { id: 'phone', label: T.book_phone,     type: 'tel',   icon: Phone, placeholder: '+357 99 000 000' },
  ]

  const reviewRows = [
    provider.service, provider.name, formatDate(selectedDate), selectedTime,
    provider.duration, provider.location, form.name, form.email, form.phone,
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F0EB] to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#F5F0EB] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#C9A882]" strokeWidth={2.5} />
          </div>
          <h1 className="font-display font-medium text-3xl text-[#1C1917] mb-2">{T.book_confirmed_title}</h1>
          <p className="text-[#78716C] mb-6 leading-relaxed">
            {T.book_confirmed_with} <strong className="text-[#1C1917]">{provider.name}</strong>{' '}
            {T.book_confirmed_for} <strong className="text-[#1C1917]">{formatDate(selectedDate)}</strong>{' '}
            {T.book_confirmed_at} <strong className="text-[#1C1917]">{selectedTime}</strong>.{' '}
            {T.book_confirmed_email_sent} <strong className="text-[#1C1917]">{form.email}</strong>.
          </p>
          <div className="bg-white border border-[#F0EAE3] rounded-2xl p-5 text-left mb-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#F0EAE3]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8D5B7] to-[#C9A882] flex items-center justify-center text-[#1C1917] font-bold">
                {provider.avatar}
              </div>
              <div>
                <p className="font-semibold text-[#1C1917] text-sm">{provider.name}</p>
                <p className="text-[#C9A882] text-xs">{provider.service}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-[#78716C]">
              <div className="flex justify-between"><span>{T.book_labels[2]}</span><span className="font-medium text-[#1C1917]">{formatDate(selectedDate)}</span></div>
              <div className="flex justify-between"><span>{T.book_labels[3]}</span><span className="font-medium text-[#1C1917]">{selectedTime}</span></div>
              <div className="flex justify-between"><span>{T.book_labels[4]}</span><span className="font-medium text-[#1C1917]">{provider.duration}</span></div>
              <div className="flex justify-between pt-2 border-t border-[#F0EAE3]">
                <span className="font-semibold">{T.book_total_paid}</span>
                <span className="font-bold text-[#1C1917]">€{provider.price}</span>
              </div>
            </div>
          </div>
          <Link to="/" className="btn-press inline-flex items-center gap-2 bg-[#1C1917] hover:bg-[#3D3530] text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200">
            {T.book_back_home}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={`/providers/${serviceId}`} className="inline-flex items-center gap-1.5 text-sm text-[#78716C] hover:text-[#1C1917] transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" />{T.book_back_profile}
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-0 mb-8">
          {T.book_steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${
                  i < step ? 'bg-[#C9A882] text-white' : i === step ? 'bg-[#1C1917] text-white' : 'bg-[#E8E0D8] text-[#78716C]'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 font-medium ${i === step ? 'text-[#1C1917]' : 'text-[#A8A29E]'}`}>{s}</span>
              </div>
              {i < T.book_steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors duration-300 ${i < step ? 'bg-[#C9A882]' : 'bg-[#E8E0D8]'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Step 0: Date */}
            {step === 0 && (
              <div className="bg-white rounded-2xl border border-[#F0EAE3] shadow-sm p-6">
                <h2 className="text-xl font-semibold text-[#1C1917] mb-5">{T.book_select_date}</h2>
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevMonth} className="btn-press p-2 hover:bg-[#F5F0EB] rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-[#78716C]" /></button>
                  <span className="font-semibold text-[#1C1917]">{T.months[viewMonth]} {viewYear}</span>
                  <button onClick={nextMonth} className="btn-press p-2 hover:bg-[#F5F0EB] rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-[#78716C]" /></button>
                </div>
                <div className="grid grid-cols-7 mb-2">
                  {T.days_booking.map(d => <div key={d} className="text-center text-xs font-semibold text-[#A8A29E] py-2">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {[...Array(firstDay)].map((_, i) => <div key={`e-${i}`} />)}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1
                    const date = new Date(viewYear, viewMonth, day)
                    const past = isPast(day)
                    const sel = selectedDate && selectedDate.toDateString() === date.toDateString()
                    return (
                      <button key={day} disabled={past} onClick={() => setSelectedDate(date)}
                        className={`aspect-square rounded-xl text-sm font-medium transition-all duration-150 ${
                          past ? 'text-[#E8E0D8] cursor-not-allowed' :
                          sel  ? 'bg-[#1C1917] text-white shadow-md' :
                                 'hover:bg-[#F5F0EB] hover:text-[#1C1917] text-[#78716C] cursor-pointer'
                        }`}>{day}</button>
                    )
                  })}
                </div>
                <button disabled={!selectedDate} onClick={() => setStep(1)}
                  className="btn-press mt-6 w-full bg-[#1C1917] hover:bg-[#3D3530] disabled:bg-[#E8E0D8] disabled:cursor-not-allowed text-white disabled:text-[#A8A29E] font-semibold py-3.5 rounded-xl transition-colors duration-200">
                  {selectedDate ? `${T.book_date_prefix} ${formatDate(selectedDate)}` : T.book_pick_date_hint}
                </button>
              </div>
            )}

            {/* Step 1: Time */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-[#F0EAE3] shadow-sm p-6">
                <h2 className="text-xl font-semibold text-[#1C1917] mb-1">{T.book_select_time}</h2>
                <p className="text-sm text-[#78716C] mb-5">{formatDate(selectedDate)}</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {TIME_SLOTS.map(t => {
                    const unavail = UNAVAILABLE.includes(t), sel = selectedTime === t
                    return (
                      <button key={t} disabled={unavail} onClick={() => setSelectedTime(t)}
                        className={`btn-press py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                          unavail ? 'bg-[#F5F0EB] text-[#C8C0B8] line-through cursor-not-allowed' :
                          sel     ? 'bg-[#1C1917] text-white shadow-md' :
                                    'bg-[#F5F0EB] hover:bg-[#EDE4D8] text-[#78716C] border border-[#E8E0D8] cursor-pointer'
                        }`}>{t}</button>
                    )
                  })}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(0)} className="btn-press flex-1 border border-[#E8E0D8] text-[#78716C] font-medium py-3 rounded-xl hover:border-[#C9A882] transition-colors text-sm">{T.book_back}</button>
                  <button disabled={!selectedTime} onClick={() => setStep(2)}
                    className="btn-press flex-1 bg-[#1C1917] hover:bg-[#3D3530] disabled:bg-[#E8E0D8] disabled:cursor-not-allowed text-white disabled:text-[#A8A29E] font-semibold py-3 rounded-xl transition-colors duration-200">
                    {T.book_continue}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-[#F0EAE3] shadow-sm p-6">
                <h2 className="text-xl font-semibold text-[#1C1917] mb-5">{T.book_your_details}</h2>
                <div className="space-y-4">
                  {formFields.map(({ id, label, type, icon: Icon, placeholder }) => (
                    <div key={id}>
                      <label htmlFor={id} className="block text-sm font-medium text-[#1C1917] mb-1.5">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                        <input id={id} type={type} placeholder={placeholder} value={form[id]}
                          onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-[#E8E0D8] focus:border-[#C9A882] focus:ring-2 focus:ring-[#F5F0EB] rounded-xl outline-none text-sm text-[#1C1917] transition-all duration-200" />
                      </div>
                    </div>
                  ))}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                      {T.book_notes} <span className="text-[#A8A29E] font-normal">{T.book_optional}</span>
                    </label>
                    <textarea id="notes" rows={3} placeholder={T.book_notes_ph} value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      className="w-full px-4 py-3 border border-[#E8E0D8] focus:border-[#C9A882] focus:ring-2 focus:ring-[#F5F0EB] rounded-xl outline-none text-sm text-[#1C1917] transition-all duration-200 resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="btn-press flex-1 border border-[#E8E0D8] text-[#78716C] font-medium py-3 rounded-xl hover:border-[#C9A882] transition-colors text-sm">{T.book_back}</button>
                  <button disabled={!form.name || !form.email || !form.phone} onClick={() => setStep(3)}
                    className="btn-press flex-1 bg-[#1C1917] hover:bg-[#3D3530] disabled:bg-[#E8E0D8] disabled:cursor-not-allowed text-white disabled:text-[#A8A29E] font-semibold py-3 rounded-xl transition-colors duration-200">
                    {T.book_review_btn}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border border-[#F0EAE3] shadow-sm p-6">
                <h2 className="text-xl font-semibold text-[#1C1917] mb-5">{T.book_review_confirm}</h2>
                <div className="space-y-3 mb-6">
                  {T.book_labels.map((label, i) => (
                    <div key={i} className="flex justify-between text-sm py-2 border-b border-[#F5F0EB]">
                      <span className="text-[#78716C]">{label}</span>
                      <span className="font-medium text-[#1C1917] text-right max-w-xs">{reviewRows[i]}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-base font-bold pt-2">
                    <span>{T.book_total}</span>
                    <span className="text-[#C9A882]">€{provider.price}</span>
                  </div>
                </div>
                <div className="bg-[#F5F0EB] rounded-xl p-4 mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-[#78716C]" />
                    <span className="text-sm font-medium text-[#1C1917]">{T.book_payment_demo}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <input className="col-span-2 px-3 py-2.5 border border-[#E8E0D8] rounded-lg text-sm outline-none bg-white text-[#1C1917]" readOnly value="4242 4242 4242 4242" />
                    <input className="px-3 py-2.5 border border-[#E8E0D8] rounded-lg text-sm outline-none bg-white text-[#1C1917]" readOnly value="12/27" />
                    <input className="px-3 py-2.5 border border-[#E8E0D8] rounded-lg text-sm outline-none bg-white text-[#1C1917]" readOnly value="•••" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#A8A29E] mb-5">
                  <Shield className="w-4 h-4 text-emerald-500 shrink-0" />{T.book_stripe_note}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-press flex-1 border border-[#E8E0D8] text-[#78716C] font-medium py-3 rounded-xl hover:border-[#C9A882] transition-colors text-sm">{T.book_back}</button>
                  <button onClick={handleConfirm} disabled={loading}
                    className="btn-press flex-1 bg-[#1C1917] hover:bg-[#3D3530] disabled:bg-[#E8E0D8] text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2">
                    {loading ? (
                      <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{T.book_processing}</>
                    ) : `${T.book_confirm_pay} €${provider.price}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-2xl border border-[#F0EAE3] shadow-sm p-5 sticky top-24">
              <h3 className="font-semibold text-[#1C1917] mb-4 text-sm">{T.book_summary_title}</h3>
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#F0EAE3]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8D5B7] to-[#C9A882] flex items-center justify-center text-[#1C1917] text-sm font-bold shrink-0">
                  {provider.avatar}
                </div>
                <div>
                  <p className="font-semibold text-[#1C1917] text-sm">{provider.name}</p>
                  <p className="text-[#C9A882] text-xs">{provider.service}</p>
                </div>
              </div>
              <div className="space-y-2.5 text-sm text-[#78716C] mb-4">
                <div className="flex items-center gap-2"><Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" /><span>{provider.rating} ({provider.reviews} {T.pp_reviews?.toLowerCase()})</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#A8A29E] shrink-0" /><span>{provider.duration}</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#A8A29E] shrink-0" /><span>{provider.location}</span></div>
                {selectedDate && (
                  <div className="bg-[#F5F0EB] border border-[#E8D5B7] rounded-lg px-3 py-2 mt-2 text-[#78716C] text-xs font-medium">
                    {formatDate(selectedDate)}{selectedTime ? ` ${T.book_confirmed_at} ${selectedTime}` : ''}
                  </div>
                )}
              </div>
              <div className="border-t border-[#F0EAE3] pt-3 flex justify-between font-bold text-[#1C1917]">
                <span>{T.book_total}</span>
                <span className="text-[#C9A882]">€{provider.price}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
