import { useState } from 'react'
import {
  ALL_METHODS, SIZE_OPTIONS,
  SizeColumnIll, GOLD, GOLD_SEL,
} from '../icons.jsx'

export default function LogModal({ onClose, onSave, initialMethod = 'flower' }) {
  const [method,       setMethod]       = useState(initialMethod)
  const [amount,       setAmount]       = useState(0.5)
  const [sessionSize,  setSessionSize]  = useState(null)
  const [feel,         setFeel]         = useState(null)
  const [notes,        setNotes]        = useState('')
  const [saving,       setSaving]       = useState(false)

  const usesSlider = ['flower', 'pre-roll', 'edible'].includes(method)

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    await onSave({
      method,
      amount:       usesSlider ? amount : null,
      sizeCategory: usesSlider ? null   : sessionSize,
      feel,
      notes: notes.trim() || null,
    })
    setSaving(false)
    onClose()
  }

  const closeOnOverlay = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="overlay" onClick={closeOnOverlay}>
      <div className="sheet">
        <button className="sheet-close" onClick={onClose}>✕</button>
        <div className="sheet-handle" />
        <div className="sheet-title">log a <em>session</em></div>
        <div className="sheet-sub">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Method picker */}
        <div className="form-block">
          <div className="form-lbl">method</div>
          <div className="sheet-methods">
            {ALL_METHODS.map(({ key, Ill }) => (
              <button key={key}
                className={`sm-chip ${method === key ? 'sel' : ''}`}
                onClick={() => setMethod(key)}>
                <Ill size={16} color={method === key ? GOLD_SEL : GOLD} />
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="input-divider" />

        {/* Amount */}
        {usesSlider ? (
          <div className="form-block">
            <div className="slider-disp">{amount}g</div>
            <div className="form-lbl">how much did you use?</div>
            <input type="range" min={0.1} max={3} step={0.1} value={amount}
              style={{ '--pct': `${((amount - 0.1) / 2.9) * 100}%` }}
              onChange={e => setAmount(parseFloat(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ink4)', fontWeight: 700, marginTop: 4 }}>
              <span>0.1g</span><span>1.5g</span><span>3g</span>
            </div>
          </div>
        ) : (
          <div className="form-block">
            <div className="form-lbl">session size</div>
            <div className="size-grid">
              {SIZE_OPTIONS.map(s => (
                <div key={s.key}
                  className={`size-tile ${sessionSize === s.key ? 'sel' : ''}`}
                  onClick={() => setSessionSize(s.key)}>
                  <SizeColumnIll h={s.h} color={sessionSize === s.key ? GOLD_SEL : GOLD} />
                  <div className="size-tile-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="input-divider" />

        {/* Feel */}
        <div className="form-block">
          <div className="form-lbl">how'd it hit?</div>
          <div className="feel-row">
            {['barely', 'mildly', 'solidly', 'very', 'extremely'].map((f, i) => (
              <button key={f}
                className={`fchip ${feel === i + 1 ? 'on' : ''}`}
                onClick={() => setFeel(i + 1)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="input-divider" />

        {/* Notes */}
        <div className="form-block">
          <div className="form-lbl">notes <span style={{ color: 'var(--ink5)', fontStyle: 'normal' }}>(optional)</span></div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="strain, setting, anything worth remembering…"
            rows={2}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 12,
              border: '1.5px solid var(--border2)', background: 'var(--parch)',
              fontFamily: "'Mulish', sans-serif", fontSize: 13, fontWeight: 600,
              color: 'var(--ink)', resize: 'none', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button className="log-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'saving…' : 'save session'}
        </button>
      </div>
    </div>
  )
}
