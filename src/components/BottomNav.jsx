import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, Calendar, Heart, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import AuthModal from './AuthModal'
import { useAuth } from '../context/AuthContext'

// Filled silhouette — shown on the Profile tab when user is logged in
function FilledPersonIcon({ size = 26, color = '#C9A882' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-1c0-3.87 3.582-7 8-7s8 3.13 8 7v1H4z" />
    </svg>
  )
}

const NAV_ITEMS = [
  { icon: Home,     label: 'Home',      path: '/',          exact: true },
  { icon: Search,   label: 'Search',    path: '/services' },
  { icon: Calendar, label: 'Activity',  path: '/activity' },
  { icon: Heart,    label: 'Favorites', path: '/favorites' },
  { icon: User,     label: 'Profile',   path: '/profile',   authGate: true },
]

function isActive(path, exact, current) {
  if (exact) return current === path
  if (path === '/activity') return current.startsWith('/activity')
  return current.startsWith(path)
}

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [hovered, setHovered] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const { user } = useAuth()

  if (
    pathname.startsWith('/providers/')        ||
    pathname.startsWith('/book/')             ||
    pathname.startsWith('/activity/booking/') ||
    pathname === '/search'                    ||
    pathname.startsWith('/profile/')
  ) return null

  const handleTap = (item) => {
    if (item.authGate && !user) {
      setAuthOpen(true)      // not logged in → show auth sheet
    } else {
      navigate(item.path)    // logged in → go to profile; no auth gate → normal nav
    }
  }

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-[300] flex justify-center px-4 pt-2"
        style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
      >
        <div
          className="flex items-center gap-0 px-2 py-2 rounded-[26px]"
          style={{
            background: 'rgba(245,240,235,0.90)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(201,168,130,0.22)',
            boxShadow: '0 4px 24px rgba(201,168,130,0.14), 0 1px 4px rgba(28,25,23,0.06)',
          }}
        >
          {NAV_ITEMS.map((item, i) => {
            const onCurrentPage = isActive(item.path, item.exact, pathname)
            // Profile icon glows gold whenever user is logged in
            const highlighted = onCurrentPage || (item.authGate && !!user)
            const hovering = hovered === i
            const Icon = item.icon

            return (
              <motion.button
                key={item.label}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleTap(item)}
                animate={{ scale: hovering ? 1.12 : 1 }}
                transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                className="relative flex items-center justify-center px-5 py-3 rounded-2xl cursor-pointer select-none"
                style={{ background: 'transparent', border: 'none', outline: 'none' }}
                aria-label={item.label}
              >
                {/* Hover background */}
                <AnimatePresence>
                  {hovering && (
                    <motion.span
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: 'rgba(201,168,130,0.10)' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </AnimatePresence>

                {item.authGate && user ? (
                  <FilledPersonIcon size={26} color="#C9A882" />
                ) : (
                  <Icon
                    className="transition-colors duration-200"
                    style={{
                      width: 26,
                      height: 26,
                      color: highlighted ? '#C9A882' : '#78716C',
                      strokeWidth: highlighted ? 2.1 : 1.6,
                    }}
                  />
                )}

                {/* Sliding dot follows the current page only */}
                {onCurrentPage && (
                  <motion.div
                    layoutId="dock-active-dot"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full"
                    style={{ width: 4, height: 4, background: '#C9A882' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  )
}
