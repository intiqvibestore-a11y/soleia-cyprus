import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Paperclip, X, CheckCircle2, AlertCircle } from 'lucide-react'
import emailjs from '@emailjs/browser'
import { supabase } from '../utils/supabase/client'

const EJS_SERVICE  = 'service_upa5skh'
const EJS_TEMPLATE = 'template_swsfu0f'
const EJS_KEY      = '9yltr7c1VxXHwhZAs'
const TO_EMAIL     = 'intiqvibestore@gmail.com'

function sendEmail({ from_email, subject, reason, message }) {
  return emailjs.send(
    EJS_SERVICE,
    EJS_TEMPLATE,
    { from_email, subject, reason, message, to_email: TO_EMAIL },
    EJS_KEY
  )
}

// ─── Shared primitives ─────────────────────────────────────────────────────────

const labelCls = 'block text-[13px] font-semibold mb-1.5'

function Req() {
  return <span style={{ color: '#EF4444' }}> *</span>
}

function FieldErr({ msg }) {
  if (!msg) return null
  return <p className="mt-1 text-[12px] font-medium" style={{ color: '#EF4444' }}>{msg}</p>
}

function InputF({ label, value, onChange, type = 'text', placeholder, error }) {
  return (
    <div>
      <label className={labelCls} style={{ color: '#3D2B1F' }}>{label}<Req /></label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[52px] px-4 rounded-xl placeholder-[#B8AEA6] focus:outline-none transition-colors"
        style={{
          border: `1.5px solid ${error ? '#EF4444' : '#D1CAC1'}`,
          background: 'white',
          color: '#1C1917',
          fontSize: '16px',
        }}
      />
      <FieldErr msg={error} />
    </div>
  )
}

function SelectF({ label, value, onChange, options, placeholder, error }) {
  return (
    <div>
      <label className={labelCls} style={{ color: '#3D2B1F' }}>{label}<Req /></label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full h-[52px] pl-4 pr-10 rounded-xl focus:outline-none bg-white appearance-none cursor-pointer transition-colors"
          style={{
            border: `1.5px solid ${error ? '#EF4444' : '#D1CAC1'}`,
            color: value ? '#1C1917' : '#B8AEA6',
            fontSize: '16px',
          }}
        >
          <option value="" disabled>{placeholder || 'Επιλέξτε'}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#A8A29E' }} />
      </div>
      <FieldErr msg={error} />
    </div>
  )
}

function TextF({ label, value, onChange, maxLength, placeholder, error }) {
  return (
    <div>
      <label className={labelCls} style={{ color: '#3D2B1F' }}>{label}<Req /></label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={5}
        className="w-full px-4 py-3 rounded-xl placeholder-[#B8AEA6] focus:outline-none transition-colors resize-none"
        style={{
          border: `1.5px solid ${error ? '#EF4444' : '#D1CAC1'}`,
          background: 'white',
          color: '#1C1917',
          fontSize: '15px',
        }}
      />
      <div className="flex justify-between items-start mt-1">
        <FieldErr msg={error} />
        <p className="text-[11px] ml-auto shrink-0" style={{ color: '#A8A29E' }}>
          {value.length}/{maxLength} χαρακτήρες
        </p>
      </div>
    </div>
  )
}

function FileF({ file, onChange }) {
  const ref = useRef(null)
  const handleFile = e => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { alert('Μέγιστο μέγεθος αρχείου: 10MB'); return }
    onChange(f)
    e.target.value = ''
  }
  return (
    <div>
      <label className={labelCls} style={{ color: '#3D2B1F' }}>Επισύναψη αρχείου</label>
      <p className="text-[12px] mb-2" style={{ color: '#A8A29E' }}>jpg, png — μέγιστο 10mb</p>
      {file ? (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
             style={{ border: '1.5px solid #D1CAC1', background: 'white' }}>
          <Paperclip className="w-4 h-4 shrink-0" style={{ color: '#C9A882' }} strokeWidth={1.7} />
          <span className="flex-1 text-[13px] truncate" style={{ color: '#3D2B1F' }}>{file.name}</span>
          <button onClick={() => onChange(null)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <X className="w-4 h-4" style={{ color: '#78716C' }} strokeWidth={1.7} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => ref.current?.click()}
          className="flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer text-[14px] font-medium"
          style={{ border: '1.5px dashed #C9A882', background: 'transparent', color: '#C9A882' }}
        >
          <Paperclip className="w-4 h-4" strokeWidth={1.7} />
          Επιλέξτε ένα αρχείο
        </button>
      )}
      <input ref={ref} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
    </div>
  )
}

