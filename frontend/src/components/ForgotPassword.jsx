import React, { useState } from 'react';
import './ForgotPassword.css';

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!email) return setMessage('Please enter your email.');
    setLoading(true);
    try {
      // stubbed API call
      await new Promise(r => setTimeout(r, 400));
      setMessage('If that email exists, a reset link has been sent.');
    } catch (err) {
      setMessage('Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-panel">
      <h2>Reset your password</h2>
      {message && <div role="status" className="fp-message">{message}</div>}
      <form className="forgot-form" onSubmit={submit}>
        <label>
          <span>Email</span>
          <input type="email" aria-label="Email" required value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <div className="fp-actions">
          <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
          <button type="button" className="link-btn" onClick={() => onNavigate && onNavigate('login')}>Back to login</button>
        </div>
      </form>
    </div>
  );
}
import React, { useState } from 'react';
import './ForgotPassword.css';

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setStatus('Sending reset link...');
    await new Promise(r => setTimeout(r, 400));
    setStatus('Reset link sent to ' + email);
  };

  return (
    <div className="forgot-panel">
      <h2>Reset your password</h2>
      {status && <div className="fp-status" role="status">{status}</div>}
      <form className="forgot-form" onSubmit={submit}>
        <label>
          <span>Email</span>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <div className="fp-actions">
          <button type="submit" className="primary-btn">Send reset link</button>
          <button type="button" className="link-btn" onClick={() => onNavigate && onNavigate('login')}>Back to login</button>
        </div>
      </form>
    </div>
  );
}
