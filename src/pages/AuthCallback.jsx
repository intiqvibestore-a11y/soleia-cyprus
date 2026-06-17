import { useEffect } from 'react'
import { supabase } from '../utils/supabase/client'

export default function AuthCallback() {
  useEffect(() => {
    let done = false

    function send(session) {
      if (done) return
      done = true
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'soleia-auth-success',
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          },
          window.location.origin
        )
        window.close()
      } else {
        // Normal redirect fallback (popup was blocked) — go home
        window.location.replace('/')
      }
    }

    // Supabase auto-processes the URL hash on client init (detectSessionInUrl: true).
    // Check immediately, then listen for the SIGNED_IN event as a fallback.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) send(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        send(session)
      }
    })

    // Safety net: close popup after 8 s if nothing resolves
    const timeout = setTimeout(() => {
      if (window.opener) window.close()
      else window.location.replace('/')
    }, 8000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#FDFAF7]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#E8E0D8] border-t-[#C9A882] rounded-full animate-spin" />
        <p className="text-[14px] text-[#78716C]">Συνδέεστε…</p>
      </div>
    </div>
  )
}