function SubmitBtn({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-[15px] rounded-full font-semibold text-[16px] cursor-pointer mt-1"
      style={{ background: '#1C1917', color: 'white', border: 'none', opacity: loading ? 0.7 : 1 }}
    >
      {loading ? 'Αποστολή...' : 'Αποστολή email'}
    </button>
  )
}

// ─── Form 1 — Account support ──────────────────────────────────────────────────

const REASONS_1 = [
  'Ρύθμιση λογαριασμού',
  'Πρόσθετες λειτουργίες και ενσωματώσεις',
  'Χρέωση και προμήθειες',
  'Πληρωμές και καταθέσεις πληρωμών',
  'Τεχνική υποστήριξη',
  'Άλλα ερωτήματα',
]

function Form1({ userEmail, topic, onSuccess, onError }) {
  const [email,   setEmail]   = useState(userEmail)
  const [reason,  setReason]  = useState('')
  const [desc,    setDesc]    = useState('')
  const [file,    setFile]    = useState(null)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => { setEmail(userEmail) }, [userEmail])

  const validate = () => {
    const e = {}
    if (!email.trim()) e.email  = 'Το email είναι υποχρεωτικό'
    if (!reason)       e.reason = 'Επιλέξτε λόγο επικοινωνίας'
    if (!desc.trim())  e.desc   = 'Η περιγραφή είναι υποχρεωτική'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = () => {
    if (!validate()) return
    setLoading(true)
    const message = desc + (file ? `\n\nΣυνημμένο: ${file.name}` : '')
    sendEmail({ from_email: email, subject: topic, reason, message })
      .then(() => {
        setLoading(false)
        setEmail(userEmail); setReason(''); setDesc(''); setFile(null); setErrors({})
        onSuccess()
      })
      .catch(() => {
        setLoading(false)
        onError()
      })
  }

  return (
    <div className="flex flex-col gap-5">
      <InputF label="Email" value={email} onChange={setEmail} type="email" placeholder="email@example.com" error={errors.email} />
      <SelectF label="Λόγος επικοινωνίας με το τμήμα υποστήριξης" value={reason} onChange={setReason} options={REASONS_1} placeholder="Επιλέξτε λόγο" error={errors.reason} />
      <TextF label="Περιγράψτε τι χρειάζεστε" value={desc} onChange={setDesc} maxLength={2000} placeholder="Γράψτε εδώ..." error={errors.desc} />
      <FileF file={file} onChange={setFile} />
      <SubmitBtn onClick={handleSubmit} loading={loading} />
    </div>
  )
}

// ─── Form 2 — Business membership ─────────────────────────────────────────────

const BUSINESS_TYPES = [
  'Κομμωτήριο', 'Στούντιο νυχιών', 'Κουρείο', 'Σαλόνι ομορφιάς',
  'Αισθητικές υπηρεσίες', 'Σπα', 'Μασάζ', 'Στούντιο αποτρίχωσης',
  'Στούντιο μαυρίσματος', 'Φρύδια & Βλεφαρίδες', 'Τατουάζ και piercing',
  'Κέντρο θεραπείας', 'Απώλεια βάρους', 'Προσωπικός γυμναστής',
  'Γυμναστήριο & Fitness', 'Άλλο',
]
const TEAM_SIZES = ['Μόνο εγώ', '2-5', '6-10', '11+']

