import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Star, Heart, ChevronRight, ChevronLeft, Shield, Clock } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import { useT } from '../context/LanguageContext'
import { supabase } from '../utils/supabase/client'

const FALLBACK_GRADIENTS = [
  'from-[#E8D5B7] to-[#C9A882]',
  'from-[#F2E3D9] to-[#DBBAA8]',
  'from-[#DDD5CC] to-[#BFB4A8]',
  'from-[#D5E0D5] to-[#A8BEA8]',
  'from-[#E8D9D5] to-[#C9AFA8]',
  'from-[#D9E0E8] to-[#A8B5C9]',
]

const NEW_PROVIDERS = [
  { id: 7,  name: 'Olea Nail Studio',      category: 'Nail Salon',   location: 'Limassol, Potamos',       rating: 5.0, reviews: 12,  bg: 'from-[#EDE4D8] to-[#D4C3AE]' },
  { id: 8,  name: 'Aphrodite Hair',        category: 'Hair Salon',   location: 'Nicosia, Makedonitissa',  rating: 4.9, reviews: 8,   bg: 'from-[#E0D5C5] to-[#C5B49A]' },
  { id: 9,  name: 'Solstice Yoga',         category: 'Yoga Studio',  location: 'Paphos, Coral Bay',       rating: 5.0, reviews: 5,   bg: 'from-[#D8E4D8] to-[#B4CAB4]' },
  { id: 10, name: 'Prestige Skin Clinic',  category: 'Skin Care',    location: 'Limassol, Mesa Geitonia', rating: 4.8, reviews: 21,  bg: 'from-[#ECDAD0] to-[#D4B5A5]' },
  { id: 11, name: 'The Brow Bar',          category: 'Beauty Salon', location: 'Nicosia, Acropolis',      rating: 5.0, reviews: 17,  bg: 'from-[#E8DCE0] to-[#D0BBBF]' },
]

const WHY_ICONS = [Shield, Clock, Star]

