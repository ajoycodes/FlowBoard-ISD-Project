import React from 'react'
import { requestPasswordReset } from '../lib/api'

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = React.useState('')
const [loading, setLoading] = React.useState(false)
  const [status, setStatus] = React.useState('')

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setStatus('Sending reset instructions...')

  try {
    await requestPasswordReset(email)
    setStatus('If this email is registered, a password reset link has been sent.')
  } catch (error) {
    setStatus(error.message || 'Failed to send reset link. Please try again.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="auth-layout">
      <section className="auth-hero panel">
        <span className="eyebrow">Password recovery</span>
        <h1>Get back into your workspace quickly.</h1>
        <p>
          We will send reset instructions to the email address connected to your FlowBoard account.
        </p>
        <ul className="feature-list">
          <li>Secure reset link with time limit</li>
          <li>Keep your roles and access intact</li>
          <li>Return to the dashboard in minutes</li>
        </ul>
      </section>

      <section className="panel auth-card">
        <div className="card-header">
          <div>
            <span className="eyebrow">Reset</span>
            <h2>Reset your password</h2>
          </div>
          <span className="status-dot">Help</span>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button className="primary-btn" type="submit" disabled={loading}>
  {loading ? 'Sending...' : 'Send reset link'}
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