function Form2({ userEmail, topic, onSuccess, onError }) {
  const [email,    setEmail]    = useState(userEmail)
  const [fullName, setFullName] = useState('')
  const [phone,    setPhone]    = useState('')
  const [bizName,  setBizName]  = useState('')
  const [bizType,  setBizType]  = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [notes,    setNotes]    = useState('')
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)

  useEffect(() => { setEmail(userEmail) }, [userEmail])

  const validate = () => {
    const e = {}
    if (!email.trim())    e.email    = 'Το email είναι υποχρεωτικό'
    if (!fullName.trim()) e.fullName = 'Το ονοματεπώνυμο είναι υποχρεωτικό'
    if (!phone.trim())    e.phone    = 'Ο αριθμός κινητού είναι υποχρεωτικός'
    if (!bizName.trim())  e.bizName  = 'Το όνομα επιχείρησης είναι υποχρεωτικό'
    if (!bizType)         e.bizType  = 'Επιλέξτε τύπο επιχείρησης'
    if (!teamSize)        e.teamSize = 'Επιλέξτε μέγεθος ομάδας'
    if (!notes.trim())    e.notes    = 'Αυτό το πεδίο είναι υποχρεωτικό'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = () => {
    if (!validate()) return
    setLoading(true)
    const message =
      `Ονοματεπώνυμο: ${fullName}\nΤηλέφωνο: +357${phone}\nΧώρα: Κύπρος\n` +
      `Επιχείρηση: ${bizName}\nΜέγεθος ομάδας: ${teamSize}\n\nΕρωτήματα:\n${notes}`
    sendEmail({ from_email: email, subject: topic, reason: bizType, message })
      .then(() => {
        setLoading(false)
        setEmail(userEmail); setFullName(''); setPhone(''); setBizName('')
        setBizType(''); setTeamSize(''); setNotes(''); setErrors({})
        onSuccess()
      })
      .catch(() => {
        setLoading(false)
        onError()
      })
  }

  return (
    <div className="flex flex-col gap-5">
      <InputF label="Email" value={email} onChange={setEmail} type="email" placeholder="email@example.com" error={errors.email} />
      <InputF label="Ονοματεπώνυμο" value={fullName} onChange={setFullName} placeholder="Ονοματεπώνυμο" error={errors.fullName} />

      {/* Country — Cyprus only */}
      <div>
        <label className={labelCls} style={{ color: '#3D2B1F' }}>Χώρα/Περιοχή<Req /></label>
        <div className="relative">
          <select disabled className="w-full h-[52px] pl-4 pr-10 rounded-xl focus:outline-none appearance-none"
                  style={{ border: '1.5px solid #D1CAC1', background: '#F8F5F2', color: '#1C1917', fontSize: '16px' }}>
            <option>Κύπρος</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#A8A29E' }} />
        </div>
      </div>

      {/* Phone with +357 prefix */}
      <div>
        <label className={labelCls} style={{ color: '#3D2B1F' }}>Αριθμός κινητού<Req /></label>
        <div className="flex gap-2">
          <div className="h-[52px] px-3 flex items-center rounded-xl text-[14px] font-semibold shrink-0"
               style={{ border: '1.5px solid #D1CAC1', background: 'white', color: '#3D2B1F' }}>
            +357
          </div>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="96 000 000"
            className="flex-1 h-[52px] px-4 rounded-xl placeholder-[#B8AEA6] focus:outline-none transition-colors"
            style={{ border: `1.5px solid ${errors.phone ? '#EF4444' : '#D1CAC1'}`, background: 'white', color: '#1C1917', fontSize: '16px' }}
          />
        </div>
        <FieldErr msg={errors.phone} />
      </div>

      <InputF label="Όνομα επιχείρησης" value={bizName} onChange={setBizName} placeholder="Όνομα επιχείρησης" error={errors.bizName} />
      <SelectF label="Τύπος επιχείρησης" value={bizType} onChange={setBizType} options={BUSINESS_TYPES} placeholder="Επιλέξτε τύπο" error={errors.bizType} />
      <SelectF label="Μέγεθος ομάδας" value={teamSize} onChange={setTeamSize} options={TEAM_SIZES} placeholder="Επιλέξτε μέγεθος" error={errors.teamSize} />
      <TextF
        label="Υπάρχει κάτι συγκεκριμένο που θέλετε να μάθετε για το Soleia;"
        value={notes} onChange={setNotes} maxLength={500} placeholder="Γράψτε εδώ..." error={errors.notes}
      />
      <SubmitBtn onClick={handleSubmit} loading={loading} />
    </div>
  )
}

// ─── Form 3 — Booking support ──────────────────────────────────────────────────

const REASONS_3 = [
  'Τα ραντεβού μου',
  'Πληρωμές και αγορές',
  'Κριτικές',
  'Ειδοποιήσεις μέσω email και SMS',
  'Διαγραφή του λογαριασμού μου',
  'Άλλο',
]

