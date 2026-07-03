import React, { useState } from 'react'
import DashboardLayout from './DashboardLayout'
import Workspace from './Workspace'
import './Dashboard.css'

// ── Mock data (replace with real fetch once Laravel is running) ──
const INITIAL_WORKSPACES = [
  { id: 1, name: 'Sprint Q3',     task_count: 8  },
  { id: 2, name: 'Backend API',   task_count: 5  },
  { id: 3, name: 'UI Components', task_count: 12 },
  { id: 4, name: 'Bug Fixes',     task_count: 3  },
]

const MOCK_TASKS = [
  { id: 1, title: 'Implement login page',       status: 'Done',        priority: 'High',   deadline: '2026-06-01', assignee: 'Fariha' },
  { id: 2, title: 'Design dashboard UI',        status: 'In Progress', priority: 'High',   deadline: '2026-06-05', assignee: 'Fariha' },
  { id: 3, title: 'Set up Oracle schema',       status: 'Done',        priority: 'Medium', deadline: '2026-05-28', assignee: 'Dev 2'  },
  { id: 4, title: 'Activity log API endpoint',  status: 'To Do',       priority: 'Medium', deadline: '2026-06-10', assignee: 'Dev 3'  },
  { id: 5, title: 'Write unit tests',           status: 'To Do',       priority: 'Low',    deadline: '2026-06-15', assignee: 'Dev 2'  },
]

function statusClass(status) {
  const s = (status || '').toLowerCase().replace('_', ' ')
  if (s === 'done' || s === 'completed') return 'db-badge db-badge--done'
  if (s === 'in progress')               return 'db-badge db-badge--inprogress'
  return 'db-badge db-badge--todo'
}

function priorityClass(priority) {
  const p = (priority || '').toLowerCase()
  if (p === 'high')   return 'db-badge db-badge--high'
  if (p === 'medium') return 'db-badge db-badge--medium'
  return 'db-badge db-badge--low'
}

function formatDeadline(deadline) {
  const d = new Date(deadline)
  return isNaN(d.getTime()) ? deadline : d.toLocaleDateString()
}

export default function Dashboard({ onNavigate }) {
  const [workspaces, setWorkspaces] = useState(INITIAL_WORKSPACES)
  const [showModal,  setShowModal]  = useState(false)

  const handleDelete = (id) => {
    if (!window.confirm('Delete this workspace?')) return
    setWorkspaces(prev => prev.filter(w => w.id !== id))
  }

  const handleCreated = (newWs) => {
    setWorkspaces(prev => [...prev, newWs])
    setShowModal(false)
  }

  // pass first workspace id so the sidebar Activity link is always enabled
  const firstWsId = workspaces[0]?.id ?? 1
  const deadlineSortedTasks = [...MOCK_TASKS]
    .filter(task => task.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))

  return (
    <DashboardLayout activeNav="dashboard" onNavigate={onNavigate} workspaceId={firstWsId}>
      <p className="db-breadcrumb">FlowBoard &rsaquo; Dashboard</p>

      {/* ── Workspace cards ──────────────────────────────────── */}
      <div className="db-section-header">
        <h2 className="db-section-title">My Workspaces</h2>
        <button className="primary-btn db-new-btn" onClick={() => setShowModal(true)}>
          + New Workspace
        </button>
      </div>

      {workspaces.length === 0 ? (
        <div className="db-empty db-empty--cards">
          No workspaces yet. Click <strong>+ New Workspace</strong> to get started.
        </div>
      ) : (
        <div className="db-cards-grid">
          {workspaces.map(ws => (
            <div key={ws.id} className="db-card">
              <div className="db-card-body">
                <h3 className="db-card-name">{ws.name}</h3>
                <p className="db-card-stat">
                  {ws.task_count ?? 0} task{ws.task_count !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="db-card-actions">
                <button
                  className="ghost-btn db-card-btn"
                  onClick={() => onNavigate('workspace', ws.id)}
                >
                  Open
                </button>
                <button
                  className="ghost-btn db-card-btn db-card-btn--activity"
                  onClick={() => onNavigate('activity', ws.id)}
                >
                  Activity
                </button>
                <button
                  className="db-delete-btn"
                  onClick={() => handleDelete(ws.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Recent Tasks table ───────────────────────────────── */}
      <div className="db-deadline-section">
        <div className="db-section-header db-deadline-header">
          <h2 className="db-section-title">Tasks by Deadline</h2>
          <span className="db-section-count">{deadlineSortedTasks.length}</span>
        </div>

        <div className="db-deadline-list">
          {deadlineSortedTasks.map(task => (
            <div key={task.id} className="db-deadline-item">
              <div className="db-deadline-date">
                <span className="db-deadline-day">
                  {new Date(task.deadline).toLocaleDateString(undefined, { day: '2-digit' })}
                </span>
                <span className="db-deadline-month">
                  {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short' })}
                </span>
              </div>

              <div className="db-deadline-main">
                <span className="db-deadline-title">{task.title}</span>
                <span className="db-deadline-meta">
                  Due {formatDeadline(task.deadline)} · {task.assignee}
                </span>
              </div>

              <span className={priorityClass(task.priority)}>{task.priority}</span>
              <span className={statusClass(task.status)}>{task.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="db-tasks-section">
        <h2 className="db-section-title db-tasks-heading">Recent Tasks</h2>
        <div className="db-table-wrapper">
          <table className="db-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th>Assignee</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TASKS.map((task, i) => (
                <tr key={task.id} className={i % 2 === 0 ? 'db-row--alt' : ''}>
                  <td>
                    <span className={statusClass(task.status)}>{task.status}</span>
                  </td>
                  <td className="db-task-title">{task.title}</td>
                  <td>
                    <span className={priorityClass(task.priority)}>{task.priority}</span>
                  </td>
                  <td className="db-task-meta">
                    {formatDeadline(task.deadline)}
                  </td>
                  <td className="db-task-meta">{task.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create workspace modal ───────────────────────────── */}
      {showModal && (
        <Workspace
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </DashboardLayout>
  )
}
