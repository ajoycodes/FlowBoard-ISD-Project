import React, { useState } from 'react'
import Login           from './components/Login'
import RegistrationForm from './components/RegistrationForm'
import ForgotPassword  from './components/ForgotPassword'
import Dashboard       from './components/Dashboard'
import TaskBoard       from './components/TaskBoard'
import ActivityLog     from './components/ActivityLog'

// ── Auth shell wrapper ────────────────────────────────────────────
function AuthShell({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-a" />
      <div className="auth-orb auth-orb-b" />
      <div className="auth-shell">
        <div className="auth-intro">
          <div className="auth-badge">FlowBoard</div>
          <p className="auth-subtitle">Collaborative task management for your team.</p>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  const [route, setRoute] = useState({ page: 'login', workspaceId: null })

  // navigate('login') | navigate('dashboard') | navigate('workspace', id) …
  const navigate = (page, workspaceId = null) => setRoute({ page, workspaceId })

  const { page, workspaceId } = route

  // ── Dashboard pages ──
  if (page === 'dashboard') return <Dashboard  onNavigate={navigate} />
  if (page === 'workspace') return <TaskBoard  workspaceId={workspaceId} onNavigate={navigate} />
  if (page === 'activity')  return <ActivityLog workspaceId={workspaceId} onNavigate={navigate} />

  // ── Auth pages ──
  return (
    <AuthShell>
      {page === 'register' && (
        <RegistrationForm
          onRegistered={() => navigate('dashboard')}
          onNavigate={navigate}
        />
      )}
      {page === 'forgot' && (
        <ForgotPassword onNavigate={navigate} />
      )}
      {/* default → login */}
      {(page === 'login' || !['register', 'forgot'].includes(page)) && (
        <Login
          onLogin={() => navigate('dashboard')}
          onNavigate={navigate}
        />
      )}
    </AuthShell>
  )
}
