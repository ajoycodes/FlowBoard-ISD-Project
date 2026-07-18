import React, { useEffect, useState } from 'react'
import { getWorkspaces, getDashboard, deleteWorkspace } from '../lib/api'
import DashboardLayout from './DashboardLayout'
import Workspace from './Workspace'
import './Dashboard.css'

const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
}

export function statusLabel(status) {
  return STATUS_LABELS[status] || status || 'To Do'
}

export function statusClass(status) {
  if (status === 'done') return 'badge badge--done'
  if (status === 'in_progress') return 'badge badge--inprogress'
  if (status === 'review') return 'badge badge--review'
  return 'badge badge--todo'
}

export function priorityClass(priority) {
  const p = (priority || '').toLowerCase()
  if (p === 'high') return 'badge badge--high'
  if (p === 'medium') return 'badge badge--medium'
  return 'badge badge--low'
}

function formatDeadline(deadline) {
  const d = new Date(deadline)
  return isNaN(d.getTime()) ? deadline : d.toLocaleDateString()
}

export default function Dashboard({ onNavigate }) {
  const [workspaces, setWorkspaces] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [deadlineTasks, setDeadlineTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workspace?')) return

    try {
      await deleteWorkspace(id)
      setWorkspaces(prev => prev.filter(w => w.id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete workspace.')
    }
  }

  const handleCreated = (newWs) => {
    setWorkspaces(prev => [...prev, newWs])
    setShowModal(false)
  }

  const firstWsId = workspaces[0]?.id ?? null

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        setError('')

        const [wsResult, dashResult] = await Promise.all([
          getWorkspaces(),
          getDashboard(),
        ])

        setWorkspaces(wsResult.data || [])
        setRecentTasks(dashResult.data?.recent_tasks || [])
        setDeadlineTasks(dashResult.data?.my_tasks_sorted_by_deadline || [])
      } catch (err) {
        setError(err.message || 'Failed to load dashboard.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const deadlineSortedTasks = deadlineTasks.filter(task => task.deadline)

  return (
    <DashboardLayout activeNav="dashboard" onNavigate={onNavigate} workspaceId={firstWsId}>
      <p className="db-breadcrumb">FlowBoard &rsaquo; Dashboard</p>

      {error && <div className="alert alert--error">{error}</div>}

      {/* ── Workspace cards ──────────────────────────────────── */}
      <div className="db-section-header">
        <h2 className="db-section-title">My Workspaces</h2>
        <button className="primary-btn" onClick={() => setShowModal(true)}>
          + New Workspace
        </button>
      </div>

      {loading ? (
        <div className="db-empty">Loading workspaces…</div>
      ) : workspaces.length === 0 ? (
        <div className="db-empty">
          No workspaces yet. Click <strong>+ New Workspace</strong> to get started.
        </div>
      ) : (
        <div className="db-cards-grid">
          {workspaces.map(ws => (
            <div key={ws.id} className="db-card">
              <div className="db-card-body">
                <h3 className="db-card-name">{ws.name}</h3>
                <p className="db-card-stat">
                  {(ws.members?.length ?? 1)} member{(ws.members?.length ?? 1) !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="db-card-actions">
                <button
                  className="primary-btn db-card-open"
                  onClick={() => onNavigate('workspace', ws.id)}
                >
                  Open
                </button>
                <button
                  className="ghost-btn"
                  onClick={() => onNavigate('activity', ws.id)}
                >
                  Activity
                </button>
              </div>
              <button
                className="text-link text-link--danger db-card-delete"
                onClick={() => handleDelete(ws.id)}
              >
                Delete workspace
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── My tasks by deadline ─────────────────────────────── */}
      <div className="db-deadline-section">
        <div className="db-section-header">
          <h2 className="db-section-title">My Tasks by Deadline</h2>
          <span className="db-section-count">{deadlineSortedTasks.length}</span>
        </div>

        {deadlineSortedTasks.length === 0 ? (
          <div className="db-empty">No tasks with deadlines assigned to you.</div>
        ) : (
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
                    Due {formatDeadline(task.deadline)}
                    {task.workspace?.name ? ` · ${task.workspace.name}` : ''}
                  </span>
                </div>

                <span className={priorityClass(task.priority)}>{task.priority || 'low'}</span>
                <span className={statusClass(task.status)}>{statusLabel(task.status)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Recent tasks ─────────────────────────────────────── */}
      <div className="db-tasks-section">
        <h2 className="db-section-title db-tasks-heading">Recent Tasks</h2>

        {recentTasks.length === 0 ? (
          <div className="db-empty">No recent task activity yet.</div>
        ) : (
          <div className="db-table-wrapper">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Deadline</th>
                  <th>Assignee</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <span className={statusClass(task.status)}>{statusLabel(task.status)}</span>
                    </td>
                    <td className="db-task-title">{task.title}</td>
                    <td>
                      <span className={priorityClass(task.priority)}>{task.priority || 'low'}</span>
                    </td>
                    <td className="db-task-meta">
                      {task.deadline ? formatDeadline(task.deadline) : '—'}
                    </td>
                    <td className="db-task-meta">{task.assigned_user?.name || 'Unassigned'}</td>
                    <td>
                      <button
                        className="ghost-btn"
                        onClick={() => onNavigate('workspace', task.workspace_id)}
                      >
                        Open board
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
