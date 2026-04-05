import { useState } from 'react'
import { toleranceTier } from '../lib/toleranceAlgo.js'
import { ALL_METHODS, GOLD, GOLD_SEL } from '../icons.jsx'
import SessionTimer from './SessionTimer.jsx'

const FEEL_LABEL = { 1:'barely', 2:'mildly', 3:'solidly', 4:'very', 5:'extremely' }

const fmt = iso => new Date(iso).toLocaleDateString(undefined, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })

export default function Tracker({
  toleranceScore, sessions, streak, activeTBreak,
  tBreakDays, tBreakHours,
  timer,
  onStartTBreak, onEndTBreak, onDeleteSession, onOpenLog,
  method, setMethod,
}) {
  const [rng, setRng] = useState('2w')
  const [goalDays, setGoalDays] = useState(7)
  const [showGoalPicker, setShowGoalPicker] = useState(false)

  const tier = toleranceTier(toleranceScore)
  const dashOffset = 251.2 * (1 - toleranceScore / 100)

  // Build heatmap: last 26 weeks = 182 days
  const heatmap = (() => {
    const today = new Date(); today.setHours(0,0,0,0)
    const counts = {}
    for (const s of sessions) {
      const d = new Date(s.logged_at); d.setHours(0,0,0,0)
      const key = d.toISOString().slice(0,10)
      counts[key] = (counts[key] || 0) + 1
    }
    return Array.from({ length: 182 }, (_, i) => {
      const d = new Date(today - (181 - i) * 86400000)
      const c = counts[d.toISOString().slice(0,10)] || 0
      if (c === 0) return 0
      if (c === 1) return 1
      if (c === 2) return 2
      if (c === 3) return 3
      return 4
    })
  })()

  // Chart bars: use actual session counts per day for selected range
  const chartData = (() => {
    const days = { '1w': 7, '2w': 14, '1m': 30, '3m': 90 }[rng]
    const result = []
    const today = new Date(); today.setHours(23,59,59,999)
    for (let i = days - 1; i >= 0; i--) {
      const start = new Date(today - i * 86400000); start.setHours(0,0,0,0)
      const end   = new Date(today - i * 86400000); end.setHours(23,59,59,999)
      const count = sessions.filter(s => {
        const d = Date.parse(s.logged_at)
        return d >= start && d <= end
      }).length
      result.push(count)
    }
    const max = Math.max(...result, 1)
    return result.map(v => v / max)
  })()

  const recentSessions = sessions.slice(0, 5)

  return (
    <>
      {/* Tolerance hero */}
      <div className="tol-hero">
        <div className="tol-hero-glow" />
        <div className="tol-hero-top">
          <div className="tol-eyebrow">tolerance index</div>
          <div className={`tol-status ${tier.cssClass}`}>{tier.label}</div>
        </div>
        <div className="tol-main">
          <div className="radial-wrap">
            <svg className="radial-svg" viewBox="0 0 96 96">
              <circle className="radial-bg" cx="48" cy="48" r="40" />
              <circle className="radial-fill" cx="48" cy="48" r="40"
                stroke="url(#g1)" strokeDashoffset={dashOffset} />
              <defs>
                <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#16755c" />
                  <stop offset="50%"  stopColor="#5e2d99" />
                  <stop offset="100%" stopColor="#d4a017" />
                </linearGradient>
              </defs>
            </svg>
            <div className="radial-label">
              <div className="radial-num">{toleranceScore}</div>
              <div className="radial-of">/ 100</div>
            </div>
          </div>
          <div>
            <div className="tol-big">
              {toleranceScore <= 20 ? <><em>clean</em> slate</> :
               toleranceScore <= 45 ? <>feeling <em>light</em></> :
               toleranceScore <= 65 ? <>building <em>up</em></> :
               <><em>elevated</em> — consider a break</>}
            </div>
            {sessions.length > 0 && (
              <div className="tol-delta">
                based on <span style={{ color: 'var(--violet-l)', fontWeight: 800 }}>
                  {sessions.length}
                </span> logged sessions
              </div>
            )}
          </div>
        </div>
        <div className="tol-bar-row">
          <div className="tol-bar-bg">
            <div className="tol-bar-fill" style={{ width: `${toleranceScore}%` }} />
          </div>
          <div className="tol-bar-ticks">
            <span>fresh</span><span>light</span><span>building</span><span>elevated</span><span>peak</span>
          </div>
        </div>
      </div>

      {/* T-break panel */}
      {activeTBreak ? (
        <div style={{
          background: 'linear-gradient(145deg, #d0eadc, #c8e4d8)',
          border: '1.5px solid rgba(10,74,56,0.3)', borderRadius: 22,
          padding: '18px 20px', marginBottom: 14, boxShadow: 'var(--shadow)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--emerald)', marginBottom: 6 }}>
                t-break active
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'var(--emerald)', lineHeight: 1 }}>
                {tBreakDays}<span style={{ fontSize: 13, marginLeft: 4 }}>d</span>{' '}
                {tBreakHours}<span style={{ fontSize: 13, marginLeft: 2 }}>h</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink4)', fontWeight: 700, marginTop: 4 }}>
                goal: {activeTBreak.goal_days} days
                {tBreakDays >= activeTBreak.goal_days && ' — goal reached! 🎉'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--emerald)', fontWeight: 800, marginBottom: 8 }}>
                projected index
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: 'var(--emerald)', fontWeight: 700 }}>
                {Math.max(0, toleranceScore - tBreakDays * 3)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink4)', fontWeight: 700 }}>at goal day {activeTBreak.goal_days}</div>
            </div>
          </div>
          <button onClick={onEndTBreak} style={{
            marginTop: 14, width: '100%', padding: '10px',
            background: 'rgba(10,74,56,0.12)', border: '1.5px solid rgba(10,74,56,0.3)',
            borderRadius: 12, color: 'var(--emerald)', fontFamily: "'Mulish', sans-serif",
            fontWeight: 800, fontSize: 12, cursor: 'pointer',
          }}>
            end t-break
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: 14 }}>
          {showGoalPicker ? (
            <div style={{
              background: 'var(--parch2)', border: '1.5px solid var(--border2)',
              borderRadius: 18, padding: '16px', boxShadow: 'var(--shadow)',
            }}>
              <div className="form-lbl" style={{ marginBottom: 10 }}>t-break goal (days)</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {[3, 7, 14, 21, 30].map(d => (
                  <button key={d} onClick={() => setGoalDays(d)} style={{
                    flex: 1, padding: '8px 0', border: '1.5px solid',
                    borderColor: goalDays === d ? 'rgba(10,74,56,0.5)' : 'var(--border2)',
                    borderRadius: 10, background: goalDays === d ? 'rgba(10,74,56,0.12)' : 'var(--parch)',
                    color: goalDays === d ? 'var(--emerald)' : 'var(--ink4)',
                    fontFamily: "'Mulish', sans-serif", fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  }}>
                    {d}d
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowGoalPicker(false)} style={{
                  flex: 1, padding: '10px', background: 'none',
                  border: '1.5px solid var(--border2)', borderRadius: 12,
                  color: 'var(--ink4)', fontFamily: "'Mulish', sans-serif", fontWeight: 800, fontSize: 12, cursor: 'pointer',
                }}>cancel</button>
                <button onClick={() => { onStartTBreak(goalDays); setShowGoalPicker(false) }} style={{
                  flex: 2, padding: '10px',
                  background: 'linear-gradient(135deg, var(--emerald-l), var(--emerald))',
                  border: 'none', borderRadius: 12, color: 'var(--parch)',
                  fontFamily: "'Mulish', sans-serif", fontWeight: 800, fontSize: 12, cursor: 'pointer',
                }}>start t-break</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowGoalPicker(true)} style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, rgba(10,74,56,0.1), rgba(10,74,56,0.05))',
              border: '1.5px dashed rgba(10,74,56,0.35)', borderRadius: 18,
              color: 'var(--emerald)', fontFamily: "'Mulish', sans-serif",
              fontWeight: 800, fontSize: 13, cursor: 'pointer',
            }}>
              🌿 start a t-break
            </button>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-card-label">streak</div>
          <div className="stat-card-val gold">{streak}</div>
          <div className="stat-card-sub">days active</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">t-break</div>
          <div className="stat-card-val emerald">{activeTBreak ? tBreakDays : 0}</div>
          <div className="stat-card-sub">clean days</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">total</div>
          <div className="stat-card-val violet">{sessions.length}</div>
          <div className="stat-card-sub">sessions logged</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="heatmap-card">
        <div className="s-label">activity — last 26 weeks</div>
        <div className="heatmap">
          {heatmap.map((l, i) => <div key={i} className={`hm ${['','l1','l2','l3','l4'][l]}`} />)}
        </div>
      </div>

      {/* Tolerance trend chart */}
      <div className="chart-card">
        <div className="chart-head">
          <div className="s-label" style={{ margin: 0 }}>session frequency</div>
          <div className="chart-ranges">
            {['1w','2w','1m','3m'].map(r => (
              <button key={r} className={`rng ${rng === r ? 'active' : ''}`} onClick={() => setRng(r)}>{r}</button>
            ))}
          </div>
        </div>
        <div className="bars">
          {chartData.map((v, i) => (
            <div key={i} className="bc">
              <div className="bb" style={{
                height: `${Math.max(v * 100, 4)}%`,
                background: i === chartData.length - 1
                  ? 'linear-gradient(180deg, #b07218, rgba(176,114,24,0.28))'
                  : v > 0.5
                    ? 'linear-gradient(180deg, #5e2d99, rgba(94,45,153,0.28))'
                    : 'linear-gradient(180deg, #16755c, rgba(22,117,92,0.28))',
              }} />
              <div className="bt">{i === chartData.length - 1 ? 'now' : ''}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div className="chart-card" style={{ marginBottom: 14 }}>
          <div className="s-label" style={{ marginBottom: 12 }}>recent sessions</div>
          {recentSessions.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', borderBottom: '1px solid var(--border)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--emerald-bg), var(--violet-bg))',
                border: '1.5px solid var(--border2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, color: 'var(--violet)',
                textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0,
              }}>
                {s.method.slice(0, 3)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink)', marginBottom: 2 }}>
                  {s.method}
                  {s.amount ? ` · ${s.amount}g` : s.size_category ? ` · ${s.size_category}` : ''}
                  {s.feel ? ` · ${FEEL_LABEL[s.feel]}` : ''}
                </div>
                {s.notes && (
                  <div style={{ fontSize: 11, color: 'var(--ink4)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.notes}
                  </div>
                )}
                <div style={{ fontSize: 10, color: 'var(--ink5)', fontWeight: 700, marginTop: 2 }}>
                  {fmt(s.logged_at)}
                </div>
              </div>
              <button onClick={() => onDeleteSession(s.id)} style={{
                background: 'none', border: 'none', color: 'var(--ink5)',
                fontSize: 16, cursor: 'pointer', padding: '4px 6px', flexShrink: 0,
              }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Log button */}
      <div className="s-label">log a session</div>
      <div className="method-row">
        {ALL_METHODS.map(({ key, Ill }) => (
          <button key={key} className={`mchip ${method === key ? 'sel' : ''}`} onClick={() => setMethod(key)}>
            <Ill size={18} color={method === key ? GOLD_SEL : GOLD} />
            {key}
          </button>
        ))}
      </div>
      <button className="log-btn" onClick={onOpenLog}>+ log a session</button>

      {/* Session timer */}
      {timer && <SessionTimer timer={timer} />}
    </>
  )
}
