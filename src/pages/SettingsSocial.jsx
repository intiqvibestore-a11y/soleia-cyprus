import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase/client'

const PROVIDER_NAMES = { google: 'Google', facebook: 'Facebook', apple: 'Apple' }

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={value}
      className="shrink-0 cursor-pointer"
      style={{
        position: 'relative',
        width: 44,
        height: 26,
        borderRadius: 13,
        background: value ? '#C9A882' : '#D1CAC1',
        border: 'none',
        padding: 0,
        transition: 'background 0.2s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s',
          transform: value ? 'translateX(18px)' : 'translateX(0)',
          display: 'block',
        }}
      />
    </button>
  )
}

function GoogleLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function FacebookLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="18" fill="#1877F2"/>
      <path
        d="M21.33 18.4h-2.3V27h-3.63V18.4h-1.65v-3.07h1.65v-1.98c0-2.7 1.13-4.32 4.32-4.32h2.66v3.07h-1.66c-1.24 0-1.32.46-1.32 1.32v1.91h2.99l-.35 3.07z"
        fill="white"
      />
    </svg>
  )
}

function AppleLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 512 512" fill="none">
      <path
        d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.4-.7 90.7-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
        fill="#1C1917"
      />
    </svg>
  )
}

const LOGOS = { google: <GoogleLogo />, facebook: <FacebookLogo />, apple: <AppleLogo /> }

function ProviderRow({ provider, linked, onToggle, first = false }) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4"
      style={{ borderTop: first ? 'none' : '1px solid #F0EBE5' }}
    >
      <div className="shrink-0 w-9 h-9 flex items-center justify-center">
        {LOGOS[provider]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-semibold leading-tight" style={{ color: '#1C1917' }}>
          {PROVIDER_NAMES[provider]}
        </p>
        <p className="text-[13px] mt-0.5" style={{ color: '#A8A29E' }}>
          {linked ? 'Συνδεδεμένο' : 'Μη συνδεδεμένο'}
        </p>
      </div>
      <Toggle value={linked} onChange={onToggle} />
    </div>
  )
}

export default function SettingsSocial() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [toggles, setToggles] = useState({ google: false, facebook: false, apple: false })
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadToggles = useCallback(async (userId) => {
    if (!userId) return
    const { data } = await supabase
      .from('profiles')
      .select('connected_google, connected_facebook, connected_apple')
      .eq('id', userId)
      .single()
    setToggles({
      google:   data?.connected_google   ?? false,
      facebook: data?.connected_facebook ?? false,
      apple:    data?.connected_apple    ?? false,
    })
    setLoadingData(false)
  }, [])

  useEffect(() => {
    const connectingProvider = sessionStorage.getItem('connectingProvider')

    if (connectingProvider) {
      // Always clear sessionStorage regardless of outcome
      sessionStorage.removeItem('connectingProvider')

      Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser(),
      ]).then(([{ data: { session } }, { data: { user: currentUser } }]) => {
        const uid = currentUser?.id || session?.user?.id

        // Verify the specific provider was actually connected via identities
        const identities = session?.user?.identities || []
        const providerConnected = identities.some(i => i.provider === connectingProvider)

        if (uid && providerConnected) {
          // OAuth succeeded — update only this provider's column, then reload from profiles
          supabase.from('profiles')
            .update({ [`connected_${connectingProvider}`]: true })
            .eq('id', uid)
            .then(() => loadToggles(uid))
        } else {
          // Cancelled or failed — reload profiles as-is, no update
          const loadId = uid || user?.id
          if (loadId) loadToggles(loadId)
          else setLoadingData(false)
        }
      })
    } else {
      if (user?.id) loadToggles(user.id)
      else setLoadingData(false)
    }
  }, [user, loadToggles])

  const handleToggleClick = (provider) => {
    if (toggles[provider]) {
      // ON → OFF: immediately flip and update DB
      setToggles(t => ({ ...t, [provider]: false }))
      if (user?.id) {
        supabase.from('profiles')
          .update({ [`connected_${provider}`]: false })
          .eq('id', user.id)
      }
    } else {
      // OFF → ON: synchronous redirect — no async, works on iOS Safari
      sessionStorage.setItem('connectingProvider', provider)
      const base = supabase.supabaseUrl
      const redirectTo = encodeURIComponent(window.location.origin + '/settings/social')
      window.location.href = `${base}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectTo}`
    }
  }

  const handleDone = async () => {
    if (!user?.id) { navigate('/settings'); return }
    setSaving(true)
    await supabase.from('profiles').update({
      connected_google:   toggles.google,
      connected_facebook: toggles.facebook,
      connected_apple:    toggles.apple,
    }).eq('id', user.id)
    setSaving(false)
    navigate('/settings')
  }

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }}>

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
        <h1
          className="text-[24px] font-bold leading-tight"
          style={{ color: '#3D2B1F', fontFamily: 'Georgia, serif' }}
        >
          Στοιχεία σύνδεσης στα socials
        </h1>
      </div>

      {/* Providers card */}
      <div
        className="mx-5 mt-4 bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 1px 8px rgba(28,25,23,0.07)' }}
      >
        {loadingData ? (
          <div className="py-12 flex justify-center">
            <div
              className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: '#E8E0D8', borderTopColor: '#C9A882' }}
            />
          </div>
        ) : (
          <>
            <ProviderRow provider="google"   linked={toggles.google}   onToggle={() => handleToggleClick('google')}   first />
            <ProviderRow provider="facebook" linked={toggles.facebook} onToggle={() => handleToggleClick('facebook')} />
            <ProviderRow provider="apple"    linked={toggles.apple}    onToggle={() => handleToggleClick('apple')}    />
          </>
        )}
      </div>

      {/* Inline "Έτοιμο" button — scrolls with page */}
      <div className="mt-6 mb-8 flex justify-center">
        <button
          onClick={handleDone}
          disabled={saving}
          className="w-3/4 py-[15px] rounded-full font-semibold text-[16px] cursor-pointer"
          style={{ background: '#1C1917', color: 'white', border: 'none', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Αποθήκευση...' : 'Έτοιμο'}
        </button>
      </div>

    </div>
  )
}
