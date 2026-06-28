import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, CheckCircle2, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase/client'

function PasswordField({ label, value, onChange, show, onToggleShow }) {
  return (
    <div className="mb-4">
      <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#3D2B1F' }}>
        {label} <span style={{ color: '#EF4444' }}>*</span>
      </label>
      <div
        className="flex items-center rounded-2xl px-4 gap-2"
        style={{
          background: '#FDFAF7',
          border: '1.5px solid #E8E0D8',
          height: 52,
        }}
      >
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Κωδικός πρόσβασης"
          className="flex-1 bg-transparent outline-none text-[15px]"
          style={{ color: '#1C1917', border: 'none' }}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="cursor-pointer shrink-0"
          style={{ background: 'none', border: 'none', padding: 0, lineHeight: 0 }}
          aria-label={show ? 'Απόκρυψη κωδικού' : 'Εμφάνιση κωδικού'}
        >
          {show
            ? <EyeOff className="w-5 h-5" style={{ color: '#A8A29E' }} strokeWidth={1.7} />
            : <Eye    className="w-5 h-5" style={{ color: '#A8A29E' }} strokeWidth={1.7} />
          }
        </button>
      </div>
    </div>
  )
}

function EnvelopeIllustration() {
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="envGrad" x1="4" y1="10" x2="64" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8D5B0" />
          <stop offset="1" stopColor="#C9A96E" />
        </linearGradient>
      </defs>
      <rect x="4" y="16" width="60" height="42" rx="10" fill="url(#envGrad)" opacity="0.18" />
      <rect x="4" y="16" width="60" height="42" rx="10" stroke="url(#envGrad)" strokeWidth="2.5" />
      <path d="M4 26 L34 44 L64 26" stroke="url(#envGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="4"  y1="58" x2="24" y2="38" stroke="url(#envGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      <line x1="64" y1="58" x2="44" y2="38" stroke="url(#envGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
    </svg>
  )
}

