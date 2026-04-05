/**
 * SessionTimer
 * ────────────
 * A post-session timer that lives in the Tracker tab.
 *
 * Modes:
 *  • Count UP   — shows time elapsed since the timer was started (great for
 *                 tracking how long you've been waiting between sessions)
 *  • Countdown  — counts down from a chosen target; shows "ready" when done
 *
 * State persists in localStorage so it survives page refreshes.
 */

import { useState } from 'react'

// Quick-pick countdown targets
const QUICK_TARGETS = [
  { label: '30m',  seconds: 30  * 60 },
  { label: '1h',   seconds: 60  * 60 },
  { label: '2h',   seconds: 120 * 60 },
  { label: '4h',   seconds: 240 * 60 },
  { label: '8h',   seconds: 480 * 60 },
  { label: '12h',  seconds: 720 * 60 },
  { label: '24h',  seconds: 1440 * 60 },
]

export default function SessionTimer({ timer }) {
  const {
    elapsed, remaining, active, mode, targetSeconds, finished,
    display, start, stop, reset, setMode, setTarget,
  } = timer

  const [showCustom,    setShowCustom]    = useState(false)
  const [customHours,   setCustomHours]   = useState('2')
  const [customMinutes, setCustomMinutes] = useState('0')

  const applyCustomTarget = () => {
    const h = parseInt(customHours,   10) || 0
    const m = parseInt(customMinutes, 10) || 0
    const total = h * 3600 + m * 60
    if (total > 0) { setTarget(total); setShowCustom(false) }
  }

  // Progress 0–1 for countdown ring
  const progress = mode === 'down' && targetSeconds > 0
    ? Math.max(0, 1 - (remaining ?? 0) / targetSeconds)
    : elapsed > 0 ? Math.min(1, elapsed / 86400) : 0   // up-mode: full ring at 24h

  const RADIUS    = 44
  const CIRC      = 2 * Math.PI * RADIUS
  const strokeDash = CIRC * progress
  const isUrgent  = mode === 'down' && (remaining ?? 999) < 300 && active

  // Colour scheme
  const accentColor = finished
    ? '#16755c'
    : isUrgent
      ? '#b07218'
      : mode === 'down' ? '#5e2d99' : '#16755c'

  return (
    <div style={{
      background: 'var(--parch2)',
      border: `1.5px solid ${finished ? 'rgba(22,117,92,0.4)' : isUrgent ? 'rgba(176,114,24,0.4)' : 'var(--border2)'}`,
      borderRadius: 24,
      padding: '20px 18px 18px',
      marginBottom: 14,
      boxShadow: 'var(--shadow)',
      transition: 'border-color 0.3s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink4)', marginBottom: 2 }}>
            {finished ? 'ready to go' : mode === 'up' ? 'time since last session' : 'next session in'}
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 12, color: accentColor }}>
            {finished ? 'your next session window has arrived' : active ? 'running' : 'paused'}
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'var(--parch3)', borderRadius: 10, padding: 2, gap: 2 }}>
          {[['up','⏱'], ['down','⏳']].map(([m, icon]) => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '5px 10px', border: 'none', borderRadius: 8,
              background: mode === m ? 'var(--parch)' : 'transparent',
              boxShadow: mode === m ? 'var(--shadow)' : 'none',
              color: mode === m ? accentColor : 'var(--ink5)',
              fontFamily: "'Mulish', sans-serif", fontSize: 13, cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Ring + time display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={108} height={108} style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx={54} cy={54} r={RADIUS} fill="none"
              stroke="rgba(14,10,6,0.08)" strokeWidth={7} />
            {/* Progress arc */}
            <circle cx={54} cy={54} r={RADIUS} fill="none"
              stroke={accentColor} strokeWidth={7} strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${CIRC}`}
              style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.3s' }}
            />
          </svg>
          {/* Text in ring */}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            {finished ? (
              <span style={{ fontSize: 28 }}>✅</span>
            ) : (
              <>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: display.length > 5 ? 16 : 20,
                  fontWeight: 700, color: accentColor, lineHeight: 1,
                  letterSpacing: '-0.5px',
                }}>
                  {display}
                </div>
                {mode === 'down' && targetSeconds >= 3600 && (
                  <div style={{ fontSize: 9, color: 'var(--ink5)', fontWeight: 800, marginTop: 3 }}>
                    of {QUICK_TARGETS.find(t => t.seconds === targetSeconds)?.label
                      ?? `${Math.floor(targetSeconds / 3600)}h${targetSeconds % 3600 ? Math.floor((targetSeconds % 3600)/60) + 'm' : ''}`}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right side: controls + countdown target */}
        <div style={{ flex: 1 }}>
          {/* Countdown target picker */}
          {mode === 'down' && !active && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink4)', marginBottom: 6 }}>
                target
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {QUICK_TARGETS.map(qt => (
                  <button key={qt.label} onClick={() => setTarget(qt.seconds)} style={{
                    padding: '4px 8px', border: '1.5px solid',
                    borderColor: targetSeconds === qt.seconds ? 'rgba(94,45,153,0.5)' : 'var(--border2)',
                    borderRadius: 8, background: targetSeconds === qt.seconds ? 'var(--violet-bg)' : 'var(--parch)',
                    color: targetSeconds === qt.seconds ? 'var(--violet)' : 'var(--ink4)',
                    fontFamily: "'Mulish', sans-serif", fontSize: 11, fontWeight: 800, cursor: 'pointer',
                  }}>
                    {qt.label}
                  </button>
                ))}
                <button onClick={() => setShowCustom(s => !s)} style={{
                  padding: '4px 8px', border: '1.5px solid var(--border2)', borderRadius: 8,
                  background: 'var(--parch)', color: 'var(--ink4)',
                  fontFamily: "'Mulish', sans-serif", fontSize: 11, fontWeight: 800, cursor: 'pointer',
                }}>
                  custom
                </button>
              </div>

              {showCustom && (
                <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                  <input type="number" min="0" max="99" value={customHours}
                    onChange={e => setCustomHours(e.target.value)}
                    style={{ width: 48, padding: '5px 8px', borderRadius: 8, border: '1.5px solid var(--border2)', background: 'var(--parch)', fontFamily: "'Mulish', sans-serif", fontSize: 12, fontWeight: 700, color: 'var(--ink)', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--ink4)', fontWeight: 700 }}>h</span>
                  <input type="number" min="0" max="59" value={customMinutes}
                    onChange={e => setCustomMinutes(e.target.value)}
                    style={{ width: 48, padding: '5px 8px', borderRadius: 8, border: '1.5px solid var(--border2)', background: 'var(--parch)', fontFamily: "'Mulish', sans-serif", fontSize: 12, fontWeight: 700, color: 'var(--ink)', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--ink4)', fontWeight: 700 }}>m</span>
                  <button onClick={applyCustomTarget} style={{
                    padding: '5px 10px', background: 'var(--violet-bg)',
                    border: '1.5px solid rgba(94,45,153,0.3)', borderRadius: 8,
                    color: 'var(--violet)', fontFamily: "'Mulish', sans-serif",
                    fontWeight: 800, fontSize: 11, cursor: 'pointer',
                  }}>set</button>
                </div>
              )}
            </div>
          )}

          {/* Start / Stop / Reset */}
          <div style={{ display: 'flex', gap: 7 }}>
            {active ? (
              <button onClick={stop} style={{
                flex: 1, padding: '10px 0',
                background: 'none', border: `1.5px solid ${accentColor}66`,
                borderRadius: 12, color: accentColor,
                fontFamily: "'Mulish', sans-serif", fontWeight: 800, fontSize: 12, cursor: 'pointer',
              }}>
                pause
              </button>
            ) : (
              <button onClick={() => start(mode, targetSeconds)} style={{
                flex: 1, padding: '10px 0',
                background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor})`,
                border: 'none', borderRadius: 12, color: 'var(--parch)',
                fontFamily: "'Mulish', sans-serif", fontWeight: 800, fontSize: 12, cursor: 'pointer',
                boxShadow: `0 3px 12px ${accentColor}44`,
              }}>
                {elapsed > 0 ? 'resume' : 'start'}
              </button>
            )}
            <button onClick={reset} style={{
              padding: '10px 14px', background: 'none',
              border: '1.5px solid var(--border2)', borderRadius: 12,
              color: 'var(--ink5)', fontFamily: "'Mulish', sans-serif",
              fontWeight: 800, fontSize: 12, cursor: 'pointer',
            }}>
              ↺
            </button>
          </div>
        </div>
      </div>

      {/* Finished banner */}
      {finished && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(22,117,92,0.15), rgba(10,74,56,0.1))',
          border: '1.5px solid rgba(22,117,92,0.35)', borderRadius: 14,
          padding: '10px 14px', textAlign: 'center',
        }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 600, color: 'var(--emerald)', fontStyle: 'italic' }}>
            your next session window has arrived
          </div>
          <div style={{ fontSize: 11, color: 'var(--emerald-l)', fontWeight: 700, marginTop: 3 }}>
            tap reset to start a new timer
          </div>
        </div>
      )}

      {/* Urgent warning */}
      {isUrgent && !finished && (
        <div style={{
          background: 'rgba(122,77,0,0.1)', border: '1px solid rgba(122,77,0,0.25)',
          borderRadius: 12, padding: '8px 12px', textAlign: 'center',
          fontSize: 11, color: 'var(--gold)', fontWeight: 800,
        }}>
          less than 5 minutes remaining
        </div>
      )}
    </div>
  )
}
