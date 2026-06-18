import React, { useEffect, useState } from 'react'
import { getWorkspaces, deleteWorkspace } from '../lib/api'
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
  { id: 5, title: 'Implement login page',       status: 'Done',        priority: 'High',   deadline: '2026-06-01', assignee: 'Fariha' },
  { id: 3, title: 'Design dashboard UI',        status: 'In Progress', priority: 'High',   deadline: '2026-06-05', assignee: 'Fariha' },
  { id: 4, title: 'Set up Oracle schema',       status: 'Done',        priority: 'Medium', deadline: '2026-05-28', assignee: 'Dev 2'  },
  { id: 1, title: 'Activity log API endpoint',  status: 'To Do',       priority: 'Medium', deadline: '2026-06-10', assignee: 'Dev 3'  },
  { id: 2, title: 'Write unit tests',           status: 'To Do',       priority: 'Low',    deadline: '2026-06-15', assignee: 'Dev 2'  },
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

export default function Dashboard({ onNavigate }) {
  const [workspaces, setWorkspaces] = useState([])
const [recentTasks, setRecentTasks] = useState([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
  const [showModal,  setShowModal]  = useState(false)

  const handleDelete = async (id) => {
  if (!window.confirm('Delete this workspace?')) return

  try {
    await deleteWorkspace(id)
    setWorkspaces(prev => prev.filter(w => w.id !== id))
  } catch (error) {
    setError(error.message || 'Failed to delete workspace.')
  }
}

  const handleCreated = (newWs) => {
    setWorkspaces(prev => [...prev, newWs])
    setShowModal(false)
  }

  // pass first workspace id so the sidebar Activity link is always enabled
  const firstWsId = workspaces[0]?.id ?? 1

  useEffect(() => {
  async function loadDashboard() {
    try {
      setLoading(true)
      setError('')

    const result = await getWorkspaces()
    setWorkspaces(result.data || result)
  } catch (error) {
    setWorkspaces(INITIAL_WORKSPACES)
    setError(error.message || 'Failed to load dashboard.')
  } finally {
      setLoading(false)
    }
  }

  loadDashboard()
}, [])

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
                <th>Notes</th>
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
                    {new Date(task.deadline).toLocaleDateString()}
                  </td>
                  <td className="db-task-meta">{task.assignee}</td>
                  <td>
                    <button
                      className="ghost-btn db-card-btn"
                      onClick={() => onNavigate('notes', firstWsId, task.id)}
                    >
                      Notes
                    </button>
                  </td>
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