function Sheet({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[400] flex items-end"
      style={{ background: 'rgba(28,25,23,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full bg-[#FDFAF7] rounded-t-[28px] px-6 pt-5 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: '#D1CAC1' }} />
        {children}
      </div>
    </div>
  )
}

export default function SettingsChangePassword() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [userEmail, setUserEmail] = useState(user?.email || '')

  // Fetch authoritative email directly — covers OAuth users where user?.email may lag
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      const email = u?.email || u?.user_metadata?.email || ''
      if (email) setUserEmail(email)
    })
  }, [])

  const [current, setCurrent]   = useState('')
  const [next, setNext]         = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)

  const [forgotOpen, setForgotOpen]       = useState(false)
  const [resetLoading, setResetLoading]   = useState(false)
  const [emailSentOpen, setEmailSentOpen] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!current || !next || !confirm) { setError('Συμπληρώστε όλα τα πεδία.'); return }
    if (next !== confirm)               { setError('Οι νέοι κωδικοί δεν ταιριάζουν.'); return }
    if (next.length < 6)                { setError('Ο νέος κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.'); return }

    setLoading(true)
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: userEmail, password: current })
    if (signInErr) { setError('Ο τρέχων κωδικός είναι λανθασμένος.'); setLoading(false); return }

    const { error: updateErr } = await supabase.auth.updateUser({ password: next })
    if (updateErr) { setError(updateErr.message); setLoading(false); return }

    setLoading(false)
    setCurrent(''); setNext(''); setConfirm('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleSendReset = async () => {
    setResetLoading(true)
    await supabase.auth.resetPasswordForEmail(userEmail)
    setResetLoading(false)
    setForgotOpen(false)
    setEmailSentOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB]">

      {/* Success toast */}
      {success && (
        <div
          className="fixed top-[78px] left-4 right-4 z-[600] flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: '#1C1917', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#C9A882' }} strokeWidth={2} />
          <span className="text-[14px] font-medium text-white">Ο κωδικός ενημερώθηκε με επιτυχία.</span>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <button
          onClick={() => navigate('/settings')}
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer mb-3"
          style={{ background: 'none', border: 'none' }}
          aria-label="Πίσω"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
        </button>
        <h1 className="text-[26px] font-bold leading-tight" style={{ color: '#3D2B1F' }}>
          Αλλαγή κωδικού πρόσβασης
        </h1>
      </div>

      <div className="px-5 pt-2">
        {/* Subtitle */}
        <p className="text-[14px] mb-6 leading-relaxed" style={{ color: '#78716C' }}>
          Εισαγάγετε έναν νέο κωδικό πρόσβασης για{' '}
          <span className="font-semibold" style={{ color: '#3D2B1F' }}>{userEmail}</span>
        </p>

        {/* Error */}
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-[13px]"
            style={{ background: '#FEE2E2', color: '#991B1B' }}
          >
            {error}
          </div>
        )}

        {/* Fields */}
        <PasswordField
          label="Εισαγάγετε τον τρέχοντα κωδικό πρόσβασης"
          value={current}
          onChange={setCurrent}
          show={showCurrent}
          onToggleShow={() => setShowCurrent(s => !s)}
        />
        <PasswordField
          label="Εισαγάγετε νέο κωδικό πρόσβασης"
          value={next}
          onChange={setNext}
          show={showNext}
          onToggleShow={() => setShowNext(s => !s)}
        />
        <PasswordField
          label="Επιβεβαίωση νέου κωδικού πρόσβασης"
          value={confirm}
          onChange={setConfirm}
          show={showConfirm}
          onToggleShow={() => setShowConfirm(s => !s)}
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-[15px] rounded-full font-semibold text-[16px] mt-2 cursor-pointer"
          style={{ background: '#1C1917', color: 'white', border: 'none', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Ενημέρωση...' : 'Ενημέρωση κωδικού πρόσβασης'}
        </button>

        {/* Forgot link */}
        <p className="mt-5 text-sm leading-relaxed" style={{ color: '#6B7280' }}>
          Εάν ξεχάσατε τον κωδικό πρόσβασής σας,{' '}
          <span
            onClick={() => setForgotOpen(true)}
            className="underline cursor-pointer"
            style={{ color: '#C9A882' }}
          >
            μπορείτε να το επαναφέρετε κάνοντας κλικ σε αυτόν τον σύνδεσμο.
          </span>
        </p>
      </div>

      {/* Forgot password sheet */}
      {forgotOpen && (
        <Sheet onClose={() => setForgotOpen(false)}>
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-[20px] font-bold leading-tight pr-4" style={{ color: '#3D2B1F' }}>
              Ξεχάσατε τον κωδικό πρόσβασης;
            </h2>
            <button
              onClick={() => setForgotOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full shrink-0 cursor-pointer"
              style={{ background: '#F0EBE5', border: 'none' }}
            >
              <X className="w-4 h-4" style={{ color: '#1C1917' }} strokeWidth={2} />
            </button>
          </div>
          <p className="text-[14px] leading-relaxed mb-1" style={{ color: '#78716C' }}>
            Ξεχάσατε τον κωδικό πρόσβασης του πελάτη σας; Θα σας στείλουμε έναν ασφαλή σύνδεσμο για να ενημερώσετε τον κωδικό πρόσβασής σας στο
          </p>
          <p className="text-[14px] font-semibold mb-7" style={{ color: '#3D2B1F' }}>{userEmail}</p>
          <button
            onClick={handleSendReset}
            disabled={resetLoading}
            className="w-full py-[15px] rounded-full font-semibold text-[16px] cursor-pointer"
            style={{ background: '#1C1917', color: 'white', border: 'none', opacity: resetLoading ? 0.7 : 1 }}
          >
            {resetLoading ? 'Αποστολή...' : 'Αποστολή συνδέσμου επαναφοράς'}
          </button>
        </Sheet>
      )}

      {/* Email sent sheet */}
      {emailSentOpen && (
        <Sheet onClose={() => setEmailSentOpen(false)}>
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setEmailSentOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
              style={{ background: '#F0EBE5', border: 'none' }}
            >
              <X className="w-4 h-4" style={{ color: '#1C1917' }} strokeWidth={2} />
            </button>
          </div>
          <div className="flex flex-col items-center text-center pb-2">
            <EnvelopeIllustration />
            <h2 className="text-[20px] font-bold mt-5 mb-3" style={{ color: '#3D2B1F' }}>
              Ελέγξτε το email σας
            </h2>
            <p className="text-[14px] leading-relaxed max-w-xs" style={{ color: '#78716C' }}>
              Στείλαμε ένα email επαναφοράς κωδικού πρόσβασης στο{' '}
              <span className="font-semibold" style={{ color: '#3D2B1F' }}>{userEmail}</span>.{' '}
              Ελέγξτε τα εισερχόμενά σας για να επαναφέρετε τον κωδικό πρόσβασης.
              Αν δεν λάβατε το email, ελέγξτε την ανεπιθύμητη αλληλογραφία σας.
            </p>
          </div>
          <button
            onClick={() => { setEmailSentOpen(false); navigate('/settings') }}
            className="w-full py-[15px] rounded-full font-semibold text-[16px] mt-6 cursor-pointer"
            style={{ background: '#1C1917', color: 'white', border: 'none' }}
          >
            Επιστροφή στις ρυθμίσεις
          </button>
        </Sheet>
      )}
    </div>
  )
}
