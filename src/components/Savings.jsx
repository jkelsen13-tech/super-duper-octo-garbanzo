import { useState } from 'react'
import { calcSavings, monthlySpend, avgCostPerSession } from '../lib/savingsCalc.js'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const fmt$ = (n) => `$${n.toFixed(2).replace(/\.00$/, '')}`

export default function Savings({ sessions, profile, onUpdateProfile }) {
  const pricePerGram   = profile?.price_per_gram   ?? 10
  const baselineGrams  = profile?.baseline_grams   ?? 1.0
  const [editingPrice, setEditingPrice]    = useState(false)
  const [editingBase,  setEditingBase]     = useState(false)
  const [priceInput,   setPriceInput]      = useState(String(pricePerGram))
  const [baseInput,    setBaseInput]       = useState(String(baselineGrams))

  const savings   = calcSavings(sessions, pricePerGram, baselineGrams)
  const monthly   = monthlySpend(sessions, pricePerGram)
  const monthMax  = Math.max(...monthly, 1)
  const avgPerSesh = avgCostPerSession(sessions, pricePerGram)

  const savePrice = () => {
    const v = parseFloat(priceInput)
    if (!isNaN(v) && v > 0) onUpdateProfile({ price_per_gram: v })
    setEditingPrice(false)
  }
  const saveBase = () => {
    const v = parseFloat(baseInput)
    if (!isNaN(v) && v > 0) onUpdateProfile({ baseline_grams: v })
    setEditingBase(false)
  }

  return (
    <>
      {/* Settings row */}
      <div style={{
        background: 'var(--parch2)', border: '1.5px solid var(--border2)',
        borderRadius: 18, padding: '14px 16px', marginBottom: 14,
        display: 'flex', gap: 10,
      }}>
        {/* Price per gram */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink4)', marginBottom: 6 }}>
            $/gram
          </div>
          {editingPrice ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <input type="number" min="0" step="0.5" value={priceInput}
                onChange={e => setPriceInput(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border2)', background: 'var(--parch)', fontFamily: "'Mulish', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}
                onKeyDown={e => e.key === 'Enter' && savePrice()}
                autoFocus
              />
              <button onClick={savePrice} style={{ padding: '6px 10px', background: 'var(--violet-bg)', border: '1.5px solid rgba(58,22,96,0.3)', borderRadius: 8, color: 'var(--violet)', fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>✓</button>
            </div>
          ) : (
            <div onClick={() => { setEditingPrice(true); setPriceInput(String(pricePerGram)) }}
                 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: 'var(--gold)', cursor: 'pointer' }}>
              {fmt$(pricePerGram)}<span style={{ fontSize: 12, color: 'var(--ink4)', marginLeft: 3 }}>✎</span>
            </div>
          )}
        </div>

        <div style={{ width: 1, background: 'var(--border2)' }} />

        {/* Baseline */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink4)', marginBottom: 6 }}>
            baseline g/day
          </div>
          {editingBase ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <input type="number" min="0" step="0.1" value={baseInput}
                onChange={e => setBaseInput(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border2)', background: 'var(--parch)', fontFamily: "'Mulish', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}
                onKeyDown={e => e.key === 'Enter' && saveBase()}
                autoFocus
              />
              <button onClick={saveBase} style={{ padding: '6px 10px', background: 'var(--emerald-bg)', border: '1.5px solid rgba(10,74,56,0.3)', borderRadius: 8, color: 'var(--emerald)', fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>✓</button>
            </div>
          ) : (
            <div onClick={() => { setEditingBase(true); setBaseInput(String(baselineGrams)) }}
                 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: 'var(--emerald)', cursor: 'pointer' }}>
              {baselineGrams}g<span style={{ fontSize: 12, color: 'var(--ink4)', marginLeft: 3 }}>✎</span>
            </div>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="savings-hero">
        <div className="savings-glow" />
        <div className="sav-eyebrow">projected yearly savings</div>
        <div className="sav-big">
          {savings.year.saved != null ? fmt$(savings.year.saved) : '—'}
        </div>
        <div className="sav-sub">vs. your {baselineGrams}g/day baseline</div>
        <div className="sav-tiles">
          {[
            ['this month',  savings.month.saved != null ? fmt$(savings.month.saved)  : '—'],
            ['this week',   savings.week.saved  != null ? fmt$(savings.week.saved)   : '—'],
            ['per session', fmt$(avgPerSesh)],
          ].map(([l, v]) => (
            <div key={l} className="sav-tile">
              <div className="sav-tile-lbl">{l}</div>
              <div className="sav-tile-val">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly spend chart */}
      <div className="chart-card">
        <div className="s-label">monthly spend — {new Date().getFullYear()}</div>
        <div className="bars">
          {monthly.map((v, i) => (
            <div key={i} className="bc">
              <div className="bb" style={{
                height: `${Math.max((v / monthMax) * 100, v > 0 ? 8 : 4)}%`,
                background: i < 4
                  ? 'linear-gradient(180deg, #b07218, rgba(176,114,24,0.25))'
                  : 'linear-gradient(180deg, #0a4a38, rgba(10,74,56,0.22))',
              }} />
              <div className="bt">{MONTHS[i].charAt(0)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-card-label">total spent</div>
          <div className="stat-card-val gold">{fmt$(savings.all.actualSpend)}</div>
          <div className="stat-card-sub">all time logged</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">total saved</div>
          <div className="stat-card-val emerald">
            {savings.year.saved != null ? fmt$(savings.year.saved) : '—'}
          </div>
          <div className="stat-card-sub">this year vs baseline</div>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{
        background: 'var(--parch2)', border: '1.5px solid var(--border2)',
        borderRadius: 22, padding: 18, boxShadow: 'var(--shadow)', marginBottom: 14,
      }}>
        <div className="cmp-label" style={{ marginBottom: 12 }}>spending breakdown</div>
        {['week','month','year'].map(key => {
          const s = savings[key]
          return (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink3)' }}>{s.label}</span>
              <div style={{ display: 'flex', gap: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink4)' }}>spent {fmt$(s.actualSpend)}</span>
                {s.saved != null && (
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--emerald)' }}>
                    saved {fmt$(s.saved)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
