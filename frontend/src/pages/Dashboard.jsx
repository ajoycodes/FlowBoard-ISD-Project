import React from 'react'
import { createWorkspace, getDashboard } from '../lib/api'

export default function Dashboard({ onNavigate, userName }){
  const [dashboard, setDashboard] = React.useState({ workspaces: [], recentActivity: [] })
  const [form, setForm] = React.useState({ name: '', description: '', deadline: '' })
  const [status, setStatus] = React.useState('')

  React.useEffect(() => {
    let alive = true
    getDashboard().then(data => {
      if(alive){
        setDashboard(data.dashboard)
      }
    })
    return () => { alive = false }
  }, [])

  const handleCreateWorkspace = async (event) => {
    event.preventDefault()
    if(!form.name) return
    setStatus('Creating workspace...')
    const workspace = await createWorkspace(form)
    setStatus(`Created ${workspace.name}`)
    setForm({ name: '', description: '', deadline: '' })
    const refreshed = await getDashboard()
    setDashboard(refreshed.dashboard)
    onNavigate('workspace', { workspaceId: workspace.id })
  }

  return (
    <div className="page-shell">
      <header className="page-hero panel">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Workspace hub for FlowBoard — manage any project</h1>
          <p className="muted">Keep every sprint item visible: project boards, notes, deadlines, members, and activity.</p>
        </div>
        <div className="hero-actions">
          <button className="primary-btn" onClick={() => onNavigate('workspace', { workspaceId: dashboard.workspaces[0]?.id || 'flowboard-core' })}>
            Open workspace
          </button>
          <button className="ghost-btn" onClick={() => onNavigate('login')}>Sign out</button>
        </div>
      </header>

      <section className="stat-grid">
        {[
          { label: 'Workspaces', value: dashboard.workspaces.length, detail: 'Active project spaces' },
          { label: 'Recent updates', value: dashboard.recentActivity.length, detail: 'Latest team activity' },
          { label: 'Board health', value: '68%', detail: 'Average progress across workspaces' },
          { label: 'Team members', value: '3', detail: `Signed in as ${userName}` }
        ].map(stat => (
          <article className="panel stat-card" key={stat.label}>
            <span className="eyebrow">{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.detail}</p>
          </article>
        ))}
      </section>

      <div className="grid-two">
        <section className="panel">
          <div className="card-header">
            <div>
              <span className="eyebrow">Workspaces</span>
              <h2>Projects and deadlines</h2>
            </div>
          </div>

          <div className="workspace-list">
            {dashboard.workspaces.map(workspace => (
              <button className="workspace-card" key={workspace.id} onClick={() => onNavigate('workspace', { workspaceId: workspace.id })}>
                <div>
                  <strong>{workspace.name}</strong>
                  <p>{workspace.description}</p>
                </div>
                <div className="workspace-meta">
                  <span className="pill">{workspace.status}</span>
                  <span>{workspace.progress}%</span>
                  <span>Due {workspace.deadline}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="card-header">
            <div>
              <span className="eyebrow">Quick action</span>
              <h2>Create new workspace</h2>
            </div>
          </div>
          <form className="stack" onSubmit={handleCreateWorkspace}>
            <div className="form-group">
              <label>Workspace name</label>
              <input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="Sprint 1 delivery" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows="4" value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} placeholder="What this workspace is for" />
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <input type="text" value={form.deadline} onChange={event => setForm(current => ({ ...current, deadline: event.target.value }))} placeholder="Jun 20" />
            </div>
            <button className="primary-btn" type="submit">Create workspace</button>
            {status ? <p className="hint">{status}</p> : null}
          </form>
        </section>
      </div>

      <section className="panel">
        <div className="card-header">
          <div>
            <span className="eyebrow">Activity</span>
            <h2>Recent updates</h2>
          </div>
        </div>
        <div className="timeline">
          {dashboard.recentActivity.map(item => (
            <article key={item.id} className="timeline-item">
              <span className="timeline-time">{item.time}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
