import React from 'react'

export default function Login({onNavigate}){
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const handleSubmit = (e)=>{
    e.preventDefault()
    // TODO: call backend /api/login
    // For now navigate to dashboard to preview UI
    onNavigate('dashboard')
  }

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <div style={{display:'flex',gap:8}}>
          <button type="submit">Login</button>
          <button type="button" onClick={()=>onNavigate('register')}>Register</button>
          <button type="button" onClick={()=>onNavigate('forgot')}>Forgot</button>
        </div>
      </form>
    </div>
  )
}
