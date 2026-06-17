import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
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
import { SearchProvider, useSearchModal } from './context/SearchContext'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppContent() {
  const { open } = useSearchModal()
  const { pathname } = useLocation()

  // OAuth callback runs in a popup — render standalone without nav/footer
  if (pathname === '/auth/callback') {
    return <AuthCallback />
  }

  return (
    <>
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
