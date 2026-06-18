import { useState, useEffect, useRef } from 'react'
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
      <rect x="0" y="0" width="62" height="54" rx="18" fill="url(#msgA)" />
      <path d="M8 54 L4 68 L24 60 Z" fill="url(#msgA)" />
      <rect x="38" y="22" width="58" height="50" rx="16" fill="url(#msgB)" />
      <path d="M84 72 L92 84 L68 78 Z" fill="url(#msgB)" />
    </svg>
  )
}

export default function Messages() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown when clicking/tapping outside it
  useEffect(() => {
    if (!menuOpen) return
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-[#F5F0EB] pt-[62px]">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[#EDE8E2] cursor-pointer"
          style={{ background: 'none', border: 'none' }}
          aria-label="Πίσω"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
        </button>

        {/* Three-dot menu with dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[#EDE8E2] cursor-pointer"
            style={{ background: 'none', border: 'none' }}
            aria-label="Επιλογές"
          >
            <MoreVertical className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-11 z-[100] rounded-xl overflow-hidden"
              style={{
                background: 'white',
                minWidth: 188,
                boxShadow: '0 4px 20px rgba(28,25,23,0.12), 0 1px 4px rgba(28,25,23,0.06)',
                border: '1px solid rgba(201,168,130,0.18)',
              }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/messages/archived')
                }}
                className="w-full text-left px-4 py-3.5 text-[15px] cursor-pointer transition-colors hover:bg-[#FAF6F1]"
                style={{ background: 'none', border: 'none', color: '#1C1917' }}
              >
                Αρχειοθετημένες
              </button>
            </div>
          )}
        </div>
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
