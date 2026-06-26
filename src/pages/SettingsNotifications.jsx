import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase/client'

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
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

function NotifRow({ label, value, onChange, first = false }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-[15px]"
      style={{ borderTop: first ? 'none' : '1px solid #F0EBE5' }}
    >
      <span className="text-[15px] font-medium" style={{ color: '#1C1917' }}>{label}</span>
      <Toggle value={value} onChange={onChange} />
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="mb-5">
      <p
        className="px-5 mb-2 text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: '#A8A29E' }}
      >
        {title}
      </p>
      <div
        className="mx-5 bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 1px 8px rgba(28,25,23,0.07)' }}
      >
        {children}
      </div>
    </div>
  )
}

const DEFAULTS = {
  notif_appointment_sms: true,
  notif_appointment_whatsapp: true,
  notif_marketing_email: true,
  notif_marketing_sms: true,
  notif_marketing_whatsapp: true,
}

export default function SettingsNotifications() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [prefs, setPrefs] = useState(DEFAULTS)

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('notif_appointment_sms,notif_appointment_whatsapp,notif_marketing_email,notif_marketing_sms,notif_marketing_whatsapp')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setPrefs({
            notif_appointment_sms:       data.notif_appointment_sms       ?? true,
            notif_appointment_whatsapp:  data.notif_appointment_whatsapp  ?? true,
            notif_marketing_email:       data.notif_marketing_email       ?? true,
            notif_marketing_sms:         data.notif_marketing_sms         ?? true,
            notif_marketing_whatsapp:    data.notif_marketing_whatsapp    ?? true,
          })
        }
      })
  }, [user])

  const handleToggle = async (field, value) => {
    setPrefs(p => ({ ...p, [field]: value }))
    if (user) {
      await supabase.from('profiles').update({ [field]: value }).eq('id', user.id)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB] pt-[62px]">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-5">
        <button
          onClick={() => navigate('/settings')}
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer"
          style={{ background: 'none', border: 'none' }}
          aria-label="Πίσω"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
        </button>
        <h1 className="text-[19px] font-bold leading-tight" style={{ color: '#3D2B1F' }}>
          Ρυθμίσεις ειδοποιήσεων
        </h1>
      </div>

      {/* Appointment notifications */}
      <SectionCard title="Ειδοποιήσεις ραντεβού">
        <NotifRow
          label="SMS"
          value={prefs.notif_appointment_sms}
          onChange={v => handleToggle('notif_appointment_sms', v)}
          first
        />
        <NotifRow
          label="WhatsApp"
          value={prefs.notif_appointment_whatsapp}
          onChange={v => handleToggle('notif_appointment_whatsapp', v)}
        />
      </SectionCard>

      {/* Marketing notifications */}
      <SectionCard title="Ειδοποιήσεις μάρκετινγκ">
        <NotifRow
          label="Email"
          value={prefs.notif_marketing_email}
          onChange={v => handleToggle('notif_marketing_email', v)}
          first
        />
        <NotifRow
          label="SMS"
          value={prefs.notif_marketing_sms}
          onChange={v => handleToggle('notif_marketing_sms', v)}
        />
        <NotifRow
          label="WhatsApp"
          value={prefs.notif_marketing_whatsapp}
          onChange={v => handleToggle('notif_marketing_whatsapp', v)}
        />
      </SectionCard>

      {/* Disclaimer */}
      <p className="px-5 text-[12px] leading-relaxed" style={{ color: '#A8A29E' }}>
        Εάν έχετε προηγουμένως εξαιρεθεί από τη λήψη γραπτών μηνυμάτων στέλνοντας μήνυμα STOP,
        απαντήστε με START για να ενεργοποιήσετε ξανά τη συμμετοχή σας.
      </p>
    </div>
  )
}
