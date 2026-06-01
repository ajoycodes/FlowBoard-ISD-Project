import React from 'react'
import { register } from '../lib/api'
import './RegistrationForm.css'

export default function RegistrationForm({ onNavigate }) {
  const [form, setForm] = React.useState({
    name: 'Fariha',
    email: 'fariha@flowboard.local',
    role: 'Frontend Developer',
    password: 'flowboard123',
    confirm: 'flowboard123'
  })
  const [status, setStatus] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus('Creating your account...')
    await register(form)
    setLoading(false)
    setStatus('Account ready. Continue to login in the real app.')
  }

  return (
    <div className="auth-layout">
      <section className="auth-hero panel">
        <span className="eyebrow">Join the team</span>
        <h1>Set up the collaborative workspace for any project.</h1>
        <p>
          Register once and start managing the dashboard, task board, notes, members, and activity stream.
        </p>
        <ul className="feature-list">
          <li>Quick account setup for the whole workspace</li>
          <li>Secure login, recovery, and onboarding flow</li>
          <li>Ready for Scrum Master and team roles</li>
        </ul>
      </section>

      <section className="panel auth-card">
        <div className="card-header">
          <div>
            <span className="eyebrow">Register</span>
            <h2>Create your account</h2>
          </div>
          <span className="status-dot live">Live demo</span>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <div className="form-grid two-col">
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={form.name} onChange={event => update('name', event.target.value)} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input type="text" value={form.role} onChange={event => update('role', event.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={event => update('email', event.target.value)} required />
          </div>

          <div className="form-grid two-col">
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={event => update('password', event.target.value)} required />
            </div>
            <div className="form-group">
              <label>Confirm password</label>
              <input type="password" value={form.confirm} onChange={event => update('confirm', event.target.value)} required />
            </div>
          </div>

          <label className="terms-row">
            <input type="checkbox" required />
            <span>I agree to the terms and privacy policy</span>
          </label>

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          {status ? <p className="hint">{status}</p> : null}

          <div className="inline-actions">
            <button type="button" className="ghost-btn full" onClick={() => onNavigate && onNavigate('login')}>Back to login</button>
          </div>
        </form>
      </section>
    </div>
  )
}
