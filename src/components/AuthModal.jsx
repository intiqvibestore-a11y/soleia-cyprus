import { useState, useEffect, useRef } from 'react'
import { X, Mail, ArrowLeft } from 'lucide-react'
import { useT } from '../context/LanguageContext'
import { supabase } from '../utils/supabase/client'
import { COUNTRIES, CountryPicker } from './CountryPicker'

// ── OTP view — 6-digit SMS code entry ─────────────────────────────────────────
function OtpView({ phone, onBack, onSuccess }) {
  const T = useT()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const refs = useRef([])

  useEffect(() => { refs.current[0]?.focus({ preventScroll: true }) }, [])

  const handleChange = (i, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = digit
    setDigits(next)
    if (digit && i < 5) refs.current[i + 1]?.focus({ preventScroll: true })
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus({ preventScroll: true })
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = Array(6).fill('')
    pasted.split('').forEach((d, i) => { next[i] = d })
    setDigits(next)
    refs.current[Math.min(pasted.length, 5)]?.focus({ preventScroll: true })
  }

  const handleVerify = async () => {
    const token = digits.join('')
    if (token.length !== 6) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
    setLoading(false)
    if (err) { setError(err.message); return }
    onSuccess()
  }

  const full = digits.join('')

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] text-[#78716C] hover:text-[#1C1917] transition-colors -ml-1 self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        {T.auth_back}
      </button>

      <div>
        <p className="text-[17px] font-semibold text-[#1C1917] mb-1">{T.auth_otp_title}</p>
        <p className="text-[13px] text-[#78716C]">{T.auth_otp_sent} {phone}</p>
      </div>

      {/* 6 digit boxes */}
      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => refs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={2}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className="w-[46px] h-[54px] text-center font-bold rounded-xl transition-colors focus:outline-none"
            style={{
              fontSize: '22px',
              touchAction: 'manipulation',
              border: `2px solid ${d ? '#1C1917' : '#D1CAC1'}`,
              background: d ? '#F8F5F2' : 'white',
              color: '#1C1917',
            }}
          />
        ))}
      </div>

      {error && (
        <p className="text-[13px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 leading-snug">
          {error}
        </p>
      )}

      <button
        onClick={handleVerify}
        disabled={loading || full.length !== 6}
        className="h-[54px] rounded-full bg-[#1C1917] hover:bg-[#2C2A28] disabled:bg-[#D1CAC1] disabled:cursor-not-allowed text-white font-semibold text-[16px] transition-colors mt-1"
      >
        {loading ? T.auth_signing_in : T.auth_otp_verify}
      </button>
    </div>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

