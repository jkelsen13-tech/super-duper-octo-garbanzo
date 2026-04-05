import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────────────────────
// Replace these values with your own Supabase project credentials.
// You can find them at: https://app.supabase.com → Project Settings → API
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON as GitHub repository
// secrets (Settings → Secrets → Actions) for the GitHub Pages deploy.
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON

// Flag so the app can show a "not configured" message instead of crashing
export const supabaseConfigured = Boolean(
  SUPABASE_URL && !SUPABASE_URL.includes('your-project') &&
  SUPABASE_ANON && !SUPABASE_ANON.includes('your-anon-key')
)

export const supabase = createClient(
  SUPABASE_URL  || 'https://placeholder.supabase.co',
  SUPABASE_ANON || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
