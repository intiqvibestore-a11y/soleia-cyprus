import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, Clock, Shield, ChevronLeft, Heart, Share2, Check } from 'lucide-react'
import { useT } from '../context/LanguageContext'

const PROVIDERS = {
  1: {
    name: 'Maria Theodorou',
    title: 'Certified Massage Therapist',
    service: 'Deep Tissue Massage',
    location: 'Limassol, Cyprus',
    rating: 4.9, reviews: 218, price: 65, duration: '60 min', since: '2019',
    bio: 'With over 8 years of experience in therapeutic massage, I specialise in deep tissue, sports recovery, and myofascial release. I trained in Athens and hold certifications from the European Massage Federation. My studio in Limassol is a calm, private space designed for full relaxation.',
    services: [
      { name: 'Deep Tissue Massage', duration: '60 min', price: 65 },
      { name: 'Swedish Relaxation',  duration: '60 min', price: 55 },
      { name: 'Sports Recovery',     duration: '75 min', price: 75 },
      { name: 'Couples Massage',     duration: '90 min', price: 120 },
    ],
    skills: ['Deep Tissue', 'Sports Massage', 'Myofascial Release', 'Trigger Point', 'Hot Stone'],
    reviews_list: [
      { author: 'Sophie R.',  rating: 5, date: 'May 2025',   text: 'Maria is incredible. The deep tissue work completely sorted out my shoulder pain after just two sessions.' },
      { author: 'James T.',   rating: 5, date: 'April 2025', text: "Professional, calm studio and the best massage I've ever had. I've already booked my next appointment." },
      { author: 'Natalia M.', rating: 5, date: 'March 2025', text: 'A regular client here — Maria always listens to what you need and adapts the treatment perfectly.' },
    ],
    bg: 'from-[#E8D5B7] to-[#C9A882]', avatar: 'MT',
  },
  2: {
    name: 'Elena Constantinou',
    title: 'Beauty Artist & Lash Specialist',
    service: 'Full Lash & Brow Set',
    location: 'Nicosia, Cyprus',
    rating: 4.8, reviews: 174, price: 45, duration: '90 min', since: '2021',
    bio: 'Passionate about enhancing natural beauty. I specialise in lash extensions, brow lamination, and microblading. Every client leaves feeling confident and polished. My downtown Nicosia studio is fully equipped with premium products.',
    services: [
      { name: 'Full Lash Set (Classic)', duration: '90 min',  price: 45 },
      { name: 'Full Lash Set (Volume)',  duration: '120 min', price: 65 },
      { name: 'Lash Infills',            duration: '60 min',  price: 30 },
      { name: 'Brow Lamination + Tint',  duration: '60 min',  price: 35 },
    ],
    skills: ['Classic Lashes', 'Volume Lashes', 'Mega Volume', 'Brow Lamination', 'Brow Tinting'],
    reviews_list: [
      { author: 'Anna K.',  rating: 5, date: 'May 2025',   text: 'Elena is an artist. My lashes have never looked this good — so natural yet dramatic.' },
      { author: 'Maria P.', rating: 5, date: 'April 2025', text: "Found Elena on Soleia and I'm so glad I did. Impeccable work and a really lovely studio." },
      { author: 'Claire B.', rating: 4, date: 'March 2025', text: 'Great results and very professional. The booking process was incredibly smooth.' },
    ],
    bg: 'from-[#DDD5CC] to-[#BFB4A8]', avatar: 'EC',
  },
}

const DEFAULT_PROVIDER = PROVIDERS[1]

