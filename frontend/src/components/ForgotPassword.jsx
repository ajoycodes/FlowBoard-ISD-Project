import React from 'react'
import { requestPasswordReset } from '../lib/api'

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = React.useState('fariha@flowboard.local')
  const [status, setStatus] = React.useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Sending reset instructions...')
    await requestPasswordReset(email)
    setStatus('Reset email ready. Check your inbox in the real app.')
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
          <button className="primary-btn" type="submit">Send reset link</button>
          {status && <p className="hint">{status}</p>}
          <button type="button" className="ghost-btn full" onClick={() => onNavigate('login')}>
            Back to login
          </button>
        </form>
      </section>
    </div>
  )
}
