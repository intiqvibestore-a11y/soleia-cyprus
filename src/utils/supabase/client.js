import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: window.sessionStorage, // cleared when browser closes — no auto-login next visit
      persistSession: true,           // persist within the current browser session
      detectSessionInUrl: true,       // detect OAuth tokens from the redirect URL
      flowType: 'implicit',           // tokens arrive in URL hash — works across popup boundaries
    },
  }
)
