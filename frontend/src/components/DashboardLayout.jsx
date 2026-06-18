import React, { useState } from 'react'
import { logout } from '../lib/api'
import './DashboardLayout.css'

export default function DashboardLayout({ children, activeNav, onNavigate, workspaceId }) {
  const wsId    = workspaceId ?? 1
  const username = localStorage.getItem('username') || 'User'
  const initials = username.slice(0, 1).toUpperCase()
  const role = localStorage.getItem('role') || 'Member'

  // Simple user-menu dropdown toggle
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
  await logout()
  setMenuOpen(false)
  onNavigate('login')
}

  return (
    <div className="dl-root">

      {/* ── Navbar ── */}
      <nav className="dl-navbar">
        <span className="dl-brand">FlowBoard</span>

        <div className="dl-navbar-right">

          {/* User pill with dropdown */}
          <div className="dl-user-wrapper">
            <button
              className="dl-user-pill"
              onClick={() => setMenuOpen(o => !o)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <span className="dl-user-avatar">{initials}</span>
              <span className="dl-user-name">{username}</span>
              <span className="dl-user-caret" aria-hidden="true">&#9662;</span>
            </button>

            {menuOpen && (
              <>
                {/* backdrop to close on outside-click */}
                <div className="dl-menu-backdrop" onClick={() => setMenuOpen(false)} />
                <div className="dl-user-menu" role="menu">
                  <div className="dl-menu-info">
                    <span className="dl-menu-name">{username}</span>
                    <span className="dl-menu-role">{role}</span>
                  </div>
                  <div className="dl-menu-divider" />
                  <button
                    className="dl-menu-item dl-menu-item--danger"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    &#10148; Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Standalone Logout button */}
          <button className="dl-logout-btn" onClick={handleLogout}>Logout</button>

        </div>
      </nav>

      {/* ── Body ── */}
      <div className="dl-body">

        {/* Sidebar */}
        <aside className="dl-sidebar">
          <nav className="dl-sidenav" aria-label="Main navigation">

            <button
              className={`dl-navlink${activeNav === 'dashboard' ? ' dl-navlink--active' : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              <span className="dl-navicon" aria-hidden="true">&#9635;</span>
              Dashboard
            </button>

            <button
              className={`dl-navlink${activeNav === 'activity' ? ' dl-navlink--active' : ''}`}
              onClick={() => onNavigate('activity', wsId)}
            >
              <span className="dl-navicon" aria-hidden="true">&#9776;</span>
              Activity
            </button>

            <button
              className={`dl-navlink${activeNav === 'notes' ? ' dl-navlink--active' : ''}`}
              onClick={() => onNavigate('notes', wsId)}
            >
              <span className="dl-navicon" aria-hidden="true">&#9998;</span>
              Notes
            </button>

          </nav>
        </aside>

        {/* Main content */}
        <main className="dl-main">
          {children}
        </main>

      </div>
    </div>
  )
}
