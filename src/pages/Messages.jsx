import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreVertical } from 'lucide-react'

function ChatIllustration() {
  return (
    <svg width="96" height="88" viewBox="0 0 96 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="msgA" x1="0" y1="0" x2="60" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8D5B0" />
          <stop offset="1" stopColor="#C9A96E" />
        </linearGradient>
        <linearGradient id="msgB" x1="36" y1="18" x2="96" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C9A96E" />
          <stop offset="1" stopColor="#9B7540" />
        </linearGradient>
      </defs>

      {/* Main (left) bubble */}
      <rect x="0" y="0" width="62" height="54" rx="18" fill="url(#msgA)" />
      {/* Tail */}
      <path d="M8 54 L4 68 L24 60 Z" fill="url(#msgA)" />

      {/* Secondary (right) bubble — slightly overlapping */}
      <rect x="38" y="22" width="58" height="50" rx="16" fill="url(#msgB)" />
      {/* Tail */}
      <path d="M84 72 L92 84 L68 78 Z" fill="url(#msgB)" />
    </svg>
  )
}

export default function Messages() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white pt-[62px]">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[#F5F0EB] cursor-pointer"
          style={{ background: 'none', border: 'none' }}
          aria-label="Πίσω"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
        </button>

        <button
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[#F5F0EB] cursor-pointer"
          style={{ background: 'none', border: 'none' }}
          aria-label="Επιλογές"
        >
          <MoreVertical className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
        </button>
      </div>

      {/* ── Title ── */}
      <h1 className="text-[28px] font-bold px-5 pb-2" style={{ color: '#1C1917' }}>
        Μηνύματα
      </h1>

      {/* ── Empty state ── */}
      <div className="flex flex-col items-center justify-center px-8" style={{ paddingTop: '20vh' }}>
        <ChatIllustration />

        <p className="text-[18px] font-bold mt-6 text-center" style={{ color: '#1C1917' }}>
          Δεν υπάρχουν ακόμη μηνύματα
        </p>
        <p className="text-[14px] mt-2 text-center leading-relaxed" style={{ color: '#A8A29E' }}>
          Τα μηνύματα με καταστήματα θα εμφανίζονται εδώ
        </p>
      </div>

    </div>
  )
}
