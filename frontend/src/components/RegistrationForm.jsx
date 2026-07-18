import React from 'react'
import { register } from '../lib/api'

export default function RegistrationForm({ onRegistered, onNavigate }) {
  const [form, setForm] = React.useState({
  name: '',
  email: '',
  password: '',
  confirm: ''
})
  const [status, setStatus] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
  e.preventDefault()

  if (form.password !== form.confirm) {
    setStatus('Passwords do not match.')
    return
  }

  setLoading(true)
  setStatus('Creating your account...')

  try {
    await register(form)
    setStatus('')
    if (onRegistered) onRegistered()
  } catch (error) {
    setStatus(error.message || 'Registration failed.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="auth-layout">
      <section className="auth-hero panel">
        <span className="eyebrow">Join the team</span>
        <h1>Set up the collaborative workspace for any project.</h1>
        <p>
          Register once and start managing the dashboard, task board, notes, members,
          and activity stream.
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
          <span className="status-dot">Live demo</span>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
          </div>

          <div className="form-grid two-col">
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={e => update('password', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Confirm password</label>
              <input type="password" value={form.confirm} onChange={e => update('confirm', e.target.value)} required />
            </div>
          </div>

          <label className="terms-row">
            <input type="checkbox" required />
            <span>I agree to the terms and privacy policy</span>
          </label>

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          {status && <p className="hint">{status}</p>}

          <div className="auth-links">
            <button type="button" className="text-link" onClick={() => onNavigate('login')}>
              Back to login
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
