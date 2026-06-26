import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../utils/supabase/client'

function Toggle({ value, onChange, disabled = false }) {
  return (
    <button
      onClick={disabled ? undefined : onChange}
      role="switch"
      aria-checked={value}
      className="shrink-0"
      style={{
        position: 'relative',
        width: 44,
        height: 26,
        borderRadius: 13,
        background: value ? '#C9A882' : '#D1CAC1',
        border: 'none',
        padding: 0,
        transition: 'background 0.2s',
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
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
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <path
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.29.07 2.18.74 2.97.76 1.15-.24 2.25-.93 3.47-.82 1.47.14 2.57.73 3.28 1.9-3.22 1.93-2.46 5.87.28 7.02zm-3.78-13.5c-.06 1.92-1.52 3.42-3.32 3.3-.27-1.89 1.68-3.54 3.32-3.3z"
        fill="#1C1917"
      />
    </svg>
  )
}

function ProviderRow({ logo, name, linked, onToggle, toggling, first = false }) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4"
      style={{ borderTop: first ? 'none' : '1px solid #F0EBE5' }}
    >
      <div className="shrink-0 w-9 h-9 flex items-center justify-center">
        {logo}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-semibold leading-tight" style={{ color: '#1C1917' }}>{name}</p>
        <p className="text-[13px] mt-0.5" style={{ color: '#A8A29E' }}>
          {linked ? 'Συνδεδεμένο' : 'Μη συνδεδεμένο'}
        </p>
      </div>
      <Toggle value={linked} onChange={onToggle} disabled={toggling} />
    </div>
  )
}

export default function SettingsSocial() {
  const navigate = useNavigate()
  const [identities, setIdentities] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [toggling, setToggling] = useState({})

  useEffect(() => {
    supabase.auth.getUserIdentities().then(({ data }) => {
      setIdentities(data?.identities || [])
      setLoadingData(false)
    })
  }, [])

  const isLinked = provider => identities.some(i => i.provider === provider)
  const getIdentity = provider => identities.find(i => i.provider === provider)

  const handleToggle = async (provider) => {
    if (toggling[provider]) return
    setToggling(t => ({ ...t, [provider]: true }))

    if (isLinked(provider)) {
      const identity = getIdentity(provider)
      const { error } = await supabase.auth.unlinkIdentity(identity)
      if (!error) {
        setIdentities(prev => prev.filter(i => i.provider !== provider))
      }
      setToggling(t => ({ ...t, [provider]: false }))
    } else {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/settings/social',
          ...(provider === 'google' ? { scopes: 'email' } : {}),
        },
      })
      // page navigates away; no need to reset toggling state
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB] pt-[62px] pb-[160px]">

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
        <h1 className="text-[24px] font-bold leading-tight" style={{ color: '#3D2B1F' }}>
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
            <ProviderRow
              logo={<GoogleLogo />}
              name="Google"
              linked={isLinked('google')}
              onToggle={() => handleToggle('google')}
              toggling={!!toggling.google}
              first
            />
            <ProviderRow
              logo={<FacebookLogo />}
              name="Facebook"
              linked={isLinked('facebook')}
              onToggle={() => handleToggle('facebook')}
              toggling={!!toggling.facebook}
            />
            <ProviderRow
              logo={<AppleLogo />}
              name="Apple"
              linked={isLinked('apple')}
              onToggle={() => handleToggle('apple')}
              toggling={!!toggling.apple}
            />
          </>
        )}
      </div>

      {/* Fixed "Έτοιμο" button — sits just above the BottomNav */}
      <div
        className="fixed left-0 right-0 z-[200] px-5"
        style={{ bottom: '68px' }}
      >
        <button
          onClick={() => navigate('/settings')}
          className="w-full py-[15px] rounded-full font-semibold text-[16px] cursor-pointer"
          style={{ background: '#1C1917', color: 'white', border: 'none' }}
        >
          Έτοιμο
        </button>
      </div>

    </div>
  )
}
