import React from 'react'
import { requestPasswordReset } from '../lib/api'

export default function ForgotPassword({ onNavigate }){
  const [email, setEmail] = React.useState('fariha@flowboard.local')
  const [status, setStatus] = React.useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('Sending reset instructions...')
    await requestPasswordReset(email)
    setStatus('Reset email ready. Check your inbox in the real app.')
  }

  return (
    <div className="auth-layout single-column">
      <section className="panel auth-card wide-card">
        <span className="eyebrow">Password recovery</span>
        <h1>Reset your password</h1>
        <p className="muted">Use the email address connected to your workspace account.</p>

        <form className="stack" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={event => setEmail(event.target.value)} required />
          </div>
          <button className="primary-btn" type="submit">Send reset link</button>
          {status ? <p className="hint">{status}</p> : null}
          <button type="button" className="ghost-btn full" onClick={() => onNavigate('login')}>Back to login</button>
        </form>
      </section>
    </div>
  )
}
