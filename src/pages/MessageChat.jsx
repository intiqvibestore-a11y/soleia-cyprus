import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreVertical, Archive, BellOff, ArrowUp, Plus } from 'lucide-react'

const DEMO_BUSINESSES = {
  'wow-mymall': {
    name: 'Wow Beauty Lab MYMALL',
    image: 'https://images.unsplash.com/photo-1560066984-138daaa0ad8b?w=80&q=80',
  },
}

const INITIAL_MESSAGES = [
  {
    id: '1',
    text: 'Η κράτησή μου ακυρώθηκε λανθασμένα. Θα ήθελα να κλείσω νέο ραντεβού.',
    sender: 'user',
    time: '10:58 μ.μ.',
    date: 'Τετ 17 Ιουν 2026',
  },
]

export default function MessageChat() {
  const { businessId } = useParams()
  const navigate = useNavigate()
  const business = DEMO_BUSINESSES[businessId] ?? {
    name: businessId ?? 'Επιχείρηση',
    image: 'https://images.unsplash.com/photo-1560066984-138daaa0ad8b?w=80&q=80',
  }

  const [messages, setMessages]   = useState(INITIAL_MESSAGES)
  const [text, setText]           = useState('')
  const [menuOpen, setMenuOpen]   = useState(false)
  const menuRef   = useRef(null)
  const messagesEnd = useRef(null)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [menuOpen])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!text.trim()) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: text.trim(),
        sender: 'user',
        time: timeStr,
        date: null, // no new separator for user sends
      },
    ])
    setText('')
  }

  // Group messages by date for rendering separators
  const renderedMessages = messages.reduce((acc, msg) => {
    if (msg.date) acc.push({ type: 'date', label: msg.date, id: `date-${msg.id}` })
    acc.push({ type: 'message', ...msg })
    return acc
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex flex-col">

      {/* ── Sticky header ── */}
      <div
        className="sticky top-[62px] z-[200] flex items-center justify-between px-4 py-3 border-b"
        style={{ background: '#F5F0EB', borderColor: 'rgba(201,168,130,0.22)' }}
      >
        {/* Back + business info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer flex-shrink-0"
            style={{ background: 'none', border: 'none' }}
            aria-label="Πίσω"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
          </button>

          <img
            src={business.image}
            alt={business.name}
            className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
          />
          <span
            className="text-[16px] font-bold truncate"
            style={{ color: '#1C1917' }}
          >
            {business.name}
          </span>
        </div>

        {/* Three-dot menu */}
        <div className="relative flex-shrink-0 ml-2" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer"
            style={{ background: 'none', border: 'none' }}
            aria-label="Επιλογές"
          >
            <MoreVertical className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-11 z-[300] rounded-2xl overflow-hidden"
              style={{
                background: '#FDFAF7',
                minWidth: 210,
                boxShadow: '0 6px 24px rgba(28,25,23,0.14)',
                border: '1px solid rgba(201,168,130,0.2)',
              }}
            >
              <button
                onClick={() => { setMenuOpen(false); navigate('/messages') }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer transition-colors hover:bg-[#F5F0EB]"
                style={{ background: 'none', border: 'none', color: '#1C1917' }}
              >
                <Archive className="w-4 h-4 flex-shrink-0" style={{ color: '#78716C' }} strokeWidth={1.7} />
                <span className="text-[15px]">Κατάργηση</span>
              </button>
              <div style={{ height: 1, background: 'rgba(201,168,130,0.15)' }} />
              <button
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer transition-colors hover:bg-[#F5F0EB]"
                style={{ background: 'none', border: 'none', color: '#1C1917' }}
              >
                <BellOff className="w-4 h-4 flex-shrink-0" style={{ color: '#78716C' }} strokeWidth={1.7} />
                <span className="text-[15px]">Σίγαση συνομιλίας</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Messages area ── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ paddingBottom: '130px' }}
      >
        {renderedMessages.map(item => {
          if (item.type === 'date') {
            return (
              <div key={item.id} className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: 'rgba(61,43,31,0.12)' }} />
                <span className="text-[12px] font-semibold" style={{ color: '#A8A29E', letterSpacing: '0.01em' }}>
                  {item.label}
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(61,43,31,0.12)' }} />
              </div>
            )
          }

          const isUser = item.sender === 'user'
          return (
            <div
              key={item.id}
              className={`flex flex-col mb-3 ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className="max-w-[75%] px-4 py-3 rounded-2xl"
                style={isUser
                  ? {
                      background: '#C9A882',
                      borderBottomRightRadius: 6,
                    }
                  : {
                      background: 'rgba(237,229,216,0.9)',
                      borderBottomLeftRadius: 6,
                    }
                }
              >
                <p className="text-[15px] leading-relaxed" style={{ color: isUser ? 'white' : '#1C1917' }}>
                  {item.text}
                </p>
              </div>
              <p className="text-[11px] mt-1 px-1" style={{ color: '#A8A29E' }}>
                {item.time}{isUser && ' ✓'}
              </p>
            </div>
          )
        })}
        <div ref={messagesEnd} />
      </div>

      {/* ── Input bar — fixed above BottomNav ── */}
      <div
        className="fixed left-0 right-0 z-[350] border-t"
        style={{
          bottom: 'calc(62px + max(10px, env(safe-area-inset-bottom)))',
          background: '#F5F0EB',
          borderColor: 'rgba(201,168,130,0.22)',
        }}
      >
        <div className="flex items-end gap-2 px-4 py-3">
          {/* Attachment button */}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 cursor-pointer transition-colors hover:bg-[#EDE5D8]"
            style={{ background: 'none', border: 'none' }}
            aria-label="Προσθήκη"
          >
            <Plus className="w-5 h-5" style={{ color: '#3D2B1F' }} strokeWidth={2} />
          </button>

          {/* Text input */}
          <div
            className="flex-1 rounded-2xl px-4 py-2.5"
            style={{
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(201,168,130,0.3)',
              minHeight: 40,
            }}
          >
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
              }}
              placeholder="Πληκτρολογήστε ένα μήνυμα"
              rows={1}
              className="w-full bg-transparent resize-none outline-none text-[15px] leading-relaxed"
              style={{ color: '#1C1917', maxHeight: 100 }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-all"
            style={{
              background: text.trim() ? '#3D2B1F' : 'rgba(61,43,31,0.18)',
              border: 'none',
            }}
            aria-label="Αποστολή"
          >
            <ArrowUp className="w-4 h-4 text-white" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  )
}
