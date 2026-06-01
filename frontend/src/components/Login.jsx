import React from 'react'
import { login } from '../lib/api'
import './Login.css'

export default function Login({ onNavigate }){
  const [email, setEmail] = React.useState('fariha@flowboard.local')
  const [password, setPassword] = React.useState('flowboard123')
  const [status, setStatus] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus('Signing you in...')
    await login({ email, password })
    setLoading(false)
    onNavigate('dashboard')
  }

  return (
    <div className="auth-layout">
      <section className="auth-hero panel">
        <span className="eyebrow">FlowBoard</span>
        <h1>Collaborate, track, and ship projects without losing the thread.</h1>
        <p>
          A workspace hub for the Scrum Master, frontend, and backend developers to manage tasks,
          notes, deadlines, members, and activity in one place.
        </p>
        <ul className="feature-list">
          <li>Kanban boards with To Do, In Progress, and Done lanes</li>
          <li>Deadline and priority tracking for every task</li>
          <li>Workspace notes, member invites, and activity logs</li>
        </ul>
      </section>

      <section className="panel auth-card">
        <div className="card-header">
          <div>
            <span className="eyebrow">Sign in</span>
            <h2>Welcome back</h2>
          </div>
          <span className="status-dot live">Live demo</span>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={event => setEmail(event.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={event => setPassword(event.target.value)} required />
          </div>

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login to FlowBoard'}
          </button>
          {status ? <p className="hint">{status}</p> : null}

          <div className="inline-actions">
            <button type="button" className="ghost-btn" onClick={() => onNavigate('register')}>Create account</button>
            <button type="button" className="ghost-btn" onClick={() => onNavigate('forgot')}>Forgot password</button>
          </div>
        </form>
      </section>
    </div>
  )
}
