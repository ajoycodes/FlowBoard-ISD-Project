import React from 'react'

export default function Register({onNavigate}){
  const [name,setName]=React.useState('')
  const [email,setEmail]=React.useState('')
  const [password,setPassword]=React.useState('')

  const handle = (e)=>{
    e.preventDefault()
    // TODO: call /api/register
    onNavigate('login')
  }

  return (
    <div className="card">
      <h2>Register</h2>
      <form onSubmit={handle}>
        <div className="form-group"><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} required/></div>
        <div className="form-group"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
        <div className="form-group"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
        <div style={{display:'flex',gap:8}}>
          <button type="submit">Create account</button>
          <button type="button" onClick={()=>onNavigate('login')}>Back to login</button>
        </div>
      </form>
    </div>
  )
}
