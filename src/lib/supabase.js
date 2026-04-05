import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON

const AUTH_OPTS = {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}

const PLACEHOLDER_URL  = 'https://placeholder.supabase.co'
const PLACEHOLDER_ANON = 'placeholder-anon-key'

// Try to build a real client; fall back to placeholder so the app never crashes
let _supabase
let _configured = false
try {
  _supabase   = createClient(SUPABASE_URL || PLACEHOLDER_URL, SUPABASE_ANON || PLACEHOLDER_ANON, AUTH_OPTS)
  _configured = Boolean(SUPABASE_URL && SUPABASE_ANON && !SUPABASE_URL.includes('placeholder'))
} catch {
  _supabase   = createClient(PLACEHOLDER_URL, PLACEHOLDER_ANON, AUTH_OPTS)
  _configured = false
}

export const supabase           = _supabase
export const supabaseConfigured = _configured
