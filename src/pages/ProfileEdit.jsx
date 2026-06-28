import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Home, Briefcase, MoreVertical, Plus, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase/client'

export default function ProfileEdit() {
  const navigate  = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [showSheet, setShowSheet] = useState(false)
  const cameraRef  = useRef(null)
  const libraryRef = useRef(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/', { replace: true }); return }
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data, error }) => {
        if (error) console.error('Profile fetch error:', error)
        setProfile(data)
        setProfileLoading(false)
      })
      .catch(err => {
        console.error('Profile fetch exception:', err)
        setProfileLoading(false)
      })
  }, [user, authLoading, navigate])

  const handleFileSelect = async (file) => {
    setPreviewUrl(URL.createObjectURL(file))
    const filename = `${user.id}.jpg`
    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(filename, file, { upsert: true, contentType: file.type })
    if (uploadErr) { console.error('Avatar upload error:', uploadErr); return }
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filename)
    const uniqueUrl = `${publicUrl}?v=${Date.now()}`
    const { error: upsertErr } = await supabase.from('profiles').upsert(
      { id: user.id, avatar_url: uniqueUrl },
      { onConflict: 'id' }
    )
    if (upsertErr) console.error('Avatar upsert error:', upsertErr)
  }

  if (authLoading || profileLoading) return <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }} />

  // Derived values — prefer profiles table, fall back to auth metadata
  const meta = user.user_metadata || {}
  const authFirst = (meta.full_name || meta.name || '').split(' ')[0]
  const authLast  = (meta.full_name || meta.name || '').split(' ').slice(1).join(' ')
  const firstName  = profile?.first_name || authFirst || ''
  const lastName   = profile?.last_name  || authLast  || ''
  const displayName = [firstName, lastName].filter(Boolean).join(' ')
    || user.email?.split('@')[0] || 'Χρήστης'
  const initials = displayName.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const phone = profile?.phone || ''
  const email = profile?.email || user.email || ''
  const birthDate = profile?.birth_day
    ? `${String(profile.birth_day).padStart(2, '0')}/${String(profile.birth_month).padStart(2, '0')}/${profile.birth_year}`
    : '–'
  const genderMap = { male: 'Άνδρας', female: 'Γυναίκα', other: 'Προτιμώ να μην πω' }
  const gender = profile?.gender ? (genderMap[profile.gender] || '–') : '–'

  const fields = [
    ['Όνομα', firstName || '–'],
    ['Επώνυμο', lastName || '–'],
    ['Αριθμός κινητού', phone || '–'],
    ['Email', email || '–'],
    ['Ημερομηνία γέννησης', birthDate],
    ['Φύλο', gender],
  ]

  const homeAddr = profile?.addresses?.home
  const workAddr = profile?.addresses?.work

  return (
    <div className="min-h-screen pb-10" style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', padding: 0 }}>
          <ArrowLeft className="w-5 h-5 text-[#1C1917] cursor-pointer" />
        </button>
        <h1 className="text-[18px] font-bold text-[#1C1917]">Το προφίλ μου</h1>
      </div>

      {/* Profile card */}
      <div className="mx-5 bg-white rounded-2xl p-5 mb-6" style={{ boxShadow: '0 1px 8px rgba(28,25,23,0.07)' }}>
        <div className="flex justify-end mb-3">
          <button
            onClick={() => navigate('/profile/edit-details')}
            className="text-[14px] font-semibold cursor-pointer"
            style={{ color: '#C9A882', background: 'none', border: 'none' }}
          >
            Επεξεργασία
          </button>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            {previewUrl || profile?.avatar_url ? (
              <img
                src={previewUrl || profile.avatar_url}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: '#C9A882', fontSize: 28 }}
              >
                {initials}
              </div>
            )}
            <button
              onClick={() => setShowSheet(true)}
              className="absolute bottom-0 right-0 w-[26px] h-[26px] bg-white rounded-full flex items-center justify-center cursor-pointer"
              style={{ border: 'none', boxShadow: '0 1px 5px rgba(0,0,0,0.18)' }}
            >
              <Pencil className="w-3 h-3 text-[#78716C]" strokeWidth={1.7} />
            </button>
          </div>
        </div>

        <p className="text-center text-[20px] font-bold text-[#1C1917] mb-4">{displayName}</p>
        <div className="border-t border-[#F0EAE3] mb-4" />

        {/* Fields */}
        <div className="flex flex-col gap-4">
          {fields.map(([label, value]) => (
            <div key={label}>
              <p className="text-[11px] font-bold text-[#1C1917] mb-0.5 uppercase tracking-wider">{label}</p>
              <p className="text-[14px] text-[#A8A29E]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Addresses */}
      <div className="px-5">
        <h2 className="text-[20px] font-bold text-[#1C1917] mb-4">Οι διευθύνσεις μου</h2>

        {/* Home */}
        <div
          className="bg-white rounded-2xl p-4 mb-3 flex items-center gap-3 cursor-pointer"
          style={{ boxShadow: '0 1px 8px rgba(28,25,23,0.07)' }}
          onClick={() => navigate('/profile/address?type=home')}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#EEF2FF' }}>
            <Home className="w-5 h-5" style={{ color: '#818CF8' }} strokeWidth={1.7} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#1C1917]">Σπίτι</p>
            <p className="text-[12px] text-[#A8A29E] truncate">
              {homeAddr ? homeAddr.address : 'Προσθέστε μια διεύθυνση σπιτιού'}
            </p>
          </div>
          <MoreVertical className="w-4 h-4 text-[#C8C0B8] shrink-0" strokeWidth={1.7} />
        </div>

        {/* Work */}
        <div
          className="bg-white rounded-2xl p-4 mb-5 flex items-center gap-3 cursor-pointer"
          style={{ boxShadow: '0 1px 8px rgba(28,25,23,0.07)' }}
          onClick={() => navigate('/profile/address?type=work')}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#F1F5F9' }}>
            <Briefcase className="w-5 h-5 text-[#78716C]" strokeWidth={1.7} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#1C1917]">Εργασία</p>
            <p className="text-[12px] text-[#A8A29E] truncate">
              {workAddr ? workAddr.address : 'Προσθέστε μια διεύθυνση εργασίας'}
            </p>
          </div>
          <MoreVertical className="w-4 h-4 text-[#C8C0B8] shrink-0" strokeWidth={1.7} />
        </div>

        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#D1CAC1] text-[14px] font-semibold text-[#1C1917] cursor-pointer transition-colors hover:bg-[#F8F5F2]"
          style={{ background: 'transparent' }}
        >
          <Plus className="w-4 h-4" strokeWidth={1.7} />
          Προσθήκη
        </button>
      </div>

      {/* Hidden file inputs */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={e => { if (e.target.files[0]) handleFileSelect(e.target.files[0]); e.target.value = '' }} />
      <input ref={libraryRef} type="file" accept="image/*" className="hidden"
        onChange={e => { if (e.target.files[0]) handleFileSelect(e.target.files[0]); e.target.value = '' }} />

      {/* Bottom sheet */}
      {showSheet && (
        <div className="fixed inset-0 z-[500] flex flex-col justify-end">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.40)' }}
            onClick={() => setShowSheet(false)}
          />
          <div className="relative bg-white rounded-t-[24px] pb-10" style={{ zIndex: 1 }}>
            <div className="flex justify-end px-5 pt-5 pb-2">
              <button
                onClick={() => setShowSheet(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
                style={{ background: '#F5F0EB', border: 'none' }}
              >
                <X className="w-4 h-4 text-[#1C1917]" />
              </button>
            </div>
            <button
              onClick={() => { setShowSheet(false); setTimeout(() => cameraRef.current?.click(), 100) }}
              className="w-full text-left px-6 py-4 text-[17px] text-[#1C1917] cursor-pointer hover:bg-[#FDFAF7] transition-colors"
              style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #F5F0EB' }}
            >
              Λήψη φωτογραφίας
            </button>
            <button
              onClick={() => { setShowSheet(false); setTimeout(() => libraryRef.current?.click(), 100) }}
              className="w-full text-left px-6 py-4 text-[17px] text-[#1C1917] cursor-pointer hover:bg-[#FDFAF7] transition-colors"
              style={{ background: 'transparent', border: 'none' }}
            >
              Βιβλιοθήκη φωτογραφιών
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
