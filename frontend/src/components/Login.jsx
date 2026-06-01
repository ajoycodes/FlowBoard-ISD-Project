import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Please enter email and password.');
    setLoading(true);
    try {
      // stubbed auth call
      await new Promise(r => setTimeout(r, 300));
      if (onLogin) onLogin({ email });
    } catch (err) {
      setError('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-panel">
      <h2>Login to FlowBoard</h2>
      {error && <div role="alert" className="login-error">{error}</div>}
      <form className="login-form" onSubmit={submit} aria-labelledby="login-heading">
        <label>
          <span>Email</span>
          <input type="email" aria-label="Email" required value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
          <span>Password</span>
          <input type="password" aria-label="Password" required value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <div className="login-actions">
          <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          <button type="button" className="link-btn" onClick={() => onNavigate && onNavigate('register')}>Create account</button>
          <button type="button" className="link-btn" onClick={() => onNavigate && onNavigate('forgot')}>Forgot password</button>
        </div>
      </form>
    </div>
  );
}
