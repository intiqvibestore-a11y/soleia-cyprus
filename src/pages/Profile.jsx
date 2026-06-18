import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Heart, MessageCircle, CalendarDays,
  ClipboardList, Settings2, LifeBuoy, Globe,
  LogOut, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase/client'

function MenuItem({ icon: Icon, label, onClick, danger = false, first = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-[15px] text-left transition-colors cursor-pointer ${danger ? 'hover:bg-red-50' : 'hover:bg-[#FDFAF7]'}`}
      style={{
        background: 'transparent',
        border: 'none',
        borderTop: first ? 'none' : '1px solid #F5F0EB',
      }}
    >
      <Icon
        className="w-[20px] h-[20px] shrink-0"
        style={{ color: danger ? '#EF4444' : '#78716C' }}
        strokeWidth={1.7}
      />
      <span
        className="flex-1 text-[15px] font-medium leading-none"
        style={{ color: danger ? '#EF4444' : '#1C1917' }}
      >
        {label}
      </span>
      {!danger && <ChevronRight className="w-4 h-4 text-[#D1CAC1] shrink-0" strokeWidth={1.7} />}
    </button>
  )
}

function MenuCard({ items, className = '' }) {
  return (
    <div
      className={`mx-5 bg-white rounded-2xl overflow-hidden ${className}`}
      style={{ boxShadow: '0 1px 8px rgba(28,25,23,0.07)' }}
    >
      {items.map((item, i) => (
        <MenuItem key={item.label} {...item} first={i === 0} />
      ))}
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, loading, signOut } = useAuth()
  const [avatarUrl, setAvatarUrl]         = useState(null)
  const [walletBalance, setWalletBalance] = useState(0)

  useEffect(() => {
    if (!loading && !user) navigate('/', { replace: true })
  }, [user, loading, navigate])

  useEffect(() => {
    if (loading || !user) return
    supabase.from('profiles').select('avatar_url, wallet_balance').eq('id', user.id).single()
      .then(({ data }) => {
        if (data?.avatar_url) setAvatarUrl(data.avatar_url)
        if (data?.wallet_balance != null) setWalletBalance(Number(data.wallet_balance))
      })
  }, [user, loading])

  if (loading || !user) return null

  // Derive display name and two-letter initials
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Χρήστης'

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const section1 = [
    { icon: User,          label: 'Προφίλ', onClick: () => navigate('/profile/edit') },
    { icon: Heart,         label: 'Αγαπημένα', onClick: () => navigate('/favorites') },
    { icon: MessageCircle, label: 'Μηνύματα',  onClick: () => navigate('/messages') },
    { icon: CalendarDays,  label: 'Τα ραντεβού μου' },
    { icon: ClipboardList, label: 'Φόρμες' },
    { icon: Settings2,     label: 'Ρυθμίσεις' },
  ]

  const section2 = [
    { icon: LifeBuoy, label: 'Υποστήριξη' },
    { icon: Globe,    label: 'Ελληνικά (Κύπρος)' },
  ]

  return (
    <div className="min-h-screen bg-[#F5F0EB] pt-[62px] pb-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5">
        <div>
          <h1 className="text-[22px] font-bold text-[#1C1917] leading-tight tracking-tight">
            {displayName}
          </h1>
          <p className="text-[13px] text-[#A8A29E] mt-0.5">Προσωπικό προφίλ</p>
        </div>

        {/* Avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-[52px] h-[52px] rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[17px]"
            style={{ background: '#C9A882' }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* ── Wallet card ── */}
      <div
        className="mx-5 rounded-2xl p-5 mb-5"
        style={{
          background: 'linear-gradient(135deg, #C9A882 0%, #A0845C 100%)',
          boxShadow: '0 4px 18px rgba(160,132,92,0.30)',
        }}
      >
        <p className="text-[12px] text-white/75 font-medium mb-1 tracking-wide uppercase">
          Υπόλοιπο πορτοφολιού
        </p>
        <p className="text-[38px] font-bold text-white leading-none mb-5">
          {walletBalance.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
        </p>
        <button
          onClick={() => navigate('/wallet')}
          className="px-5 py-[9px] rounded-full text-white text-[13px] font-semibold tracking-wide transition-colors hover:bg-white/10 cursor-pointer"
          style={{ border: '1.5px solid rgba(255,255,255,0.55)', background: 'transparent' }}
        >
          Προβολή πορτοφολιού
        </button>
      </div>

      {/* ── Section 1 ── */}
      <MenuCard items={section1} className="mb-3" />

      {/* ── Section 2 ── */}
      <MenuCard items={section2} className="mb-3" />

      {/* ── Section 3 — Sign out ── */}
      <div
        className="mx-5 bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 1px 8px rgba(28,25,23,0.07)' }}
      >
        <MenuItem
          icon={LogOut}
          label="Αποσύνδεση"
          onClick={handleSignOut}
          danger
          first
        />
      </div>

    </div>
  )
}
