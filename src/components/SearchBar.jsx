import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useT } from '../context/LanguageContext'
import LocationModal, { loadLocation } from './LocationModal'

// English keys stay constant — used for state/filtering, not display
const FILTER_TAB_KEYS = ['All', 'Treatments', 'Venues', 'Professionals']

const CATEGORIES = [
  { name: 'Hair & styling',       icon: <><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M19 5L8.5 15.5M14 14l5 5M8.5 8.5l3.5 3.5"/></> },
  { name: 'Nails',                icon: <><rect x="8" y="2" width="8" height="11" rx="4"/><path d="M6 17h12a1 1 0 011 1v2a1 1 0 01-1 1H6a1 1 0 01-1-1v-2a1 1 0 011-1z"/></> },
  { name: 'Hair removal',         icon: <><rect x="4" y="9" width="16" height="7" rx="2"/><path d="M8 9V7a4 4 0 018 0v2M12 12v2"/></> },
  { name: 'Eyebrows & eyelashes', icon: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></> },
  { name: 'Facials & skincare',   icon: <><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M9 15.5a4.5 4.5 0 006 0"/></> },
  { name: 'Massage',              icon: <><path d="M19 11V9a2 2 0 00-4 0v1m0 0V8a2 2 0 00-4 0v2m0 0V9a2 2 0 00-4 0v6c0 3.5 3 6 7 6h1c3 0 5-2 5-5v-5a2 2 0 00-4 0v1"/></> },
  { name: 'Makeup',               icon: <><path d="M12 2v6m0 0c-1.5 0-3 1-3 2.5V15a3 3 0 006 0v-4.5C15 9 13.5 8 12 8z"/><path d="M9 20h6"/><path d="M12 15v5"/></> },
  { name: 'Aesthetics',           icon: <><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></> },
  { name: 'Barbering',            icon: <><path d="M5 3h14M5 3l2.5 4M19 3l-2.5 4m-9 0h9m-9 0L5 21m12-14L19 21M5 21h14"/></> },
  { name: 'Spa & wellness',       icon: <><path d="M12 22V12m0 0C12 7 7 4 2 6c0 5 3 9 10 9m0-9c0-5 5-8 10-6 0 5-3 9-10 9"/></> },
  { name: 'Body & skin',          icon: <><circle cx="12" cy="5" r="2.5"/><path d="M8 10.5h8l1 9H7l1-9z"/><path d="M10 10.5v5m4-5v5"/></> },
  { name: 'Tattoo & piercing',    icon: <><path d="M6 7l3-4 7 14-3 4L6 7z"/><path d="M9 3l7 14M6 7l10 4"/></> },
  { name: 'Holistic health',      icon: <><path d="M12 21C12 21 4 16 4 10a8 8 0 0116 0c0 6-8 11-8 11z"/><path d="M12 21V10m-4 3l4-3 4 3"/></> },
  { name: 'Dental',               icon: <><path d="M9 4c-2 0-4 1.5-4 4 0 3.5 2 6.5 3 9h8c1-2.5 3-5.5 3-9 0-2.5-2-4-4-4-1 0-2 .5-3 .5S10 4 9 4z"/><path d="M12 4.5V10"/></> },
]

// English time keys used for state — display comes from T
const TIME_SLOT_KEYS = ['Any time', 'Morning', 'Afternoon', 'Evening']
const CITIES = ['Limassol', 'Nicosia', 'Paphos', 'Larnaca', 'Famagusta']

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate() }
function getFirstDayMon(y, m) { return (new Date(y, m, 1).getDay() + 6) % 7 }

function fmtDisplay(d, locale) {
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}
function fmtShort(d, locale) {
  return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
}

function CatIcon({ paths }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="w-[26px] h-[26px]">
      {paths}
    </svg>
  )
}