function Form3({ userEmail, topic, onSuccess, onError }) {
  const [email,   setEmail]   = useState(userEmail)
  const [reason,  setReason]  = useState('')
  const [desc,    setDesc]    = useState('')
  const [file,    setFile]    = useState(null)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => { setEmail(userEmail) }, [userEmail])

  const validate = () => {
    const e = {}
    if (!email.trim()) e.email  = 'Το email είναι υποχρεωτικό'
    if (!reason)       e.reason = 'Επιλέξτε λόγο επικοινωνίας'
    if (!desc.trim())  e.desc   = 'Η περιγραφή είναι υποχρεωτική'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = () => {
    if (!validate()) return
    setLoading(true)
    const message = desc + (file ? `\n\nΣυνημμένο: ${file.name}` : '')
    sendEmail({ from_email: email, subject: topic, reason, message })
      .then(() => {
        setLoading(false)
        setEmail(userEmail); setReason(''); setDesc(''); setFile(null); setErrors({})
        onSuccess()
      })
      .catch(() => {
        setLoading(false)
        onError()
      })
  }

  return (
    <div className="flex flex-col gap-5">
      <InputF label="Email" value={email} onChange={setEmail} type="email" placeholder="email@example.com" error={errors.email} />
      <SelectF label="Λόγος επικοινωνίας" value={reason} onChange={setReason} options={REASONS_3} placeholder="Επιλέξτε λόγο" error={errors.reason} />
      <TextF
        label="Περιγράψτε το ερώτημά σας, συμπεριλαμβάνοντας τον αριθμό της κράτησης, τον κωδικό της δωροκάρτας ή τον αριθμό απόδειξης"
        value={desc} onChange={setDesc} maxLength={2000} placeholder="Γράψτε εδώ..." error={errors.desc}
      />
      <FileF file={file} onChange={setFile} />
      <SubmitBtn onClick={handleSubmit} loading={loading} />
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const MAIN_OPTIONS = [
  'Έχω ήδη λογαριασμό και χρειάζομαι υποστήριξη',
  'Ενδιαφέρομαι να γίνω μέλος του Soleia ως επιχείρηση',
  'Έκλεισα ραντεβού με μια επιχείρηση στο Soleia',
]

export default function Support() {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState('')
  const [topic, setTopic]         = useState('')
  const [toast, setToast]         = useState(null) // { type: 'success'|'error', msg: string }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const e = user?.email || user?.user_metadata?.email || ''
      if (e) setUserEmail(e)
    })
  }, [])

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  const handleSuccess = () => showToast('success', 'Το email σας στάλθηκε επιτυχώς!')
  const handleError   = () => showToast('error',   'Σφάλμα αποστολής. Δοκιμάστε ξανά.')

  return (
    <div className="min-h-screen bg-[#F5F0EB] pt-[62px] pb-16">

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-[78px] left-4 right-4 z-[600] flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: '#1C1917', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
        >
          {toast.type === 'success'
            ? <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#C9A882' }} strokeWidth={2} />
            : <AlertCircle  className="w-5 h-5 shrink-0" style={{ color: '#EF4444' }} strokeWidth={2} />
          }
          <span className="text-[14px] font-medium text-white">{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer mb-3"
          style={{ background: 'none', border: 'none' }}
          aria-label="Πίσω"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
        </button>
        <h1 className="text-[26px] font-bold leading-tight" style={{ color: '#3D2B1F' }}>
          Υποστήριξη
        </h1>
      </div>

      <div className="px-5 pt-2 flex flex-col gap-6">

        {/* Main topic selector */}
        <SelectF
          label="Πώς μπορούμε να σας βοηθήσουμε;"
          value={topic}
          onChange={val => { setTopic(val); setToast(null) }}
          options={MAIN_OPTIONS}
          placeholder="Επιλέξτε θέμα"
          error=""
        />

        {/* Conditional form */}
        {topic && (
          <>
            <div className="h-px" style={{ background: '#E8E0D8' }} />
            {topic === MAIN_OPTIONS[0] && <Form1 userEmail={userEmail} topic={topic} onSuccess={handleSuccess} onError={handleError} />}
            {topic === MAIN_OPTIONS[1] && <Form2 userEmail={userEmail} topic={topic} onSuccess={handleSuccess} onError={handleError} />}
            {topic === MAIN_OPTIONS[2] && <Form3 userEmail={userEmail} topic={topic} onSuccess={handleSuccess} onError={handleError} />}
          </>
        )}

      </div>
    </div>
  )
}
