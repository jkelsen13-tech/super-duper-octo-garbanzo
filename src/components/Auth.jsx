import { useState } from 'react'

export default function Auth({ onAuth }) {
  const [mode,     setMode]     = useState('signin')  // 'signin' | 'signup'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = mode === 'signup'
      ? await onAuth.signUp(email, password, username)
      : await onAuth.signIn(email, password)
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--parch)', padding: '24px',
    }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div className="logo" style={{ fontSize: 38, marginBottom: 8 }}>
          thresh<em>old</em>
        </div>
        <p style={{ color: 'var(--ink4)', fontSize: 13, fontWeight: 600 }}>
          tolerance tracking, honestly
        </p>
      </div>

      <div style={{
        width: '100%', maxWidth: 380,
        background: 'var(--parch2)',
        border: '1.5px solid var(--border2)',
        borderRadius: 24, padding: '28px 24px',
        boxShadow: 'var(--shadow2)',
      }}>
        <div style={{ display: 'flex', marginBottom: 24, background: 'var(--parch3)', borderRadius: 12, padding: 3 }}>
          {['signin', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '9px 0', border: 'none', borderRadius: 10,
              background: mode === m ? 'var(--parch)' : 'transparent',
              boxShadow: mode === m ? 'var(--shadow)' : 'none',
              color: mode === m ? 'var(--violet)' : 'var(--ink4)',
              fontFamily: "'Mulish', sans-serif", fontSize: 12, fontWeight: 800,
              cursor: 'pointer', transition: 'all 0.18s', letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: 14 }}>
              <label className="form-lbl">Username</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="slowburn.lab" required minLength={3}
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label className="form-lbl">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="form-lbl">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'at least 8 characters' : '••••••••'}
              required minLength={8}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 14,
              color: '#c0392b', fontSize: 12, fontWeight: 700,
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="log-btn" style={{ marginBottom: 0 }}>
            {loading ? 'one moment…' : mode === 'signup' ? 'create account' : 'sign in'}
          </button>
        </form>

        {mode === 'signup' && (
          <p style={{ fontSize: 11, color: 'var(--ink5)', marginTop: 14, textAlign: 'center', lineHeight: 1.6 }}>
            By signing up you agree to use this app responsibly.<br />
            Your data is private — only you can see your sessions.
          </p>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: 'var(--parch)', border: '1.5px solid var(--border2)',
  borderRadius: 12, color: 'var(--ink)',
  fontFamily: "'Mulish', sans-serif", fontSize: 13, fontWeight: 600,
  outline: 'none', boxSizing: 'border-box',
}