function TreatmentDropdown({ activeTabKey, setActiveTabKey, selectedTreatment, onSelect, onClose }) {
  const T = useT()

  return (
    <div className="slide-down absolute top-full mt-2 left-0 w-full sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-[#E8E0D8] z-[200] overflow-hidden flex flex-col" style={{ maxHeight: 'min(520px, calc(100dvh - 180px))' }}>

      {/* Filter tabs */}
      <div className="flex gap-1.5 px-3 pt-3 pb-2.5 border-b border-[#EDE6DF] shrink-0 overflow-x-auto scrollbar-hide">
        {FILTER_TAB_KEYS.map((key, i) => (
          <button
            key={key}
            onClick={() => setActiveTabKey(key)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide whitespace-nowrap transition-colors ${
              activeTabKey === key
                ? 'bg-[#1C1917] text-white'
                : 'bg-[#F5F0EB] text-[#78716C] hover:bg-[#EDE6DF] hover:text-[#1C1917]'
            }`}
          >
            {T.filter_tabs[i]}
          </button>
        ))}
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-2.5">

        {/* "All treatments" — full-width special row */}
        <button
          onClick={() => onSelect('')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 border-2 ${
            selectedTreatment === ''
              ? 'bg-[#FDF8F2] border-[#C9A882]'
              : 'bg-[#EDE6DF] border-transparent hover:bg-[#E5DDD4] hover:border-[#DDD0BF]'
          }`}
        >
          <div className={`shrink-0 transition-colors ${selectedTreatment === '' ? 'text-[#C9A882]' : 'text-[#5C5249]'}`}>
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <span className={`text-[13px] font-semibold transition-colors ${
            selectedTreatment === '' ? 'text-[#B8904A]' : 'text-[#1C1917]'
          }`}>
            {T.search_all_treatments}
          </span>
          {selectedTreatment === '' && (
            <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-[#C9A882]">✓</span>
          )}
        </button>

        {/* 3-column category grid */}
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map(({ name, icon }) => {
            const isSelected = selectedTreatment === name
            return (
              <button
                key={name}
                onClick={() => onSelect(name)}
                className={`flex flex-col items-center justify-center gap-2 py-4 px-1 rounded-xl transition-all duration-150 border-2 ${
                  isSelected
                    ? 'bg-[#FDF8F2] border-[#C9A882]'
                    : 'bg-[#F5F0EB] border-transparent hover:bg-[#EDE6DF] hover:border-[#DDD0BF]'
                }`}
              >
                <div className={`transition-colors ${isSelected ? 'text-[#C9A882]' : 'text-[#4A403A]'}`}>
                  <CatIcon paths={icon} />
                </div>
                <span className={`text-[10.5px] font-medium text-center leading-tight transition-colors ${
                  isSelected ? 'text-[#B8904A]' : 'text-[#1C1917]'
                }`} style={{ maxWidth: '80px' }}>
                  {T.cat_display[name] || name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-3 border-t border-[#EDE6DF] shrink-0">
        <button
          onClick={onClose}
          className="w-full bg-[#1C1917] hover:bg-[#2C2A28] active:bg-[#2C2A28] text-white font-semibold py-3.5 rounded-xl text-[14px] transition-colors"
        >
          {T.search_btn}
        </button>
      </div>
    </div>
  )
}

function LocationDropdown({ onSelectCurrent, onSelectCity }) {
  const T = useT()
  const [loading, setLoading] = useState(false)
  const handleCurrent = () => {
    setLoading(true)
    if (!navigator.geolocation) { onSelectCurrent('Cyprus'); return }
    navigator.geolocation.getCurrentPosition(
      () => { setLoading(false); onSelectCurrent('My location') },
      () => { setLoading(false); onSelectCurrent('Cyprus') },
      { timeout: 5000 }
    )
  }
  return (
    <div className="slide-down absolute top-full mt-2 left-0 w-full sm:w-64 bg-white rounded-2xl shadow-2xl border border-[#E8E0D8] z-[200] overflow-hidden py-2">
      <button onClick={handleCurrent} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F0EB] transition-colors">
        <div className="w-8 h-8 rounded-full bg-[#E8F0FE] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#4285F4]">
            <path d="M12 2L4.5 20.3l.7.7L12 17.6l6.8 3.4.7-.7z"/>
          </svg>
        </div>
        <span className="text-sm text-[#1C1917] font-medium">
          {loading ? T.search_getting_location : T.search_current_location}
        </span>
      </button>
      <div className="px-4 py-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A8A29E]">{T.search_popular_cities}</p>
      </div>
      {CITIES.map(city => (
        <button key={city} onClick={() => onSelectCity(city)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F0EB] transition-colors">
          <MapPin className="w-4 h-4 text-[#C9A882] shrink-0" />
          <span className="text-sm text-[#1C1917]">{city}</span>
        </button>
      ))}
    </div>
  )
}

function DateDropdown({ today, selectedDate, setSelectedDate, selectedTimeKey, setSelectedTimeKey, onDone }) {
  const T = useT()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayMon(calYear, calMonth)

  const isPast = (day) => {
    const d = new Date(calYear, calMonth, day); d.setHours(0,0,0,0)
    const t = new Date(); t.setHours(0,0,0,0)
    return d < t
  }
  const isSel = (day) => selectedDate &&
    selectedDate.getFullYear() === calYear &&
    selectedDate.getMonth() === calMonth &&
    selectedDate.getDate() === day
  const isToday = (day) => today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day

  const prevMonth = () => calMonth === 0 ? (setCalYear(y=>y-1), setCalMonth(11)) : setCalMonth(m=>m-1)
  const nextMonth = () => calMonth === 11 ? (setCalYear(y=>y+1), setCalMonth(0)) : setCalMonth(m=>m+1)
  const isQuickSel = (d) => selectedDate && selectedDate.toDateString() === d.toDateString()

  return (
    <div className="slide-down absolute top-full mt-2 left-0 right-0 sm:left-auto sm:right-0 sm:w-[520px] bg-white rounded-2xl shadow-2xl border border-[#E8E0D8] z-[200] p-4 sm:p-5 max-h-[calc(100dvh-160px)] overflow-y-auto">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Quick date cards */}
        <div className="flex gap-2 sm:flex-col sm:gap-2 sm:w-28 shrink-0">
          {[today, tomorrow].map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedDate(new Date(d))}
              className={`flex-1 sm:flex-initial border rounded-xl p-2.5 sm:p-3 text-left transition-all ${
                isQuickSel(d) ? 'border-[#1C1917] bg-[#1C1917] text-white' : 'border-[#E8E0D8] hover:border-[#C9A882]'
              }`}
            >
              <p className="font-semibold text-xs sm:text-sm">{i === 0 ? T.search_today : T.search_tomorrow}</p>
              <p className={`text-[11px] mt-0.5 ${isQuickSel(d) ? 'text-white/70' : 'text-[#78716C]'}`}>
                {fmtShort(d, T.locale)}
              </p>
            </button>
          ))}
        </div>

        {/* Calendar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1.5 hover:bg-[#F5F0EB] rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-[#78716C]" />
            </button>
            <span className="text-sm font-semibold text-[#1C1917]">
              {T.months[calMonth].slice(0,3)} {calYear}
            </span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-[#F5F0EB] rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-[#78716C]" />
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {T.days_short.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-[#A8A29E] py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1
              const past = isPast(day), sel = isSel(day), tod = isToday(day)
              return (
                <button
                  key={day}
                  disabled={past}
                  onClick={() => setSelectedDate(new Date(calYear, calMonth, day))}
                  className={`aspect-square rounded-full text-xs font-medium transition-all flex items-center justify-center ${
                    past ? 'text-[#D5CEC8] cursor-not-allowed' :
                    sel  ? 'bg-[#1C1917] text-white' :
                    tod  ? 'border border-[#1C1917] text-[#1C1917] hover:bg-[#F5F0EB]' :
                           'text-[#1C1917] hover:bg-[#F5F0EB] cursor-pointer'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Time slots */}
      <div className="mt-4 pt-4 border-t border-[#F0EAE3]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#78716C] shrink-0">{T.search_time_label}</span>
          {T.time_slots.map(({ key, label, sub }) => (
            <button
              key={key}
              onClick={() => setSelectedTimeKey(key)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all whitespace-nowrap ${
                selectedTimeKey === key
                  ? 'border-[#C9A882] bg-[#C9A882]/10 text-[#1C1917]'
                  : 'border-[#E8E0D8] text-[#78716C] hover:border-[#C9A882]'
              }`}
            >
              {label}{sub ? ` · ${sub}` : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SearchBar() {
  const T = useT()
  const navigate = useNavigate()
  const ref = useRef(null)

  const [activeSection, setActiveSection] = useState(null)
  const [activeTabKey, setActiveTabKey] = useState('All')
  const [treatment, setTreatment] = useState('')
  const [location, setLocation] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeKey, setSelectedTimeKey] = useState('Any time')
  const [locModalOpen, setLocModalOpen] = useState(false)

  const today = new Date()

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setActiveSection(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const loc = loadLocation()
    if (loc) setLocation(loc.label)
    const handler = () => {
      const l = loadLocation()
      if (l) setLocation(l.label)
    }
    window.addEventListener('soleia_location_changed', handler)
    return () => window.removeEventListener('soleia_location_changed', handler)
  }, [])

  const toggle = (section) => setActiveSection(s => s === section ? null : section)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (treatment) params.set('q', treatment)
    if (location) params.set('city', location)
    navigate(`/services?${params.toString()}`)
    setActiveSection(null)
  }

  // Display label for the selected time (localized)
  const timeLabel = T.time_slots.find(s => s.key === selectedTimeKey)?.label || T.search_anytime

  const dateLabel = selectedDate
    ? `${fmtDisplay(selectedDate, T.locale)}${selectedTimeKey !== 'Any time' ? ` · ${timeLabel}` : ''}`
    : T.search_anytime

  const treatmentPlaceholder = treatment || T.search_all_treatments
  const locationPlaceholder  = location  || T.search_anywhere

  const dropdownShared = {
    treatment, location, selectedDate, selectedTimeKey,
    activeTabKey, setActiveTabKey,
    setSelectedDate, setSelectedTimeKey,
    today,
    onSelectTreatment: (v) => { setTreatment(v); setActiveSection(null) },
    onSelectCurrent:   (v) => { setLocation(v);  setActiveSection(null) },
    onSelectCity:      (v) => { setLocation(v);  setActiveSection(null) },
    onDone: () => setActiveSection(null),
  }

  return (
    <div ref={ref} className="relative w-full max-w-2xl mx-auto">

      {/* Mobile stacked card */}
      <div className="sm:hidden rounded-2xl border border-[#E8E0D8] shadow-[0_4px_28px_rgba(28,25,23,0.12)] bg-white">
        <div className="relative">
          <button
            onClick={() => toggle('treatment')}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-t-2xl transition-colors text-left ${activeSection === 'treatment' ? 'bg-[#F5F0EB]' : 'active:bg-[#F5F0EB]'}`}
          >
            <Search className="w-4 h-4 text-[#C9A882] shrink-0" />
            <span className={`text-sm truncate ${treatment ? 'text-[#1C1917] font-medium' : 'text-[#A8A29E]'}`}>
              {treatmentPlaceholder}
            </span>
          </button>
          {activeSection === 'treatment' && (
            <TreatmentDropdown activeTabKey={activeTabKey} setActiveTabKey={setActiveTabKey} selectedTreatment={treatment} onSelect={dropdownShared.onSelectTreatment} onClose={dropdownShared.onDone} />
          )}
        </div>

        <div className="h-px bg-[#F0EAE3] mx-4" />

        <div className="relative">
          <button
            onClick={() => setLocModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-4 transition-colors text-left active:bg-[#F5F0EB]"
          >
            <MapPin className="w-4 h-4 text-[#C9A882] shrink-0" />
            <span className={`text-sm truncate ${location ? 'text-[#1C1917] font-medium' : 'text-[#A8A29E]'}`}>
              {locationPlaceholder}
            </span>
          </button>
        </div>

        <div className="h-px bg-[#F0EAE3] mx-4" />

        <div className="relative">
          <button
            onClick={() => toggle('date')}
            className={`w-full flex items-center gap-3 px-4 py-4 transition-colors text-left ${activeSection === 'date' ? 'bg-[#F5F0EB]' : 'active:bg-[#F5F0EB]'}`}
          >
            <Calendar className="w-4 h-4 text-[#C9A882] shrink-0" />
            <span className={`text-sm ${selectedDate ? 'text-[#1C1917] font-medium' : 'text-[#A8A29E]'}`}>{dateLabel}</span>
          </button>
          {activeSection === 'date' && (
            <DateDropdown today={today} selectedDate={selectedDate} setSelectedDate={dropdownShared.setSelectedDate} selectedTimeKey={selectedTimeKey} setSelectedTimeKey={dropdownShared.setSelectedTimeKey} onDone={dropdownShared.onDone} />
          )}
        </div>

        <button onClick={handleSearch} className="w-full bg-[#1C1917] hover:bg-[#2C2A28] active:bg-[#2C2A28] text-white font-semibold py-4 text-sm transition-colors rounded-b-2xl">
          {T.search_btn}
        </button>
      </div>

      {/* Desktop pill */}
      <div className="hidden sm:flex items-stretch bg-white rounded-full shadow-[0_4px_28px_rgba(28,25,23,0.12)] border border-[#E8E0D8]">
        <div className="relative flex-1 min-w-0">
          <button
            onClick={() => toggle('treatment')}
            className={`w-full h-full flex items-center gap-2.5 px-5 py-3.5 rounded-l-full transition-colors ${activeSection === 'treatment' ? 'bg-[#F5F0EB]' : 'hover:bg-[#F5F0EB]'}`}
          >
            <Search className="w-4 h-4 text-[#C9A882] shrink-0" />
            <span className={`text-sm truncate ${treatment ? 'text-[#1C1917] font-medium' : 'text-[#A8A29E]'}`}>{treatmentPlaceholder}</span>
          </button>
          {activeSection === 'treatment' && (
            <TreatmentDropdown activeTabKey={activeTabKey} setActiveTabKey={setActiveTabKey} selectedTreatment={treatment} onSelect={dropdownShared.onSelectTreatment} onClose={dropdownShared.onDone} />
          )}
        </div>

        <div className="w-px bg-[#E8E0D8] my-3 shrink-0" />

        <div className="relative flex-1 min-w-0">
          <button
            onClick={() => setLocModalOpen(true)}
            className="w-full h-full flex items-center gap-2.5 px-5 py-3.5 transition-colors hover:bg-[#F5F0EB]"
          >
            <MapPin className="w-4 h-4 text-[#C9A882] shrink-0" />
            <span className={`text-sm truncate ${location ? 'text-[#1C1917] font-medium' : 'text-[#A8A29E]'}`}>{locationPlaceholder}</span>
          </button>
        </div>

        <div className="w-px bg-[#E8E0D8] my-3 shrink-0" />

        <div className="relative flex items-center shrink-0">
          <button
            onClick={() => toggle('date')}
            className={`flex items-center gap-2.5 px-4 py-3.5 transition-colors ${activeSection === 'date' ? 'bg-[#F5F0EB]' : 'hover:bg-[#F5F0EB]'}`}
          >
            <Calendar className="w-4 h-4 text-[#C9A882] shrink-0" />
            <span className={`text-sm whitespace-nowrap ${selectedDate ? 'text-[#1C1917] font-medium' : 'text-[#A8A29E]'}`}>{dateLabel}</span>
          </button>
          <button onClick={handleSearch} className="bg-[#1C1917] hover:bg-[#2C2A28] text-white font-semibold text-sm px-5 py-2.5 mr-1.5 rounded-full transition-colors whitespace-nowrap">
            {T.search_btn}
          </button>
          {activeSection === 'date' && (
            <DateDropdown today={today} selectedDate={selectedDate} setSelectedDate={dropdownShared.setSelectedDate} selectedTimeKey={selectedTimeKey} setSelectedTimeKey={dropdownShared.setSelectedTimeKey} onDone={dropdownShared.onDone} />
          )}
        </div>
      </div>

      {locModalOpen && (
        <LocationModal
          onClose={() => setLocModalOpen(false)}
          onSelect={(loc) => setLocation(loc.label)}
        />
      )}
    </div>
  )
}
