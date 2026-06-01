import React, { useState } from 'react';
import './RegistrationForm.css';

export default function RegistrationForm({ onRegistered }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const validate = () => {
    if (!form.name || !form.email || !form.password || !form.confirm) {
      return 'Please fill all required fields.';
    }
    if (form.password !== form.confirm) return 'Passwords do not match.';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) return 'Please enter a valid email.';
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const v = validate();
    if (v) return setError(v);
    setSubmitting(true);
    try {
      // Minimal stub for registration action; adapt to app API.
      await new Promise(r => setTimeout(r, 400));
      if (onRegistered) onRegistered({ ...form });
    } catch (err) {
      setError('Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="registration-form" onSubmit={onSubmit} aria-labelledby="register-heading">
      <h2 id="register-heading">Create your account</h2>
      {error && <div role="alert" className="rf-error">{error}</div>}
      <div className="rf-grid">
        <label>
          <span>Name</span>
          <input aria-label="Full name" required value={form.name} onChange={e => update('name', e.target.value)} />
        </label>
        <label>
          <span>Role</span>
          <input aria-label="Role" value={form.role} onChange={e => update('role', e.target.value)} />
        </label>
        <label>
          <span>Email</span>
          <input aria-label="Email address" type="email" required value={form.email} onChange={e => update('email', e.target.value)} />
        </label>
        <label>
          <span>Password</span>
          <input aria-label="Password" type="password" required value={form.password} onChange={e => update('password', e.target.value)} />
        </label>
        <label>
          <span>Confirm password</span>
          <input aria-label="Confirm password" type="password" required value={form.confirm} onChange={e => update('confirm', e.target.value)} />
        </label>
        <label className="rf-terms">
          <input aria-label="Agree to terms" type="checkbox" required />
          <span>I agree to the terms</span>
        </label>
      </div>
      <div className="rf-actions">
        <button type="submit" className="primary-btn" disabled={submitting}>{submitting ? 'Creating account...' : 'Create account'}</button>
      </div>
    </form>
  );
}
