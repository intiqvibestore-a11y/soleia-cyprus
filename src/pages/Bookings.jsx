import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { useT } from '../context/LanguageContext'

export default function Bookings() {
  const T = useT()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center" style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }}>
      <div className="w-16 h-16 rounded-full bg-[#C9A882]/12 flex items-center justify-center">
        <Calendar className="w-7 h-7 text-[#C9A882]" strokeWidth={1.6} />
      </div>
      <div>
        <h1 className="font-display text-2xl text-[#1C1917] mb-2">{T.bk_title}</h1>
        <p className="text-[#78716C] text-sm leading-relaxed max-w-xs">{T.bk_desc}</p>
      </div>
      <Link
        to="/services"
        className="mt-2 px-6 py-3 rounded-full text-sm font-medium text-white cursor-pointer"
        style={{ background: '#C9A882' }}
      >
        {T.bk_browse_btn}
      </Link>
    </div>
  )
}