// ── Email / password view ──────────────────────────────────────────────────────
function EmailView({ onBack, onSuccess }) {
  const T = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')

    // Try sign-in first
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })

    if (!signInErr) {
      setLoading(false)
      onSuccess()
      return
    }

    // Invalid credentials → try sign-up (new user)
    if (signInErr.message.toLowerCase().includes('invalid')) {
      const { data, error: signUpErr } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (signUpErr) {
        // "User already registered" means wrong password
        setError(signUpErr.message.includes('already') ? T.auth_wrong_password : signUpErr.message)
        return
      }
      if (data.session) {
        onSuccess() // email confirmation disabled — logged in immediately
      } else {
        setEmailSent(true) // confirmation email sent
      }
      return
    }

    setLoading(false)
    setError(signInErr.message)
  }

  if (emailSent) {
    return (
      <div className="flex flex-col items-center text-center py-6 gap-4">
        <div className="w-14 h-14 rounded-full bg-[#F5F0EB] flex items-center justify-center">
          <Mail className="w-6 h-6 text-[#C9A882]" />
        </div>
        <p className="text-[15px] text-[#1C1917] font-medium leading-snug px-2">{T.auth_check_email}</p>
        <button onClick={onBack} className="text-sm text-[#78716C] underline underline-offset-2">{T.auth_back}</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <button type="button" onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] text-[#78716C] hover:text-[#1C1917] transition-colors mb-1 -ml-1 self-start">
        <ArrowLeft className="w-4 h-4" />
        {T.auth_back}
      </button>

      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={T.auth_email_ph}
        className="h-[52px] px-4 border border-[#D1CAC1] rounded-xl text-[15px] text-[#1C1917] placeholder-[#B8AEA6] focus:outline-none focus:border-[#1C1917] transition-colors"
      />
      <input
        type="password"
        required
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder={T.auth_password_ph}
        className="h-[52px] px-4 border border-[#D1CAC1] rounded-xl text-[15px] text-[#1C1917] placeholder-[#B8AEA6] focus:outline-none focus:border-[#1C1917] transition-colors"
      />

      {error && (
        <p className="text-[13px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 leading-snug">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="h-[54px] rounded-full bg-[#1C1917] hover:bg-[#2C2A28] disabled:bg-[#D1CAC1] disabled:cursor-not-allowed text-white font-semibold text-[16px] transition-colors mt-1"
      >
        {loading ? T.auth_signing_in : T.auth_continue}
      </button>
    </form>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function AuthModal({ onClose }) {
  const T = useT()
  const [phone, setPhone] = useState('')
  const [countryIdx, setCountryIdx] = useState(0)
  const [view, setView] = useState('main') // 'main' | 'email' | 'otp'
  const [phoneE164, setPhoneE164] = useState('')
  const [phoneSending, setPhoneSending] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [facebookLoading, setFacebookLoading] = useState(false)

  // Close the modal and redirect to home after any successful auth
  const handleSuccess = () => {
    onClose()
    window.location.href = '/'
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleGoogle = async () => {
    setGoogleLoading(true)

    // Get the OAuth URL without redirecting the current window
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
        queryParams: { prompt: 'select_account' },
      },
    })

    if (error || !data?.url) {
      setGoogleLoading(false)
      return
    }

    // Open a centered popup — user can close it (X) to cancel at any time
    const w = 480, h = 600
    const left = Math.round((screen.width - w) / 2)
    const top  = Math.round((screen.height - h) / 2)
    const popup = window.open(
      data.url,
      'google-oauth',
      `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`
    )

    if (!popup) {
      // Popup blocked — fall back to full-page redirect
      window.location.href = data.url
      return
    }

    // Listen for the success message sent by AuthCallback inside the popup
    const onMessage = async (event) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== 'soleia-auth-success') return

      window.removeEventListener('message', onMessage)
      clearInterval(pollTimer)

      // Establish the session in this window using the tokens from the popup
      await supabase.auth.setSession({
        access_token:  event.data.access_token,
        refresh_token: event.data.refresh_token,
      })

      setGoogleLoading(false)
      handleSuccess()
    }
    window.addEventListener('message', onMessage)

    // Also watch for the user simply closing the popup (cancel)
    const pollTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollTimer)
        window.removeEventListener('message', onMessage)
        setGoogleLoading(false)
      }
    }, 500)
  }

  const handleFacebook = async () => {
    setFacebookLoading(true)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    })
    if (error || !data?.url) { setFacebookLoading(false); return }
    const w = 480, h = 600
    const left = Math.round((screen.width - w) / 2)
    const top  = Math.round((screen.height - h) / 2)
    const popup = window.open(data.url, 'facebook-oauth', `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`)
    if (!popup) { window.location.href = data.url; return }
    const onMessage = async (event) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== 'soleia-auth-success') return
      window.removeEventListener('message', onMessage)
      clearInterval(pollTimer)
      await supabase.auth.setSession({ access_token: event.data.access_token, refresh_token: event.data.refresh_token })
      setFacebookLoading(false)
      handleSuccess()
    }
    window.addEventListener('message', onMessage)
    const pollTimer = setInterval(() => {
      if (popup.closed) { clearInterval(pollTimer); window.removeEventListener('message', onMessage); setFacebookLoading(false) }
    }, 500)
  }

  const handlePhoneContinue = async () => {
    setPhoneSending(true)
    setPhoneError('')
    // Combine country dial code + local digits in E.164 format
    const dialCode = COUNTRIES[countryIdx].code          // e.g. "+357"
    const localDigits = phone.replace(/\D/g, '')         // strip spaces/dashes
    const fullPhone = dialCode + localDigits             // e.g. "+35799123456"
    const { error: err } = await supabase.auth.signInWithOtp({ phone: fullPhone })
    setPhoneSending(false)
    if (err) { setPhoneError(err.message); return }
    setPhoneE164(fullPhone)
    setView('otp')
  }

  return (
    <>
      <div className="fixed inset-0 z-[400] bg-black/40" onClick={onClose} />

      <div
        className="fixed bottom-0 left-0 right-0 z-[401] bg-white rounded-t-[28px] flex flex-col"
        style={{ maxHeight: '96dvh', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D0]" />
        </div>

        {/* Close button */}
        <div className="flex justify-end px-5 pt-3 pb-1 shrink-0">
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F5F0EB] hover:bg-[#EDE6DF] flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-[#1C1917]" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 pb-2">
          <h2 className="font-display text-[26px] font-semibold text-[#1C1917] leading-tight mb-2">
            {T.auth_title}
          </h2>
          <p className="text-[14px] text-[#78716C] mb-7">{T.auth_subtitle}</p>

          {view === 'otp' ? (
            <OtpView phone={phoneE164} onBack={() => setView('main')} onSuccess={handleSuccess} />
          ) : view === 'email' ? (
            <EmailView onBack={() => setView('main')} onSuccess={handleSuccess} />
          ) : (
            <>
              {/* Phone input */}
              <label className="block text-[13px] font-semibold text-[#1C1917] mb-2">
                {T.auth_phone_label}
              </label>
              <div className="flex gap-2 mb-3">
                <CountryPicker value={countryIdx} onChange={setCountryIdx} />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setPhoneError('') }}
                  placeholder="99 000 000"
                  className="flex-1 h-[52px] px-4 border border-[#D1CAC1] rounded-xl text-[#1C1917] placeholder-[#B8AEA6] focus:outline-none focus:border-[#1C1917] transition-colors"
                  style={{ fontSize: '16px', touchAction: 'manipulation' }}
                />
              </div>
              <p className="text-[12px] text-[#A8A29E] leading-relaxed mb-3">{T.auth_phone_note}</p>
              {phoneError && (
                <p className="text-[13px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 leading-snug mb-3">
                  {phoneError}
                </p>
              )}
              <button
                onClick={handlePhoneContinue}
                disabled={phone.replace(/\D/g, '').length < 6 || phoneSending}
                className="w-full h-[54px] rounded-full bg-[#1C1917] hover:bg-[#2C2A28] disabled:bg-[#D1CAC1] disabled:cursor-not-allowed text-white font-semibold text-[16px] transition-colors mb-6"
              >
                {phoneSending ? T.auth_signing_in : T.auth_continue}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-[#E8E0D8]" />
                <span className="text-[13px] text-[#A8A29E] font-medium">{T.auth_or}</span>
                <div className="flex-1 h-px bg-[#E8E0D8]" />
              </div>

              {/* Social buttons */}
              <div className="flex flex-col gap-3">
                {/* Email */}
                <button
                  onClick={() => setView('email')}
                  className="w-full h-[54px] rounded-full border border-[#D1CAC1] hover:border-[#1C1917] hover:bg-[#F8F5F2] flex items-center justify-center gap-3 text-[15px] font-semibold text-[#1C1917] transition-all duration-150"
                >
                  <Mail className="w-[18px] h-[18px] text-[#1C1917]" />
                  {T.auth_email}
                </button>

                {/* Apple (UI only) */}
                <button
                  disabled
                  className="w-full h-[54px] rounded-full border border-[#D1CAC1] flex items-center justify-center gap-3 text-[15px] font-semibold text-[#B8AEA6] cursor-not-allowed opacity-50"
                >
                  <AppleIcon />
                  {T.auth_apple}
                </button>

                {/* Facebook */}
                <button
                  onClick={handleFacebook}
                  disabled={facebookLoading}
                  className="w-full h-[54px] rounded-full border border-[#D1CAC1] hover:border-[#1C1917] hover:bg-[#F8F5F2] flex items-center justify-center gap-3 text-[15px] font-semibold text-[#1C1917] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FacebookIcon />
                  {facebookLoading ? T.auth_signing_in : T.auth_facebook}
                </button>

                {/* Google */}
                <button
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="w-full h-[54px] rounded-full border border-[#D1CAC1] hover:border-[#1C1917] hover:bg-[#F8F5F2] flex items-center justify-center gap-3 text-[15px] font-semibold text-[#1C1917] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <GoogleIcon />
                  {googleLoading ? T.auth_signing_in : T.auth_google}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
