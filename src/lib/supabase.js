import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────────────────────
// Replace these values with your own Supabase project credentials.
// You can find them at: https://app.supabase.com → Project Settings → API
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://your-project.supabase.co'
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || 'your-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