// Card for real Supabase businesses
function BusinessCard({ business, index }) {
  const gradient = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length]
  return (
    <Link to={`/business/${business.id}`} className="shrink-0 w-[180px] sm:w-[220px] group" style={{ textDecoration: 'none' }}>
      <div className="relative rounded-2xl overflow-hidden mb-3" style={{ aspectRatio: '1 / 1' }}>
        {business.cover_url ? (
          <img
            src={business.cover_url}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} transition-transform duration-300 group-hover:scale-105`} />
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-[#1C1917] text-sm leading-tight">{business.name}</h3>
        {business.rating != null && (
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-[#1C1917]">{Number(business.rating).toFixed(1)}</span>
          </div>
        )}
      </div>
      {business.city && <p className="text-sm text-[#78716C] mt-0.5 leading-tight">{business.city}</p>}
      {business.category && <p className="text-sm text-[#78716C]">{business.category}</p>}
    </Link>
  )
}

// Card for hardcoded demo data (links to /providers/:id)
function ProviderCard({ provider }) {
  const T = useT()
  return (
    <Link to={`/providers/${provider.id}`} className="card-lift shrink-0 w-[180px] sm:w-[220px] group">
      <div className="relative rounded-2xl overflow-hidden mb-3" style={{ aspectRatio: '1 / 1' }}>
        <div className={`w-full h-full bg-gradient-to-br ${provider.bg} transition-transform duration-300 group-hover:scale-105`} />
        <button
          aria-label="Save"
          onClick={e => e.preventDefault()}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-colors duration-150"
        >
          <Heart className="w-4 h-4 text-[#78716C]" />
        </button>
      </div>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-[#1C1917] text-sm leading-tight">{provider.name}</h3>
        <div className="flex items-center gap-1 shrink-0">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-[#1C1917]">{provider.rating.toFixed(1)}</span>
        </div>
      </div>
      <p className="text-sm text-[#78716C] mt-0.5 leading-tight">{provider.location}</p>
      <p className="text-sm text-[#78716C]">{provider.category} &middot; {provider.reviews.toLocaleString()} {T.home_reviews}</p>
    </Link>
  )
}

function ScrollRow({ children, label }) {
  const ref = useRef(null)
  const scroll = (dir) => { if (ref.current) ref.current.scrollBy({ left: dir * 280, behavior: 'smooth' }) }
  return (
    <section className="py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="font-display font-medium text-xl sm:text-3xl text-[#1C1917]">{label}</h2>
          <div className="hidden sm:flex gap-2">
            <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-full border border-[#E8E0D8] flex items-center justify-center hover:border-[#C9A882] hover:text-[#C9A882] transition-colors cursor-pointer text-[#78716C]" aria-label="Scroll left">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll(1)} className="w-9 h-9 rounded-full border border-[#E8E0D8] flex items-center justify-center hover:border-[#C9A882] hover:text-[#C9A882] transition-colors cursor-pointer text-[#78716C]" aria-label="Scroll right">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div ref={ref} className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {children}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const T = useT()
  const [businesses, setBusinesses] = useState([])

  useEffect(() => {
    supabase.from('businesses').select('*').limit(10).then(({ data }) => {
      if (data?.length) setBusinesses(data)
    })
  }, [])

  return (
    <>
      <section>
        <div
          className="relative flex flex-col items-center justify-center text-center px-4 sm:px-5 py-12 sm:py-24"
          style={{ background: 'radial-gradient(ellipse 80% 100% at 75% 40%, #E8D5B7 0%, #F5F0EB 45%, #FDFAF7 100%)' }}
        >
          <h1
            className="font-display font-medium text-4xl sm:text-5xl lg:text-[58px] text-[#1C1917] mb-4 leading-tight max-w-2xl fade-up delay-0"
            style={{ letterSpacing: '-0.02em' }}
          >
            {T.home_hero_title}
          </h1>
          <p className="text-[#78716C] text-base sm:text-lg mb-8 max-w-xl leading-relaxed fade-up delay-1">
            {T.home_hero_sub}
          </p>

          <div className="w-full fade-up delay-2 relative z-[100]">
            <SearchBar />
          </div>

          <p className="text-sm text-[#78716C] mt-5 fade-in delay-3">
            <span className="font-semibold text-[#1C1917]">{T.home_stats_count}</span>{' '}
            {T.home_stats_label}&nbsp;·&nbsp;{T.home_stats_area}
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-4 fade-in delay-4">
            {T.home_popular_searches.map((s, i) => (
              <Link
                key={i}
                to={`/services?q=${encodeURIComponent(s)}`}
                className="btn-press bg-white/70 hover:bg-white border border-[#E8E0D8] text-[#78716C] hover:text-[#1C1917] text-xs px-3.5 py-1.5 rounded-full transition-all duration-150"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-white">
        {/* Προτεινόμενα — real Supabase data */}
        <ScrollRow label={T.home_recommended}>
          {businesses.map((b, i) => (
            <BusinessCard key={b.id} business={b} index={i} />
          ))}
        </ScrollRow>

        <div className="max-w-7xl mx-auto px-5 sm:px-8"><hr className="border-[#F0EAE3]" /></div>

        {/* Νέα — hardcoded demo */}
        <ScrollRow label={T.home_new}>
          {NEW_PROVIDERS.map(p => <ProviderCard key={p.id} provider={p} />)}
        </ScrollRow>

        <div className="max-w-7xl mx-auto px-5 sm:px-8"><hr className="border-[#F0EAE3]" /></div>
      </div>

      <section className="bg-[#F5F0EB] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {T.home_why.map(({ title, desc }, i) => {
              const Icon = WHY_ICONS[i]
              return (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#C9A882]/15 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#C9A882]" strokeWidth={1.8} />
                  </div>
                  <h3 className="font-display font-medium text-lg text-[#1C1917] mb-1">{title}</h3>
                  <p className="text-sm text-[#78716C] leading-relaxed max-w-xs">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-8 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="bg-[#1C1917] rounded-2xl sm:rounded-3xl px-6 sm:px-16 py-10 sm:py-14 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 text-center sm:text-left">
            <div>
              <p className="text-[#C9A882] text-xs font-semibold uppercase tracking-widest mb-3">{T.home_cta_tag}</p>
              <h2 className="font-display-italic text-3xl sm:text-4xl text-white mb-2">
                {T.home_cta_title[0]}<br />{T.home_cta_title[1]}
              </h2>
              <p className="text-white/60 text-sm leading-relaxed max-w-md">{T.home_cta_sub}</p>
            </div>
            <button className="btn-press shrink-0 bg-[#C9A882] hover:bg-[#A8845E] text-white font-semibold px-8 py-3.5 rounded-full transition-colors duration-200 text-sm whitespace-nowrap">
              {T.home_cta_btn}
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
