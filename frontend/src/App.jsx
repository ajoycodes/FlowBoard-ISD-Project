import React, { useState } from 'react';
import Login from './components/Login';
import RegistrationForm from './components/RegistrationForm';
import ForgotPassword from './components/ForgotPassword';
import './App.css';

export default function App() {
  const [route, setRoute] = useState('login');

  const navigate = (r) => setRoute(r);

  const handleLogin = (user) => {
    // placeholder: on successful login navigate to dashboard
    console.log('logged in', user);
    navigate('dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-a" />
      <div className="auth-orb auth-orb-b" />
      <div className="auth-shell">
        <div className="auth-intro">
          <div className="auth-badge">FlowBoard Auth</div>
          <p className="auth-subtitle">A cleaner, brighter onboarding flow.</p>
        </div>
        {route === 'login' && <Login onLogin={handleLogin} onNavigate={navigate} />}
        {route === 'register' && <RegistrationForm onRegistered={() => navigate('dashboard')} onNavigate={navigate} />}
        {route === 'forgot' && <ForgotPassword onNavigate={navigate} />}
        {route === 'dashboard' && <div className="dashboard-stub"><h2>Dashboard (stub)</h2></div>}
      </div>
    </div>
  );
}
