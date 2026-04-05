import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Manages Supabase auth session + the current user's profile row.
 *
 * Returns:
 *   user       – raw Supabase auth user (or null)
 *   profile    – public.profiles row (or null)
 *   loading    – true while the initial session is being resolved
 *   signUp     – async (email, password, username) => { error }
 *   signIn     – async (email, password) => { error }
 *   signOut    – async () => void
 *   updateProfile – async (fields) => { error }
 */
export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Fetch the profile row for a given user id ───────────────
  const fetchProfile = useCallback(async (uid) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single()
    setProfile(data ?? null)
  }, [])

  // ── Resolve session on mount; subscribe to auth changes ─────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id).finally(() => setLoading(false))
      else   setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) fetchProfile(u.id)
        else   setProfile(null)
      }
    )
    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // ── Sign up ─────────────────────────────────────────────────
  const signUp = useCallback(async (email, password, username) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    return { error }
  }, [])

  // ── Sign in ─────────────────────────────────────────────────
  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [])

  // ── Sign out ─────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  // ── Update profile ───────────────────────────────────────────
  const updateProfile = useCallback(async (fields) => {
    if (!user) return { error: new Error('Not signed in') }
    const { data, error } = await supabase
      .from('profiles')
      .update(fields)
      .eq('id', user.id)
      .select()
      .single()
    if (!error) setProfile(data)
    return { error }
  }, [user])

  return { user, profile, loading, signUp, signIn, signOut, updateProfile }
}
