import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { supabase } from '../utils/supabase/client'

const ONLY_IDENTITY_ERROR = 'Δεν μπορείτε να αποσυνδέσετε τον μοναδικό τρόπο σύνδεσής σας.'
const PROVIDER_NAMES = { google: 'Google', facebook: 'Facebook', apple: 'Apple' }

function Toast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      className="fixed top-[78px] left-4 right-4 z-[600] flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{ background: '#1C1917', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
    >
      <AlertCircle className="w-5 h-5 shrink-0" style={{ color: '#EF4444' }} strokeWidth={2} />
      <span className="text-[13px] font-medium text-white leading-snug">{message}</span>
    </div>
  )
}

function UnlinkSheet({ provider, onCancel, onConfirm, loading }) {
  const name = PROVIDER_NAMES[provider] || provider
  return (
    <div
      className="fixed inset-0 z-[400] flex items-end"
      style={{ background: 'rgba(28,25,23,0.45)' }}
      onClick={() => !loading && onCancel()}
    >
      <div
        className="w-full bg-[#FDFAF7] rounded-t-[28px] px-6 pt-5 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: '#D1CAC1' }} />
        <h2 className="text-[19px] font-bold mb-7" style={{ color: '#3D2B1F' }}>
          Αποσύνδεση από {name};
        </h2>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="w-full py-[14px] rounded-full font-semibold text-[15px] mb-3 cursor-pointer"
          style={{ background: '#EF4444', color: 'white', border: 'none', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Αποσύνδεση...' : 'Αποσύνδεση'}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="w-full py-[14px] rounded-full font-semibold text-[15px] cursor-pointer"
          style={{ background: 'transparent', border: '1.5px solid #D1CAC1', color: '#3D2B1F', opacity: loading ? 0.5 : 1 }}
        >
          Ακύρωση
        </button>
      </div>
    </div>
  )
}

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
    <svg width="36" height="36" viewBox="0 0 512 512" fill="none">
      <path
        d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.4-.7 90.7-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
        fill="#1C1917"
      />
    </svg>
  )
}

function ProviderRow({ logo, name, linked, onToggle, disabled, first = false }) {
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
      <Toggle value={linked} onChange={onToggle} disabled={disabled} />
    </div>
  )
}

export default function SettingsSocial() {
  const navigate = useNavigate()
  const [identities, setIdentities]       = useState([])
  const [loadingData, setLoadingData]     = useState(true)
  const [unlinkPending, setUnlinkPending] = useState(null)
  const [unlinkLoading, setUnlinkLoading] = useState(false)
  const [toast, setToast]                 = useState(null)

  const fetchIdentities = useCallback(async () => {
    const { data } = await supabase.auth.getUserIdentities()
    setIdentities(data?.identities || [])
    setLoadingData(false)
  }, [])

  useEffect(() => {
    fetchIdentities()

    // Re-fetch on return from OAuth redirect or any auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        fetchIdentities()
      }
    })
    return () => subscription.unsubscribe()
  }, [fetchIdentities])

  const isLinked   = provider => identities.some(i => i.provider === provider)
  const getIdentity = provider => identities.find(i => i.provider === provider)
  const dismissToast = useCallback(() => setToast(null), [])

  const handleToggleClick = async (provider) => {
    if (isLinked(provider)) {
      if (identities.length <= 1) {
        setToast(ONLY_IDENTITY_ERROR)
        return
      }
      setUnlinkPending(provider)
    } else {
      // skipBrowserRedirect: true → get URL back without auto-redirect,
      // then set window.location.href ourselves (works on iOS Safari; window.open would not)
      const { data, error } = await supabase.auth.linkWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/settings/social',
          skipBrowserRedirect: true,
        },
      })
      if (data?.url) {
        window.location.href = data.url
      } else if (error) {
        setToast('Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.')
      }
    }
  }

  const handleUnlinkConfirm = async () => {
    if (!unlinkPending) return
    setUnlinkLoading(true)
    const identity = getIdentity(unlinkPending)
    const { error } = await supabase.auth.unlinkIdentity(identity)
    if (error) {
      setToast(ONLY_IDENTITY_ERROR)
    } else {
      await fetchIdentities()
    }
    setUnlinkLoading(false)
    setUnlinkPending(null)
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB] pt-[62px] pb-[160px]">

      {toast && <Toast message={toast} onDismiss={dismissToast} />}

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
        <h1 className="text-[24px] font-bold leading-tight" style={{ color: '#3D2B1F', fontFamily: 'Georgia, serif' }}>
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
              onToggle={() => handleToggleClick('google')}
              disabled={false}
              first
            />
            <ProviderRow
              logo={<FacebookLogo />}
              name="Facebook"
              linked={isLinked('facebook')}
              onToggle={() => handleToggleClick('facebook')}
              disabled={false}
            />
            <ProviderRow
              logo={<AppleLogo />}
              name="Apple"
              linked={isLinked('apple')}
              onToggle={() => handleToggleClick('apple')}
              disabled={false}
            />
          </>
        )}
      </div>

      {/* Fixed "Έτοιμο" button — above BottomNav */}
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

      {/* Unlink confirmation sheet */}
      {unlinkPending && (
        <UnlinkSheet
          provider={unlinkPending}
          onCancel={() => setUnlinkPending(null)}
          onConfirm={handleUnlinkConfirm}
          loading={unlinkLoading}
        />
      )}

    </div>
  )
}
