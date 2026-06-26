import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase/client'

const Ctx = createContext({ user: null, loading: true, signOut: async () => {} })

async function syncEmailToProfile(sessionUser) {
  if (!sessionUser) return
  // Re-fetch to get the most complete user object (includes identities)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const email =
    user.email ||
    user.user_metadata?.email ||
    user.identities?.[0]?.identity_data?.email
  if (email) {
    await supabase.from('profiles').update({ email }).eq('id', user.id)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore existing session on mount and sync email if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) syncEmailToProfile(session.user)
    })

    // Keep state in sync with Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (event === 'SIGNED_IN') syncEmailToProfile(session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <Ctx.Provider value={{ user, loading, signOut }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() { return useContext(Ctx) }
