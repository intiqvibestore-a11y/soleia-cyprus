import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function FormIllustration() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="formGrad" x1="8" y1="8" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8D5B0" />
          <stop offset="1" stopColor="#C9A96E" />
        </linearGradient>
      </defs>
      {/* Card body */}
      <rect x="10" y="6" width="52" height="60" rx="12" fill="url(#formGrad)" opacity="0.2" />
      <rect x="10" y="6" width="52" height="60" rx="12" stroke="url(#formGrad)" strokeWidth="2.5" />
      {/* Header stripe */}
      <rect x="10" y="6" width="52" height="20" rx="12" fill="url(#formGrad)" opacity="0.45" />
      <rect x="10" y="17" width="52" height="9" fill="url(#formGrad)" opacity="0.45" />
      {/* Lines */}
      <line x1="20" y1="36" x2="52" y2="36" stroke="url(#formGrad)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="20" y1="46" x2="52" y2="46" stroke="url(#formGrad)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="20" y1="56" x2="40" y2="56" stroke="url(#formGrad)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default function Forms() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }}>

      {/* Header */}
      <div className="flex items-center px-4 py-3">
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[#EDE8E2] cursor-pointer"
          style={{ background: 'none', border: 'none' }}
          aria-label="Πίσω"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
        </button>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center px-8 text-center" style={{ paddingTop: '18vh' }}>
        <FormIllustration />
        <p className="text-[20px] font-bold mt-6" style={{ color: '#3D2B1F' }}>
          Κανένα έντυπο
        </p>
        <p className="text-[14px] mt-2 leading-relaxed max-w-xs" style={{ color: '#A8A29E' }}>
          Δεν σας έχει ζητηθεί ακόμη να συμπληρώσετε κάποια φόρμα.
        </p>
      </div>

    </div>
  )
}
