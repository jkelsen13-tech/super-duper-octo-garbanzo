import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { calcTolerance } from '../lib/toleranceAlgo'
import { registerPush } from '../lib/pushNotifications'

/**
 * Central data hook: sessions, t-break, feed, and derived stats.
 *
 * @param {object|null} user  – Supabase auth user
 * @param {object|null} profile – public.profiles row
 */
export function useAppData(user, profile) {
  const [sessions,      setSessions]      = useState([])
  const [activeTBreak,  setActiveTBreak]  = useState(null)
  const [feed,          setFeed]          = useState([])
  const [likedPosts,    setLikedPosts]    = useState(new Set())
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingFeed,   setLoadingFeed]   = useState(true)
  const [toast,         setToast]         = useState(null)   // { message, type }
  const [toastTimer,    setToastTimer]    = useState(null)

  const uid = user?.id

  // ── Show a temporary toast ───────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    if (toastTimer) clearTimeout(toastTimer)
    setToast({ message, type })
    const t = setTimeout(() => setToast(null), 2800)
    setToastTimer(t)
  }, [toastTimer])

  // ── Load sessions ────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    if (!uid) return
    setLoadingSessions(true)
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', uid)
      .order('logged_at', { ascending: false })
    if (!error) setSessions(data ?? [])
    setLoadingSessions(false)
  }, [uid])

  // ── Load active t-break ──────────────────────────────────────
  const loadTBreak = useCallback(async () => {
    if (!uid) return
    const { data } = await supabase
      .from('tbreaks')
      .select('*')
      .eq('user_id', uid)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
    setActiveTBreak(data?.[0] ?? null)
  }, [uid])

  // ── Load feed ────────────────────────────────────────────────
  const loadFeed = useCallback(async () => {
    if (!uid) return
    setLoadingFeed(true)
    const { data: posts, error } = await supabase
      .from('feed_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)

    if (!error) setFeed(posts ?? [])

    // Also load which posts the current user has liked
    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', uid)
    setLikedPosts(new Set((likes ?? []).map(l => l.post_id)))

    setLoadingFeed(false)
  }, [uid])

  // ── Initial load ─────────────────────────────────────────────
  useEffect(() => {
    if (!uid) return
    loadSessions()
    loadTBreak()
    loadFeed()
  }, [uid, loadSessions, loadTBreak, loadFeed])

  // ── Realtime: new posts from other users ─────────────────────
  useEffect(() => {
    if (!uid) return
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' },
        () => loadFeed()
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [uid, loadFeed])

  // ── Register push notifications ──────────────────────────────
  useEffect(() => {
    if (!uid) return
    registerPush(uid).catch(() => {/* user denied or not supported */})
  }, [uid])

  // ── Log a new session ────────────────────────────────────────
  const logSession = useCallback(async ({ method, amount, sizeCategory, feel, notes }) => {
    if (!uid) return
    const row = {
      user_id:       uid,
      method,
      amount:        amount ?? null,
      size_category: sizeCategory ?? null,
      feel:          feel ?? null,
      notes:         notes || null,
    }
    const { data, error } = await supabase
      .from('sessions')
      .insert(row)
      .select()
      .single()
    if (error) { showToast('Failed to save session', 'error'); return }
    setSessions(prev => [data, ...prev])
    showToast('Session logged ✓')
  }, [uid, showToast])

  // ── Delete a session ─────────────────────────────────────────
  const deleteSession = useCallback(async (id) => {
    await supabase.from('sessions').delete().eq('id', id)
    setSessions(prev => prev.filter(s => s.id !== id))
  }, [])

  // ── Start t-break ────────────────────────────────────────────
  const startTBreak = useCallback(async (goalDays = 7) => {
    if (!uid) return
    const { data, error } = await supabase
      .from('tbreaks')
      .insert({ user_id: uid, goal_days: goalDays })
      .select()
      .single()
    if (!error) {
      setActiveTBreak(data)
      showToast(`T-break started! Goal: ${goalDays} days 🌿`)
    }
  }, [uid, showToast])

  // ── End t-break ──────────────────────────────────────────────
  const endTBreak = useCallback(async () => {
    if (!activeTBreak) return
    await supabase
      .from('tbreaks')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', activeTBreak.id)
    setActiveTBreak(null)
    showToast('T-break ended. Welcome back!')
  }, [activeTBreak, showToast])

  // ── Toggle post like ─────────────────────────────────────────
  const toggleLike = useCallback(async (postId) => {
    if (!uid) return
    const isLiked = likedPosts.has(postId)
    if (isLiked) {
      await supabase.from('post_likes').delete()
        .eq('post_id', postId).eq('user_id', uid)
      setLikedPosts(prev => { const s = new Set(prev); s.delete(postId); return s })
      setFeed(prev => prev.map(p =>
        p.id === postId ? { ...p, like_count: Number(p.like_count) - 1 } : p))
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: uid })
      setLikedPosts(prev => new Set([...prev, postId]))
      setFeed(prev => prev.map(p =>
        p.id === postId ? { ...p, like_count: Number(p.like_count) + 1 } : p))
    }
  }, [uid, likedPosts])

  // ── Create a post ─────────────────────────────────────────────
  const createPost = useCallback(async (content, sessionId = null) => {
    if (!uid) return
    const { error } = await supabase
      .from('posts')
      .insert({ user_id: uid, content, session_id: sessionId || null })
    if (!error) { loadFeed(); showToast('Post shared!') }
  }, [uid, loadFeed, showToast])

  // ── Derived stats ─────────────────────────────────────────────
  const toleranceScore = calcTolerance(sessions, activeTBreak)

  const streak = (() => {
    if (!sessions.length) return 0
    const days = new Set(sessions.map(s => s.logged_at.slice(0, 10)))
    let count = 0
    let cursor = new Date()
    while (true) {
      const key = cursor.toISOString().slice(0, 10)
      if (!days.has(key)) break
      count++
      cursor = new Date(cursor - 86_400_000)
    }
    return count
  })()

  const tBreakDays = activeTBreak
    ? Math.floor((Date.now() - Date.parse(activeTBreak.started_at)) / 86_400_000)
    : 0

  const tBreakHours = activeTBreak
    ? Math.floor(((Date.now() - Date.parse(activeTBreak.started_at)) % 86_400_000) / 3_600_000)
    : 0

  return {
    sessions, loadingSessions,
    activeTBreak, tBreakDays, tBreakHours,
    feed, loadingFeed, likedPosts,
    toast,
    toleranceScore, streak,
    logSession, deleteSession,
    startTBreak, endTBreak,
    toggleLike, createPost,
    refreshFeed: loadFeed,
  }
}
