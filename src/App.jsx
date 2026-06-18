import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Cursor from './components/Cursor'
import BottomNav from './components/BottomNav'
import SearchModal from './components/SearchModal'
import SearchPage from './pages/SearchPage'
import AuthCallback from './pages/AuthCallback'
import Home from './pages/Home'
import Services from './pages/Services'
import ProviderProfile from './pages/ProviderProfile'
import Booking from './pages/Booking'
import Bookings from './pages/Bookings'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import ProfileEdit from './pages/ProfileEdit'
import ProfileEditDetails from './pages/ProfileEditDetails'
import ProfileAddress from './pages/ProfileAddress'
import Wallet from './pages/Wallet'
import WalletAddCard from './pages/WalletAddCard'
import Messages from './pages/Messages'
import { SearchProvider, useSearchModal } from './context/SearchContext'

// ── Splash screen ─────────────────────────────────────────────────────────────

function SoleiaLogoSplash({ size = 80 }) {
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 46 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 28C10 20.82 15.59 15 23 15C30.41 15 36 20.82 36 28" stroke="#C9A882" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M7 31.5Q14.5 27.5 23 31.5Q31.5 35.5 39 31.5" stroke="#C9A882" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <line x1="23" y1="12" x2="23" y2="6.5"   stroke="#C9A882" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="31.5" y1="14.5" x2="34.5" y2="10.5" stroke="#C9A882" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="14.5" y1="14.5" x2="11.5" y2="10.5" stroke="#C9A882" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="37.5" y1="20.5" x2="41.5" y2="18"   stroke="#C9A882" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="8.5"  y1="20.5" x2="4.5"  y2="18"   stroke="#C9A882" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="39.5" y1="26.5" x2="43.5" y2="25.5"  stroke="#C9A882" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="6.5"  y1="26.5" x2="2.5"  y2="25.5"  stroke="#C9A882" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('in') // 'in' | 'out'

  useEffect(() => {
    // After fade-in (0.8s) + hold (1.5s) = 2.3s, start spin + fade-out
    const t1 = setTimeout(() => setPhase('out'), 2300)
    // After fade-out (0.5s), signal done
    const t2 = setTimeout(onDone, 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: '#F5F0EB' }}
      animate={{ opacity: phase === 'out' ? 0 : 1 }}
      transition={{ duration: phase === 'out' ? 0.5 : 0, ease: 'easeInOut' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
        style={{ gap: 14 }}
      >
        {/* Logo — spins as screen fades out */}
        <motion.div
          animate={phase === 'out' ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <SoleiaLogoSplash size={160} />
        </motion.div>

        {/* Tagline */}
        <p
          className="text-[12px] font-medium"
          style={{ color: '#C9A882', letterSpacing: '0.14em' }}
        >
          DISCOVER. BOOK. GLOW.
        </p>
      </motion.div>
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppContent() {
  const { open } = useSearchModal()
  const { pathname } = useLocation()
  const [showSplash, setShowSplash] = useState(pathname !== '/auth/callback')

  // OAuth callback runs in a popup — render standalone without nav/footer
  if (pathname === '/auth/callback') {
    return <AuthCallback />
  }

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <Cursor />
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <Navbar />
        {/* pb-24 so content never hides behind the fixed BottomNav */}
        <main className="flex-1 pb-24">
          <Routes>
            <Route path="/"                element={<Home />} />
            <Route path="/services"        element={<Services />} />
            <Route path="/search"          element={<SearchPage />} />
            <Route path="/providers/:id"   element={<ProviderProfile />} />
            <Route path="/book/:serviceId" element={<Booking />} />
            <Route path="/bookings"        element={<Bookings />} />
            <Route path="/favorites"            element={<Favorites />} />
            <Route path="/profile"              element={<Profile />} />
            <Route path="/profile/edit"         element={<ProfileEdit />} />
            <Route path="/profile/edit-details" element={<ProfileEditDetails />} />
            <Route path="/profile/address"      element={<ProfileAddress />} />
            <Route path="/wallet"              element={<Wallet />} />
            <Route path="/wallet/add-card"     element={<WalletAddCard />} />
            <Route path="/messages"            element={<Messages />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <BottomNav />
      {open && <SearchModal />}
    </>
  )
}

export default function App() {
  return (
    <SearchProvider>
      <AppContent />
    </SearchProvider>
  )
}
