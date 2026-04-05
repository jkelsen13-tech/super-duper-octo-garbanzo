import { useState, useEffect, useRef, useCallback } from 'react'

const STORAGE_KEY = 'threshold_session_timer'

const DEFAULT_STATE = {
  active:        false,
  mode:          'up',     // 'up' | 'down'
  startedAt:     null,     // ISO string — when the timer began
  targetSeconds: 3600,     // countdown target (seconds); ignored in 'up' mode
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATE }
    return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

function save(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

/**
 * Persistent session timer hook.
 *
 * Returns:
 *   elapsed       – seconds elapsed since startedAt (always computed)
 *   remaining     – seconds remaining (targetSeconds - elapsed); null in 'up' mode
 *   active        – is the timer running
 *   mode          – 'up' | 'down'
 *   targetSeconds – the countdown target
 *   finished      – true when countdown hits zero
 *   display       – formatted string "HH:MM:SS" or "MM:SS"
 *   start(mode, targetSeconds) – start or restart the timer
 *   stop          – pause (keeps startedAt so elapsed stays)
 *   reset         – clear everything back to default
 *   setMode       – switch 'up'/'down' (resets timer)
 *   setTarget     – change targetSeconds (resets timer)
 */
export function useTimer() {
  const [state, setState] = useState(load)
  const [tick,  setTick]  = useState(0)   // increments every second while active
  const intervalRef = useRef(null)

  // Persist on every state change
  useEffect(() => { save(state) }, [state])

  // Drive the clock
  useEffect(() => {
    if (state.active) {
      intervalRef.current = setInterval(() => setTick(t => t + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [state.active])

  // Derived values (recomputed every tick)
  const elapsed = state.startedAt
    ? Math.max(0, Math.floor((Date.now() - Date.parse(state.startedAt)) / 1000))
    : 0

  const remaining = state.mode === 'down'
    ? Math.max(0, state.targetSeconds - elapsed)
    : null

  const finished = state.mode === 'down' && remaining === 0 && state.active

  // Auto-stop when countdown finishes
  useEffect(() => {
    if (finished) {
      setState(s => ({ ...s, active: false }))
    }
  }, [finished])

  const format = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    const mm = String(m).padStart(2, '0')
    const ss = String(s).padStart(2, '0')
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
  }

  const display = state.mode === 'up'
    ? format(elapsed)
    : format(remaining ?? 0)

  // ── Actions ─────────────────────────────────────────────────

  const start = useCallback((mode, targetSecs) => {
    setState({
      active:        true,
      mode:          mode          ?? state.mode,
      startedAt:     new Date().toISOString(),
      targetSeconds: targetSecs    ?? state.targetSeconds,
    })
  }, [state.mode, state.targetSeconds])

  const stop = useCallback(() => {
    setState(s => ({ ...s, active: false }))
  }, [])

  const reset = useCallback(() => {
    setState({ ...DEFAULT_STATE })
  }, [])

  const setMode = useCallback((mode) => {
    setState({ ...DEFAULT_STATE, mode, targetSeconds: state.targetSeconds })
  }, [state.targetSeconds])

  const setTarget = useCallback((targetSeconds) => {
    setState(s => ({ ...s, targetSeconds, active: false, startedAt: null }))
  }, [])

  return {
    elapsed, remaining, active: state.active,
    mode: state.mode, targetSeconds: state.targetSeconds,
    finished, display,
    start, stop, reset, setMode, setTarget,
  }
}
