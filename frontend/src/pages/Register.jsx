import React from 'react'
import { register } from '../lib/api'

export default function Register({ onNavigate }){
  const [form, setForm] = React.useState({
    name: 'Fariha',
    email: 'fariha@flowboard.local',
    password: 'flowboard123',
    role: 'Frontend Developer'
  })
  const [status, setStatus] = React.useState('')

  const update = (field, value) => setForm(current => ({ ...current, [field]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('Creating your account...')
    await register(form)
    onNavigate('dashboard')
  }

  return (
    <div className="auth-layout">
      <section className="panel auth-hero accent">
        <span className="eyebrow">Join the team</span>
        <h1>Set up the collaborative workspace for any project.</h1>
        <p>
          Register once and start managing the dashboard, task board, notes, members, and activity stream.
        </p>
        <div className="stat-row">
          <div><strong>3</strong><span>Team members</span></div>
          <div><strong>7</strong><span>Project modules</span></div>
          <div><strong>2</strong><span>Branch streams</span></div>
        </div>
      </section>

      <section className="panel auth-card">
        <div className="card-header">
          <div>
            <span className="eyebrow">Register</span>
            <h2>Create your account</h2>
          </div>
        </div>
        <form className="stack" onSubmit={handleSubmit}>
          <div className="form-grid two-col">
            <div className="form-group"><label>Name</label><input value={form.name} onChange={event => update('name', event.target.value)} required /></div>
            <div className="form-group"><label>Role</label><input value={form.role} onChange={event => update('role', event.target.value)} required /></div>
          </div>
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={event => update('email', event.target.value)} required /></div>
          <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={event => update('password', event.target.value)} required /></div>
          <button className="primary-btn" type="submit">Create account</button>
          {status ? <p className="hint">{status}</p> : null}
          <button type="button" className="ghost-btn full" onClick={() => onNavigate('login')}>Back to login</button>
        </form>
      </section>
    </div>
  )
}
