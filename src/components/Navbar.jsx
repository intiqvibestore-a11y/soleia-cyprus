import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut } from 'lucide-react'
import { useLang, useT } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

function SoleiaLogo({ size = 38 }) {
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 46 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M10 28C10 20.82 15.59 15 23 15C30.41 15 36 20.82 36 28" stroke="#C9A882" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M7 31.5Q14.5 27.5 23 31.5Q31.5 35.5 39 31.5" stroke="#C9A882" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <line x1="23" y1="12" x2="23" y2="6.5"  stroke="#C9A882" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="31.5" y1="14.5" x2="34.5" y2="10.5" stroke="#C9A882" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="14.5" y1="14.5" x2="11.5" y2="10.5" stroke="#C9A882" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="37.5" y1="20.5" x2="41.5" y2="18"   stroke="#C9A882" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="8.5"  y1="20.5" x2="4.5"  y2="18"   stroke="#C9A882" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="39.5" y1="26.5" x2="43.5" y2="25.5"  stroke="#C9A882" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="6.5"  y1="26.5" x2="2.5"  y2="25.5"  stroke="#C9A882" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="flex items-center gap-[5px] select-none" style={{ padding: '6px 4px' }}>
      {[['EL', 'Ελ'], ['EN', 'En']].map(([code, label], i) => (
        <>
          {i === 1 && <span key="sep" style={{ color: '#D6CFCA', fontSize: 11, lineHeight: 1 }}>|</span>}
          <button
            key={code}
            onClick={() => setLang(code)}
            className="text-[13px] transition-all duration-200 cursor-pointer"
            style={{
              background: 'none', border: 'none', outline: 'none', padding: 0,
              fontWeight: lang === code ? 700 : 400,
              color: lang === code ? '#C9A882' : '#A8A29E',
            }}
            aria-label={`Switch to ${code}`}
          >
            {label}
          </button>
        </>
      ))}
    </div>
  )
}

function BellButton() {
  const T = useT()
  return (
    <button
      className="relative p-2 rounded-full cursor-pointer transition-colors duration-200 hover:bg-[#F5F0EB] text-[#78716C] hover:text-[#C9A882]"
      style={{ background: 'none', border: 'none', outline: 'none' }}
      aria-label={T.nav_notifications}
    >
      <Bell className="w-[18px] h-[18px]" strokeWidth={1.7} />
    </button>
  )
}

// Avatar circle — shows Google photo or email initial
function Avatar({ user, size = 30 }) {
  const photo  = user.user_metadata?.avatar_url
  const name   = user.user_metadata?.full_name || user.user_metadata?.name || user.email || ''
  const letter = name[0]?.toUpperCase() || 'U'
  return photo ? (
    <img src={photo} alt="" referrerPolicy="no-referrer"
      className="rounded-full object-cover shrink-0 border border-[#E8E0D8]"
      style={{ width: size, height: size }} />
  ) : (
    <div className="rounded-full bg-[#C9A882] flex items-center justify-center shrink-0 text-white font-bold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {letter}
    </div>
  )
}

// Desktop user menu with dropdown
function UserMenu({ user }) {
  const T = useT()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const displayName = user.user_metadata?.full_name
    || user.user_metadata?.name
    || user.email?.split('@')[0]
    || 'User'

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-[#F5F0EB] transition-colors cursor-pointer"
        style={{ border: 'none', background: 'none', outline: 'none' }}
      >
        <Avatar user={user} size={28} />
        <span className="text-[13px] font-semibold text-[#1C1917] max-w-[130px] truncate">
          {displayName}
        </span>
        <ChevronDown
          className="w-3.5 h-3.5 text-[#A8A29E] transition-transform duration-150"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 bg-white rounded-2xl border border-[#E8E0D8] py-1.5 z-[60]"
          style={{
            minWidth: '180px',
            boxShadow: '0 8px 24px rgba(28,25,23,0.12)',
          }}
        >
          {/* Email label */}
          <div className="px-4 py-2 border-b border-[#F0EAE3] mb-1">
            <p className="text-[11px] text-[#A8A29E] truncate">{user.email}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[14px] font-medium text-[#1C1917] hover:bg-[#F5F0EB] transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 text-[#78716C]" strokeWidth={1.7} />
            {T.nav_sign_out}
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const T = useT()
  const { user } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E0D8]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-[62px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <SoleiaLogo size={36} />
            <span
              className="font-display text-[22px] text-[#1C1917] tracking-tight leading-none font-medium"
              style={{ letterSpacing: '-0.02em' }}
            >
              soleia
            </span>
          </Link>

          {/* Right side — desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <button
                className="text-sm font-medium text-[#1C1917] hover:text-[#C9A882] transition-colors duration-200 px-3 py-2 cursor-pointer"
                style={{ background: 'none', border: 'none' }}
              >
                {T.nav_login}
              </button>
            )}

            <Link
              to="/services"
              className="btn-press text-sm font-medium text-[#1C1917] border border-[#1C1917] hover:bg-[#1C1917] hover:text-white px-4 py-2 rounded-full transition-all duration-200 cursor-pointer"
            >
              {T.nav_list_business}
            </Link>

            <div className="w-px h-4 bg-[#E8E0D8] mx-2" />
            <LangToggle />
            <BellButton />
          </nav>

          {/* Right side — mobile */}
          <div className="md:hidden flex items-center gap-1">
            <LangToggle />
            <BellButton />
          </div>

        </div>
      </div>
    </header>
  )
}