export default function ProviderProfile() {
  const T = useT()
  const { id } = useParams()
  const provider = PROVIDERS[id] || DEFAULT_PROVIDER

  const guarantees = [T.pp_free_cancel, T.pp_instant_confirm, T.pp_secure_payment]

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse 120% 60% at 70% 0%, #E8D5B7 0%, #F5F0EB 42%, #FDFAF7 80%)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link to="/services" className="inline-flex items-center gap-1.5 text-sm text-[#78716C] hover:text-[#1C1917] transition-colors">
          <ChevronLeft className="w-4 h-4" />
          {T.pp_back}
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          {/* Left column */}
          <div className="lg:col-span-2">
            {/* Cover + avatar */}
            <div className={`relative h-52 sm:h-64 rounded-2xl bg-gradient-to-br ${provider.bg} mb-16`}>
              <div className="absolute -bottom-10 left-6">
                <div className="font-display w-20 h-20 rounded-2xl border-4 border-white bg-gradient-to-br from-[#E8D5B7] to-[#C9A882] flex items-center justify-center text-[#1C1917] font-bold text-xl shadow-lg">
                  {provider.avatar}
                </div>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button aria-label="Save" className="btn-press bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-sm transition-colors">
                  <Heart className="w-4 h-4 text-[#78716C]" />
                </button>
                <button aria-label="Share" className="btn-press bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-sm transition-colors">
                  <Share2 className="w-4 h-4 text-[#78716C]" />
                </button>
              </div>
            </div>

            {/* Name & meta */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1917] mb-1">{provider.name}</h1>
              <p className="text-[#C9A882] font-medium mb-3">{provider.title}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#78716C]">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-[#1C1917]">{provider.rating}</span>
                  <span>({provider.reviews} {T.pp_reviews.toLowerCase()})</span>
                </span>
                <span className="text-[#E8E0D8]">|</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-[#A8A29E]" />{provider.location}</span>
                <span className="text-[#E8E0D8]">|</span>
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  {T.pp_verified_since} {provider.since}
                </span>
              </div>
            </div>

            {/* About */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#1C1917] mb-3">{T.pp_about}</h2>
              <p className="text-[#78716C] leading-relaxed">{provider.bio}</p>
            </div>

            {/* Skills */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#1C1917] mb-3">{T.pp_specialisations}</h2>
              <div className="flex flex-wrap gap-2">
                {provider.skills.map(s => (
                  <span key={s} className="bg-[#F5F0EB] text-[#78716C] text-sm font-medium px-3 py-1.5 rounded-full border border-[#E8E0D8]">{s}</span>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-[#1C1917] mb-4">{T.pp_services_pricing}</h2>
              <div className="space-y-3">
                {provider.services.map(s => (
                  <div key={s.name} className="card-lift flex items-center justify-between bg-[#FDFAF7] hover:bg-[#F5F0EB] border border-[#F0EAE3] rounded-xl px-5 py-4 transition-colors duration-200">
                    <div>
                      <p className="font-semibold text-[#1C1917] text-sm">{s.name}</p>
                      <p className="text-xs text-[#A8A29E] flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {s.duration}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[#1C1917]">€{s.price}</span>
                      <Link to={`/book/${id}`} className="btn-press bg-[#1C1917] hover:bg-[#3D3530] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-200">
                        {T.pp_book_btn}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#1C1917]">
                  {T.pp_reviews} <span className="text-[#A8A29E] font-normal">({provider.reviews})</span>
                </h2>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-[#1C1917]">{provider.rating}</span>
                </div>
              </div>
              <div className="space-y-4">
                {provider.reviews_list.map(r => (
                  <div key={r.author} className="border border-[#F0EAE3] rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E8D5B7] to-[#C9A882] flex items-center justify-center text-[#1C1917] text-sm font-bold">
                          {r.author[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#1C1917]">{r.author}</p>
                          <p className="text-xs text-[#A8A29E]">{r.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                      </div>
                    </div>
                    <p className="text-sm text-[#78716C] leading-relaxed">"{r.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-white border border-[#E8E0D8] rounded-2xl shadow-lg p-6">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-[#1C1917]">€{provider.price}</span>
                  <span className="text-[#A8A29E] text-sm">{T.pp_per_session}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-[#78716C] mb-5">
                  <Clock className="w-4 h-4" />
                  <span>{provider.duration}</span>
                  <span className="mx-1 text-[#E8E0D8]">·</span>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-[#1C1917]">{provider.rating}</span>
                  <span>({provider.reviews})</span>
                </div>
                <Link to={`/book/${id}`} className="btn-press block w-full bg-[#1C1917] hover:bg-[#3D3530] text-white font-semibold text-center py-3.5 rounded-xl transition-colors duration-200 mb-3">
                  {T.pp_book_now}
                </Link>
                <button className="btn-press w-full border border-[#E8E0D8] hover:border-[#C9A882] text-[#78716C] hover:text-[#C9A882] font-medium py-3 rounded-xl transition-colors duration-200 text-sm">
                  {T.pp_send_message}
                </button>
                <div className="mt-5 space-y-2.5">
                  {guarantees.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-[#78716C]">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />{f}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#A8A29E] text-center mt-4">{T.pp_not_charged}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile book bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 px-4 pt-3 pb-5 bg-white border-t border-[#F0EAE3] flex gap-3 safe-area-inset-bottom">
          <div className="flex-1">
            <p className="text-xs text-[#78716C]">{T.pp_starting_from}</p>
            <p className="font-bold text-[#1C1917]">€{provider.price} <span className="text-[#A8A29E] text-sm font-normal">{T.pp_per_session}</span></p>
          </div>
          <Link to={`/book/${id}`} className="btn-press bg-[#1C1917] hover:bg-[#3D3530] text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200">
            {T.pp_book_now}
          </Link>
        </div>
      </div>
    </div>
  )
}
