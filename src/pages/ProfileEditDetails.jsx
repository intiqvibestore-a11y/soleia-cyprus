import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase/client'
import { COUNTRIES, CountryPicker } from '../components/CountryPicker'

const MONTHS = [
  'Ιανουάριος','Φεβρουάριος','Μάρτιος','Απρίλιος',
  'Μάιος','Ιούνιος','Ιούλιος','Αύγουστος',
  'Σεπτέμβριος','Οκτώβριος','Νοέμβριος','Δεκέμβριος',
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function parsePhoneIdx(full) {
  if (!full) return 0
  for (let i = 0; i < COUNTRIES.length; i++) {
    if (full.startsWith(COUNTRIES[i].code)) return i
  }
  return 0
}

export default function ProfileEditDetails() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const [firstName,   setFirstName]   = useState('')
  const [lastName,    setLastName]    = useState('')
  const [countryIdx,  setCountryIdx]  = useState(0)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email,       setEmail]       = useState('')
  const [birthDay,    setBirthDay]    = useState('')
  const [birthMonth,  setBirthMonth]  = useState('')
  const [birthYear,   setBirthYear]   = useState('')
  const [gender,      setGender]      = useState('')

  const [emailError,  setEmailError]  = useState('')
  const [dobError,    setDobError]    = useState('')

  // Load profile data
  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/', { replace: true }); return }

    const meta = user.user_metadata || {}
    const full = meta.full_name || meta.name || ''
    setFirstName(full.split(' ')[0] || '')
    setLastName(full.split(' ').slice(1).join(' ') || '')
    setEmail(user.email || '')

    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) {
          if (data.first_name)   setFirstName(data.first_name)
          if (data.last_name)    setLastName(data.last_name)
          if (data.phone) {
            const idx = parsePhoneIdx(data.phone)
            setCountryIdx(idx)
            setPhoneNumber(data.phone.slice(COUNTRIES[idx].code.length))
          }
          if (data.email)        setEmail(data.email)
          if (data.birth_day)    setBirthDay(String(data.birth_day))
          if (data.birth_month)  setBirthMonth(String(data.birth_month))
          if (data.birth_year)   setBirthYear(String(data.birth_year))
          if (data.gender)       setGender(data.gender)
        }
        setLoading(false)
      })
  }, [user, authLoading, navigate])

  // Validate age whenever all three DOB fields are filled
  useEffect(() => {
    if (!birthDay || !birthMonth || !birthYear) {
      setDobError('')
      return
    }
    const dob = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay))
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--
    setDobError(age < 18 ? 'Πρέπει να είστε άνω των 18 ετών για να χρησιμοποιήσετε την εφαρμογή' : '')
  }, [birthDay, birthMonth, birthYear])

  const validateEmail = (val) => {
    if (val && !EMAIL_RE.test(val)) {
      setEmailError('Εισαγάγετε μια έγκυρη διεύθυνση email')
      return false
    }
    setEmailError('')
    return true
  }

  const handleSave = async () => {
    // Run validations before saving
    const emailOk = validateEmail(email)
    if (!emailOk || dobError) return

    setSaving(true); setError('')
    const fullPhone = phoneNumber
      ? COUNTRIES[countryIdx].code + phoneNumber.replace(/\D/g, '')
      : ''
    const { error: err } = await supabase.from('profiles').upsert({
      id:          user.id,
      first_name:  firstName  || null,
      last_name:   lastName   || null,
      phone:       fullPhone  || null,
      email:       email      || null,
      birth_day:   birthDay   ? parseInt(birthDay)   : null,
      birth_month: birthMonth ? parseInt(birthMonth) : null,
      birth_year:  birthYear  ? parseInt(birthYear)  : null,
      gender:      gender     || null,
      updated_at:  new Date().toISOString(),
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    navigate('/profile/edit')
  }

  if (authLoading || loading) return <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }} />

  const inputCls = 'w-full h-[52px] px-4 border border-[#D1CAC1] rounded-xl text-[15px] text-[#1C1917] placeholder-[#B8AEA6] focus:outline-none focus:border-[#1C1917] transition-colors bg-white'
  const labelCls = 'block text-[13px] font-semibold text-[#1C1917] mb-1.5'
  const dobSelectCls = (hasError) =>
    `w-full h-[52px] pl-3 pr-8 rounded-xl text-[14px] focus:outline-none bg-white appearance-none cursor-pointer transition-colors ${
      hasError
        ? 'border border-red-400 focus:border-red-400'
        : 'border border-[#D1CAC1] focus:border-[#1C1917]'
    }`

  return (
    <div className="min-h-screen pb-10" style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-5">
        <button onClick={() => navigate('/profile/edit')} style={{ background: 'none', border: 'none', padding: 0 }}>
          <ArrowLeft className="w-5 h-5 text-[#1C1917] cursor-pointer" />
        </button>
        <h1 className="text-[17px] font-bold text-[#1C1917] leading-tight">
          Επεξεργασία στοιχείων προφίλ
        </h1>
      </div>

      <div className="px-5 flex flex-col gap-4">

        {/* First name */}
        <div>
          <label className={labelCls}>Όνομα</label>
          <input className={inputCls} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Όνομα" />
        </div>

        {/* Last name */}
        <div>
          <label className={labelCls}>Επώνυμο</label>
          <input className={inputCls} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Επώνυμο" />
        </div>

        {/* Phone */}
        <div>
          <label className={labelCls}>Αριθμός κινητού</label>
          <div className="flex gap-2">
            <CountryPicker value={countryIdx} onChange={setCountryIdx} />
            <input
              type="tel"
              className={`${inputCls} flex-1`}
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="96 000 000"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={labelCls}>Διεύθυνση email</label>
          <input
            type="email"
            className={`${inputCls}${emailError ? ' !border-red-400 focus:!border-red-400' : ''}`}
            value={email}
            onChange={e => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value) }}
            onBlur={() => validateEmail(email)}
            placeholder="email@example.com"
          />
          {emailError && (
            <p className="mt-1.5 text-[12px] font-medium" style={{ color: '#EF4444' }}>
              {emailError}
            </p>
          )}
        </div>

        {/* Birth date */}
        <div>
          <label className={labelCls}>Ημερομηνία γέννησης</label>
          <div className="flex gap-2">
            {/* Day */}
            <div className="relative flex-1">
              <select
                value={birthDay}
                onChange={e => setBirthDay(e.target.value)}
                className={dobSelectCls(!!dobError)}
                style={{ color: birthDay ? '#1C1917' : '#B8AEA6' }}
              >
                <option value="" disabled>Ημέρα</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: dobError ? '#EF4444' : '#A8A29E' }} />
            </div>
            {/* Month */}
            <div className="relative flex-[1.4]">
              <select
                value={birthMonth}
                onChange={e => setBirthMonth(e.target.value)}
                className={dobSelectCls(!!dobError)}
                style={{ color: birthMonth ? '#1C1917' : '#B8AEA6' }}
              >
                <option value="" disabled>Μήνας</option>
                {MONTHS.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: dobError ? '#EF4444' : '#A8A29E' }} />
            </div>
            {/* Year */}
            <div className="relative flex-1">
              <select
                value={birthYear}
                onChange={e => setBirthYear(e.target.value)}
                className={dobSelectCls(!!dobError)}
                style={{ color: birthYear ? '#1C1917' : '#B8AEA6' }}
              >
                <option value="" disabled>Έτος</option>
                {Array.from(
                  { length: new Date().getFullYear() - 1940 + 1 },
                  (_, i) => new Date().getFullYear() - i
                ).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: dobError ? '#EF4444' : '#A8A29E' }} />
            </div>
          </div>
          {dobError && (
            <p className="mt-1.5 text-[12px] font-medium" style={{ color: '#EF4444' }}>
              {dobError}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className={labelCls}>Φύλο</label>
          <div className="relative">
            <select
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="w-full h-[52px] pl-4 pr-10 border border-[#D1CAC1] rounded-xl text-[15px] focus:outline-none focus:border-[#1C1917] bg-white appearance-none cursor-pointer"
              style={{ color: gender ? '#1C1917' : '#B8AEA6' }}
            >
              <option value="" disabled>Επιλέξτε</option>
              <option value="male">Άνδρας</option>
              <option value="female">Γυναίκα</option>
              <option value="other">Προτιμώ να μην πω</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E] pointer-events-none" />
          </div>
        </div>

        {error && (
          <p className="text-[13px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-[54px] rounded-full text-white font-semibold text-[16px] transition-opacity disabled:opacity-60 mt-2"
          style={{ background: '#C9A882' }}
        >
          {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
        </button>
      </div>
    </div>
  )
}
