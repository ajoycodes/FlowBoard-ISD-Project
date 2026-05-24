import React from 'react'

export default function ForgotPassword({onNavigate}){
  const [email,setEmail]=React.useState('')
  const handle = (e)=>{
    e.preventDefault()
    // TODO: call /api/password/reset
    onNavigate('login')
  }

  return (
    <div className="card">
      <h2>Reset password</h2>
      <form onSubmit={handle}>
        <div className="form-group"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
        <div style={{display:'flex',gap:8}}>
          <button type="submit">Send reset link</button>
          <button type="button" onClick={()=>onNavigate('login')}>Back to login</button>
        </div>
      </form>
    </div>
  )
}
