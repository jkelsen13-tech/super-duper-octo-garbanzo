import { useState } from 'react'
import { projectTolerance } from '../lib/toleranceAlgo.js'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function Schedule({ sessions, activeTBreak, profile, onUpdateProfile }) {
  const rawTarget = profile?.target_days ?? [0, 2, 4]
  const targetDays = Array.isArray(rawTarget) ? rawTarget : [0, 2, 4]

  const toggleTargetDay = (i) => {
    const next = targetDays.includes(i)
      ? targetDays.filter(d => d !== i)
      : [...targetDays, i]
    onUpdateProfile({ target_days: next })
  }

  // Determine this week's logged days (Mon = 0)
  const loggedDaysThisWeek = (() => {
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)
    const set = new Set()
    for (const s of sessions) {
      const d = new Date(s.logged_at)
      if (d >= monday) {
        set.add((d.getDay() + 6) % 7)  // 0=Mon
      }
    }
    return set
  })()

  // Projection chart
  const projection = projectTolerance(sessions, activeTBreak, targetDays, 14)
  const projMax = Math.max(...projection, 1)

  const onTarget = targetDays.filter(d => loggedDaysThisWeek.has(d)).length
  const extra    = [...loggedDaysThisWeek].filter(d => !targetDays.includes(d)).length

  return (
    <>
      {/* Target schedule */}
      <div className="schedule-section">
        <div className="schedule-section-head">
          <div className="s-label" style={{ margin: 0 }}>your target schedule</div>
        </div>
        <div className="week-target-row">
          {DAYS.map((d, i) => (
            <div key={d} className={`target-toggle ${targetDays.includes(i) ? 'on' : ''}`}
                 onClick={() => toggleTargetDay(i)}>
              <div className="target-toggle-lbl">{d}</div>
              <div className="target-toggle-dot" />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink4)', fontWeight: 700, textAlign: 'center', paddingBottom: 4 }}>
          tap to toggle rest vs. use days
        </div>
      </div>

      {/* This week progress */}
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
            const isTarget = targetDays.includes(i)
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
          on target <b>{onTarget} / {targetDays.length} days</b> this week
          {extra > 0 && ` · ${extra} unplanned session${extra > 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Projected tolerance curve */}
      <div className="chart-card">
        <div className="chart-head">
          <div className="s-label" style={{ margin: 0 }}>projected tolerance — 14 days</div>
        </div>
        <div className="bars">
          {projection.map((v, i) => (
            <div key={i} className="bc">
              <div className="bb" style={{
                height: `${Math.max((v / projMax) * 100, 4)}%`,
                background: v > 60
                  ? 'linear-gradient(180deg, #b07218, rgba(176,114,24,0.22))'
                  : v > 35
                    ? 'linear-gradient(180deg, #5e2d99, rgba(94,45,153,0.22))'
                    : 'linear-gradient(180deg, #16755c, rgba(22,117,92,0.22))',
              }} />
              {(i === 6 || i === 13) && (
                <div className="bt" style={{ fontSize: 8 }}>d{i + 1}</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--ink4)', fontWeight: 700 }}>
          <span>today</span>
          <span>day 14 — est. {projection[13]}</span>
        </div>
      </div>

      {/* Rest days insight */}
      <div style={{
        background: 'var(--parch2)', border: '1.5px solid var(--border2)',
        borderRadius: 22, padding: 18, boxShadow: 'var(--shadow)',
      }}>
        <div className="cmp-label" style={{ marginBottom: 12 }}>schedule insights</div>

        {targetDays.length === 7 && (
          <InsightRow
            icon="⚠️"
            text="You're targeting every day. Adding 2–3 rest days per week significantly slows tolerance build-up."
            color="#b07218"
          />
        )}
        {targetDays.length <= 2 && (
          <InsightRow
            icon="✅"
            text="Low-frequency schedule. Your tolerance will stay lower and each session will hit harder."
            color="#0a4a38"
          />
        )}
        {activeTBreak && (
          <InsightRow
            icon="🌿"
            text={`T-break in progress. Your index drops ~3 pts/day. Keep it going!`}
            color="#16755c"
          />
        )}
        <InsightRow
          icon="📅"
          text={`${targetDays.length} use day${targetDays.length !== 1 ? 's' : ''} per week scheduled · ${7 - targetDays.length} rest day${7 - targetDays.length !== 1 ? 's' : ''}`}
          color="#5e2d99"
        />
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
