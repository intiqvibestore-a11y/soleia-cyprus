import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Share2, Bell, Globe, KeyRound,
  ArrowUpRight, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase/client'

function SettingRow({ icon: Icon, label, onClick, external = false, first = false }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-[15px] text-left transition-colors hover:bg-[#F5F0EB] cursor-pointer"
      style={{
        background: 'transparent',
        border: 'none',
        borderTop: first ? 'none' : '1px solid #F0EBE5',
      }}
    >
      <Icon className="w-5 h-5 shrink-0" style={{ color: '#78716C' }} strokeWidth={1.7} />
      <span className="flex-1 text-[15px] font-medium" style={{ color: '#1C1917' }}>{label}</span>
      {external
        ? <ArrowUpRight className="w-4 h-4 shrink-0" style={{ color: '#D1CAC1' }} strokeWidth={1.7} />
        : <ChevronRight className="w-4 h-4 shrink-0" style={{ color: '#D1CAC1' }} strokeWidth={1.7} />
      }
    </button>
  )
}

function DeleteModal({ onClose, onConfirm, loading }) {
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
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: '#D1CAC1' }} />
        <h2 className="text-[20px] font-bold mb-3" style={{ color: '#3D2B1F' }}>
          Διαγραφή λογαριασμού
        </h2>
        <p className="text-[14px] leading-relaxed mb-7" style={{ color: '#78716C' }}>
          Είστε σίγουροι ότι θέλετε να διαγράψετε μόνιμα τον λογαριασμό σας; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
        </p>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="w-full py-[14px] rounded-full font-semibold text-[15px] mb-3 cursor-pointer"
          style={{ background: '#EF4444', color: 'white', border: 'none', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Διαγραφή...' : 'Ναι, διαγραφή λογαριασμού'}
        </button>
        <button
          onClick={onClose}
          className="w-full py-[14px] rounded-full font-semibold text-[15px] cursor-pointer"
          style={{ background: 'transparent', border: '1.5px solid #D1CAC1', color: '#3D2B1F' }}
        >
          Ακύρωση
        </button>
      </div>
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [showDelete, setShowDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const openLanguageSettings = () => {
    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/.test(ua)) {
      window.location.href = 'app-settings:'
    } else if (/Android/.test(ua)) {
      window.location.href = 'intent:#Intent;action=android.settings.LOCALE_SETTINGS;end'
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    const { error } = await supabase.rpc('delete_user')
    if (!error) {
      await signOut()
      navigate('/')
    }
    setDeleteLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB]">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer"
          style={{ background: 'none', border: 'none' }}
          aria-label="Πίσω"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
        </button>
        <h1 className="text-[22px] font-bold" style={{ color: '#3D2B1F' }}>Ρυθμίσεις</h1>
      </div>

      {/* Menu card */}
      <div
        className="mx-5 bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 1px 8px rgba(28,25,23,0.07)' }}
      >
        <SettingRow icon={Share2}      label="Στοιχεία σύνδεσης στα socials" onClick={() => navigate('/settings/social')}          first />
        <SettingRow icon={Bell}        label="Ειδοποιήσεις"                  onClick={() => navigate('/settings/notifications')} />
        <SettingRow icon={Globe}       label="Γλώσσα"                        onClick={openLanguageSettings} />
        <SettingRow icon={KeyRound}    label="Αλλαγή κωδικού πρόσβασης"     onClick={() => navigate('/settings/change-password')} />
        <SettingRow icon={ArrowUpRight} label="Πολιτική απορρήτου"           onClick={() => navigate('/privacy')}          external />
        <SettingRow icon={ArrowUpRight} label="Όροι παροχής υπηρεσιών"      onClick={() => navigate('/terms/services')}   external />
        <SettingRow icon={ArrowUpRight} label="Όροι χρήσης"                 onClick={() => navigate('/terms')}            external />
      </div>

      {/* Delete account */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => setShowDelete(true)}
          className="px-8 py-[11px] rounded-full text-[14px] font-semibold cursor-pointer transition-colors hover:bg-red-50"
          style={{ border: '1.5px solid #EF4444', background: 'transparent', color: '#EF4444' }}
        >
          Διαγραφή λογαριασμού
        </button>
      </div>

      {/* Version */}
      <p className="text-center text-[12px] mt-6" style={{ color: '#A8A29E' }}>
        Έκδοση εφαρμογής 1.0.0
      </p>

      {showDelete && (
        <DeleteModal
          onClose={() => setShowDelete(false)}
          onConfirm={handleDeleteAccount}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
