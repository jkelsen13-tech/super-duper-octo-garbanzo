import { useState, useMemo } from 'react'
import {
  projectTolerance,
  calcSchedulePlateau,
  estimateSessionDefaults,
  toleranceTier,
} from '../lib/toleranceAlgo.js'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function Schedule({ sessions, activeTBreak, profile, onUpdateProfile, currentTolerance }) {
  // Committed schedule (saved to profile)
  const committedDays = useMemo(() => {
    const raw = profile?.target_days ?? [0, 2, 4]
    return Array.isArray(raw) ? raw : [0, 2, 4]
  }, [profile])

  // Preview schedule (local, unsaved — what the user is currently dragging around)
  const [previewDays, setPreviewDays] = useState(committedDays)
  const [saving, setSaving] = useState(false)

  const isDirty = JSON.stringify([...previewDays].sort()) !== JSON.stringify([...committedDays].sort())

  const togglePreviewDay = (i) => {
    setPreviewDays(prev =>
      prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]
    )
  }

  const commitSchedule = async () => {
    setSaving(true)
    await onUpdateProfile({ target_days: previewDays })
    setSaving(false)
  }

  const discardPreview = () => setPreviewDays(committedDays)

  // Derive session defaults from history for realistic projections
  const sessionDefaults = useMemo(() => estimateSessionDefaults(sessions), [sessions])

  // Projections for the preview schedule (30 days)
  const previewProjection = useMemo(
    () => projectTolerance(sessions, activeTBreak, previewDays, 30, sessionDefaults),
    [sessions, activeTBreak, previewDays, sessionDefaults]
  )

  // Projections for the committed schedule (for comparison)
  const committedProjection = useMemo(
    () => projectTolerance(sessions, activeTBreak, committedDays, 30, sessionDefaults),
    [sessions, activeTBreak, committedDays, sessionDefaults]
  )

  const previewPlateau  = calcSchedulePlateau(previewDays.length,  sessionDefaults.amount, sessionDefaults.method, sessionDefaults.feel)
  const committedPlateau = calcSchedulePlateau(committedDays.length, sessionDefaults.amount, sessionDefaults.method, sessionDefaults.feel)

  const previewDay14  = previewProjection[13]  ?? 0
  const previewDay30  = previewProjection[29]  ?? 0
  const previewTier   = toleranceTier(previewPlateau)
  const projMax       = Math.max(...previewProjection, committedProjection[29] ?? 0, currentTolerance, 1)

  // This week's logged days
  const loggedDaysThisWeek = useMemo(() => {
    const now    = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)
    const set = new Set()
    for (const s of sessions) {
      const d = new Date(s.logged_at)
      if (d >= monday) set.add((d.getDay() + 6) % 7)
    }
    return set
  }, [sessions])

  const onTarget = committedDays.filter(d => loggedDaysThisWeek.has(d)).length
  const extra    = [...loggedDaysThisWeek].filter(d => !committedDays.includes(d)).length

  return (
    <>
      {/* ── COMMITMENT PREVIEW ──────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(145deg, #e8d8f8, #d8ede8, #f0e4c8)',
        border: `1.5px solid ${isDirty ? 'rgba(58,22,96,0.4)' : 'rgba(58,22,96,0.2)'}`,
        borderRadius: 24, padding: 20, marginBottom: 14,
        boxShadow: isDirty ? '0 4px 24px rgba(58,22,96,0.18)' : 'var(--shadow)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* glow */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'conic-gradient(from 0deg, rgba(58,22,96,0.15), rgba(10,74,56,0.1), rgba(212,160,23,0.12), rgba(58,22,96,0.15))', filter: 'blur(24px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 11, color: 'var(--ink3)', letterSpacing: '0.06em', marginBottom: 2 }}>
                {isDirty ? 'previewing new schedule' : 'your committed schedule'}
              </div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink4)' }}>
                {previewDays.length} day{previewDays.length !== 1 ? 's' : ''}/week
              </div>
            </div>
            {/* Plateau badge */}
            <div style={{
              textAlign: 'right',
              background: 'rgba(245,234,216,0.85)', borderRadius: 14,
              padding: '8px 12px', border: `1.5px solid ${previewTier.color}22`,
            }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink4)', marginBottom: 2 }}>
                plateau index
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: previewTier.color, lineHeight: 1 }}>
                {previewPlateau}
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, color: previewTier.color, marginTop: 1 }}>
                {previewTier.label}
              </div>
            </div>
          </div>

          {/* Day toggles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 12 }}>
            {DAYS.map((d, i) => {
              const isOn = previewDays.includes(i)
              const wasOn = committedDays.includes(i)
              const changed = isOn !== wasOn
              return (
                <div key={d} onClick={() => togglePreviewDay(i)} style={{
                  background: isOn
                    ? 'linear-gradient(145deg, #e0d0f8, #cce8dc)'
                    : 'rgba(245,234,216,0.7)',
                  border: `1.5px solid ${changed ? '#5e2d99' : isOn ? 'rgba(58,22,96,0.35)' : 'var(--border2)'}`,
                  borderRadius: 12, padding: '8px 4px', textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: changed ? '0 0 0 2px rgba(94,45,153,0.25)' : 'none',
                }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: isOn ? 'var(--violet)' : 'var(--gold-bright)', marginBottom: 5 }}>
                    {d}
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', margin: '0 auto', background: isOn ? 'var(--violet-l)' : 'var(--parch3)', boxShadow: isOn ? '0 0 5px rgba(94,45,153,0.45)' : 'none', transition: 'all 0.15s' }} />
                </div>
              )
            })}
          </div>

          {/* Milestone projections */}
          <div style={{ display: 'flex', gap: 8, marginBottom: isDirty ? 12 : 0 }}>
            {[['now', currentTolerance, '#5e2d99'], ['14d', previewDay14, toleranceTier(previewDay14).color], ['30d', previewDay30, toleranceTier(previewDay30).color], ['plateau', previewPlateau, previewTier.color]].map(([lbl, val, col]) => (
              <div key={lbl} style={{ flex: 1, background: 'rgba(245,234,216,0.7)', borderRadius: 10, padding: '8px 6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink4)', marginBottom: 3 }}>{lbl}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: col, lineHeight: 1 }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Comparison row when preview differs from committed */}
          {isDirty && committedDays.length > 0 && (
            <div style={{
              background: 'rgba(245,234,216,0.6)', borderRadius: 12, padding: '10px 12px',
              border: '1px solid var(--border2)', marginBottom: 12,
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink4)', marginBottom: 8 }}>
                schedule comparison
              </div>
              {[
                { label: 'current', days: committedDays.length, plateau: committedPlateau, projection: committedProjection },
                { label: 'new',     days: previewDays.length,   plateau: previewPlateau,   projection: previewProjection },
              ].map(row => {
                const tier = toleranceTier(row.plateau)
                const diff = row.plateau - (row.label === 'new' ? committedPlateau : previewPlateau)
                return (
                  <div key={row.label} className="cmp-row">
                    <div className="cmp-name" style={{ fontSize: 11, width: 52, color: 'var(--ink3)' }}>
                      {row.label}<br />
                      <span style={{ fontSize: 9, color: 'var(--ink5)', fontWeight: 700 }}>{row.days}d/wk</span>
                    </div>
                    <div className="cmp-track">
                      <div className="cmp-fill" style={{ width: `${row.plateau}%`, background: tier.color, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: tier.color, width: 28, textAlign: 'right' }}>
                      {row.plateau}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Action buttons */}
          {isDirty && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={discardPreview} style={{
                flex: 1, padding: '10px', background: 'none',
                border: '1.5px solid var(--border2)', borderRadius: 12,
                color: 'var(--ink4)', fontFamily: "'Mulish', sans-serif",
                fontWeight: 800, fontSize: 12, cursor: 'pointer',
              }}>
                discard
              </button>
              <button onClick={commitSchedule} disabled={saving} style={{
                flex: 2, padding: '10px',
                background: 'linear-gradient(135deg, var(--emerald-l), var(--violet-l))',
                border: 'none', borderRadius: 12,
                color: 'var(--gold-bright)', fontFamily: "'Playfair Display', serif",
                fontWeight: 600, fontSize: 14, fontStyle: 'italic', cursor: 'pointer',
                opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'saving…' : 'commit this schedule'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 30-DAY PROJECTION CHART ──────────────────────────── */}
      <div className="chart-card">
        <div className="chart-head">
          <div className="s-label" style={{ margin: 0 }}>projected tolerance — 30 days</div>
          {isDirty && (
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--violet)', background: 'var(--violet-bg)', borderRadius: 8, padding: '3px 8px' }}>
              preview
            </div>
          )}
        </div>
        <div className="bars" style={{ height: 90 }}>
          {previewProjection.map((v, i) => {
            const committed = committedProjection[i] ?? 0
            const col = toleranceTier(v).color
            return (
              <div key={i} className="bc">
                {/* Ghost bar for committed schedule (when previewing change) */}
                {isDirty && (
                  <div style={{
                    position: 'relative', width: '100%',
                    height: `${Math.max((committed / projMax) * 100, 2)}%`,
                    background: 'rgba(14,10,6,0.1)', borderRadius: '3px 3px 1px 1px',
                    marginBottom: -((committed / projMax) * 90),
                    zIndex: 0,
                  }} />
                )}
                <div className="bb" style={{
                  height: `${Math.max((v / projMax) * 100, 3)}%`,
                  background: `linear-gradient(180deg, ${col}, ${col}44)`,
                  position: 'relative', zIndex: 1,
                }} />
                {(i === 6 || i === 13 || i === 29) && (
                  <div className="bt" style={{ fontSize: 8 }}>d{i + 1}</div>
                )}
              </div>
            )
          })}
        </div>
        {isDirty && (
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10, fontWeight: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 6, borderRadius: 2, background: 'rgba(14,10,6,0.12)' }} />
              <span style={{ color: 'var(--ink5)' }}>current schedule</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 6, borderRadius: 2, background: previewTier.color }} />
              <span style={{ color: 'var(--ink4)' }}>new schedule</span>
            </div>
          </div>
        )}
      </div>

      {/* ── THIS WEEK PROGRESS ───────────────────────────────── */}
      <div className="schedule-section">
        <div className="schedule-section-head">
          <div className="s-label" style={{ margin: 0 }}>this week</div>
          <div className="sched-legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--violet-l)' }} />target
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--emerald-l)' }} />logged
            </div>
          </div>
        </div>
        <div className="week-grid">
          {DAYS.map((d, i) => {
            const isTarget = committedDays.includes(i)
            const isLogged = loggedDaysThisWeek.has(i)
            const state = isTarget && isLogged ? 'both' : isTarget ? 'target' : isLogged ? 'logged' : ''
            return (
              <div key={d} className={`wday ${state}`}>
                <div className="wday-lbl">{d}</div>
                <div className="wday-dots">
                  {isTarget && <div className="wdot target" />}
                  {isLogged && <div className="wdot logged" />}
                  {!isTarget && !isLogged && <div className="wdot" />}
                </div>
              </div>
            )
          })}
        </div>
        <div className="schedule-note">
          on target <b>{onTarget} / {committedDays.length} days</b> this week
          {extra > 0 && ` · ${extra} unplanned session${extra > 1 ? 's' : ''}`}
        </div>
      </div>

      {/* ── INSIGHTS ─────────────────────────────────────────── */}
      <div style={{ background: 'var(--parch2)', border: '1.5px solid var(--border2)', borderRadius: 22, padding: 18, boxShadow: 'var(--shadow)' }}>
        <div className="cmp-label" style={{ marginBottom: 12 }}>schedule insights</div>
        {previewDays.length === 7 && <InsightRow icon="⚠️" text="Targeting every day. Adding 2–3 rest days per week significantly slows tolerance build-up." color="#b07218" />}
        {previewDays.length <= 2 && <InsightRow icon="✅" text="Low-frequency schedule. Your tolerance will stay lower and each session will hit harder." color="#0a4a38" />}
        {previewDays.length >= 3 && previewDays.length <= 4 && <InsightRow icon="🌿" text="Balanced schedule. 3–4 days/week keeps tolerance manageable with regular rest." color="#16755c" />}
        {activeTBreak && <InsightRow icon="⏸" text="T-break in progress. These projections assume you resume on your schedule after the break." color="#5e2d99" />}
        <InsightRow
          icon="📈"
          text={`At ${previewDays.length}d/week your tolerance plateaus at ${previewPlateau} — ${toleranceTier(previewPlateau).label} tier.`}
          color={previewTier.color}
        />
        {sessionDefaults.method && (
          <InsightRow
            icon="💡"
            text={`Projections based on your recent average: ${sessionDefaults.amount}g ${sessionDefaults.method}, feel ${sessionDefaults.feel}/5.`}
            color="var(--ink4)"
          />
        )}
      </div>
    </>
  )
}

function InsightRow({ icon, text, color }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <p style={{ fontSize: 12, color: color || 'var(--ink3)', fontWeight: 700, lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  )
}
