import React, { useEffect, useMemo, useState } from 'react'
import { getActivityLogs, getTasks } from '../lib/api'
import DashboardLayout from './DashboardLayout'
import './ActivityLog.css'

const ACTION_LABELS = {
  task_created: 'Created task',
  task_moved: 'Moved task',
  task_completed: 'Completed task',
  task_deleted: 'Deleted task',
  member_joined: 'Member joined',
  project_created: 'Created project',
  note_created: 'Created note',
}

function actionLabel(action) {
  return ACTION_LABELS[action] || action
}

function formatTimestamp(ts) {
  const d = new Date(ts)
  return isNaN(d.getTime()) ? ts : d.toLocaleString()
}

export default function ActivityLog({ workspaceId, onNavigate }) {
  const [activity, setActivity] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [filterDate, setFilterDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!workspaceId) return

    async function load() {
      try {
        setLoading(true)
        setError('')

        const [activityResult, taskResult] = await Promise.all([
          getActivityLogs(workspaceId, { per_page: 100 }),
          getTasks(workspaceId),
        ])

        setActivity(activityResult.data?.data || [])
        setTasks(taskResult.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load activity.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [workspaceId])

  const displayed = useMemo(() => {
    return activity
      .filter(item => selectedTaskId === null ||
        (item.entity_type === 'task' && item.entity_id === selectedTaskId))
      .filter(item => !filterDate || (item.created_at || '').startsWith(filterDate))
  }, [activity, selectedTaskId, filterDate])

  const selectedTask = selectedTaskId !== null
    ? tasks.find(t => t.id === selectedTaskId)
    : null

  return (
    <DashboardLayout activeNav="activity" onNavigate={onNavigate} workspaceId={workspaceId}>
      <h1 className="al-heading">Activity Log</h1>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="al-body">
        <aside className="al-task-nav">
          <p className="al-task-nav-label">Tasks</p>

          <button
            className={`al-task-btn${selectedTaskId === null ? ' al-task-btn--active' : ''}`}
            onClick={() => { setSelectedTaskId(null); setFilterDate('') }}
          >
            <span className="al-task-btn-title">All Activity</span>
            <span className="al-task-btn-count">{activity.length}</span>
          </button>

          <div className="al-task-divider" />

          {tasks.length === 0 ? (
            <p className="al-task-empty">No tasks in this workspace.</p>
          ) : (
            tasks.map(task => (
              <button
                key={task.id}
                className={`al-task-btn${selectedTaskId === task.id ? ' al-task-btn--active' : ''}`}
                onClick={() => { setSelectedTaskId(task.id); setFilterDate('') }}
              >
                <span className="al-task-btn-title">{task.title}</span>
              </button>
            ))
          )}
        </aside>

        <div className="al-content">
          <div className="al-content-header">
            <h2 className="al-sub-heading">{selectedTask ? selectedTask.title : 'All Activity'}</h2>
            <div className="al-filter-bar">
              <input
                type="date"
                className="al-date-input"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                aria-label="Filter by date"
              />
              {filterDate && (
                <button className="ghost-btn" onClick={() => setFilterDate('')}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="al-empty">Loading activity…</div>
          ) : displayed.length === 0 ? (
            <div className="al-empty">
              {filterDate ? 'No activity found for this date.' : 'No activity yet.'}
            </div>
          ) : (
            <div className="al-list">
              <div className="al-list-header">
                <span>Action</span>
                <span>Details</span>
                <span>User</span>
                <span>Timestamp</span>
              </div>
              {displayed.map(item => (
                <div key={item.id} className="al-row">
                  <div className="al-row-action">{actionLabel(item.action)}</div>
                  <div className="al-row-task">{item.description}</div>
                  <div className="al-row-user">{item.user?.name || '—'}</div>
                  <div className="al-row-time">{formatTimestamp(item.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
