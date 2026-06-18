import React, { useMemo, useState } from 'react'
import DashboardLayout from './DashboardLayout'
import './ActivityLog.css'

const WORKSPACE_TASKS = [
  { id: 1, title: 'Implement login page', status: 'Done', assignee: 'Fariha' },
  { id: 2, title: 'Design dashboard UI', status: 'In Progress', assignee: 'Fariha' },
  { id: 3, title: 'Activity log API endpoint', status: 'To Do', assignee: 'Dev 3' },
]

const ACTIVITY = [
  { id: 1, task_id: 1, taskTitle: 'Implement login page', action: 'Completed task', user: 'Fariha', created_at: '2026-06-01T10:20:00' },
  { id: 2, task_id: 2, taskTitle: 'Design dashboard UI', action: 'Moved to In Progress', user: 'Fariha', created_at: '2026-06-05T14:10:00' },
  { id: 3, task_id: 3, taskTitle: 'Activity log API endpoint', action: 'Created task', user: 'Dev 3', created_at: '2026-06-10T09:45:00' },
]

const STATUS_COLOR = {
  'To Do': { bg: '#F9FAFB', color: '#374151', border: '#9CA3AF' },
  'In Progress': { bg: '#EFF6FF', color: '#1D4ED8', border: '#93C5FD' },
  Done: { bg: '#ECFDF5', color: '#065F46', border: '#6EE7B7' },
}

function formatTimestamp(ts) {
  const d = new Date(ts)
  return isNaN(d.getTime()) ? ts : d.toLocaleString()
}

export default function ActivityLog({ workspaceId, taskId: initialTaskId, onNavigate }) {
  const [selectedId, setSelectedId] = useState(initialTaskId ?? null)
  const [filterDate, setFilterDate] = useState('')

  const displayed = useMemo(() => {
    return ACTIVITY
      .filter(item => selectedId === null || item.task_id === selectedId)
      .filter(item => !filterDate || item.created_at.startsWith(filterDate))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [selectedId, filterDate])

  const selectedTask = selectedId !== null
    ? WORKSPACE_TASKS.find(t => t.id === selectedId)
    : null

  return (
    <DashboardLayout activeNav="activity" onNavigate={onNavigate} workspaceId={workspaceId}>
      <h1 className="al-heading">Activity Log</h1>

      <div className="al-body">
        <aside className="al-task-nav">
          <p className="al-task-nav-label">Tasks</p>

          <button
            className={`al-task-btn${selectedId === null ? ' al-task-btn--active' : ''}`}
            onClick={() => { setSelectedId(null); setFilterDate('') }}
          >
            <span className="al-task-btn-title">All Activity</span>
            <span className="al-task-btn-count">{ACTIVITY.length}</span>
          </button>

          <div className="al-task-divider" />

          {WORKSPACE_TASKS.map(task => {
            const sc = STATUS_COLOR[task.status] || STATUS_COLOR['To Do']
            return (
              <button
                key={task.id}
                className={`al-task-btn${selectedId === task.id ? ' al-task-btn--active' : ''}`}
                onClick={() => { setSelectedId(task.id); setFilterDate('') }}
              >
                <span className="al-task-btn-title">{task.title}</span>
                <span
                  className="al-task-status-dot"
                  style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                >
                  {task.status}
                </span>
              </button>
            )
          })}
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
                <button className="ghost-btn al-btn" onClick={() => setFilterDate('')}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {selectedTask && (
            <div className="al-task-meta">
              <span className="al-meta-chip al-meta-assignee">{selectedTask.assignee}</span>
              <span className="al-meta-chip">{selectedTask.status}</span>
            </div>
          )}

          {displayed.length === 0 ? (
            <div className="al-empty">
              {filterDate ? 'No activity found for this date.' : 'No activity yet.'}
            </div>
          ) : (
            <div className="al-list">
              <div className="al-list-header">
                <span>Action</span>
                {selectedId === null && <span className="al-col-task">Task</span>}
                <span>User</span>
                <span>Timestamp</span>
              </div>
              {displayed.map((item, i) => (
                <div
                  key={item.id}
                  className={`al-row${i % 2 === 0 ? ' al-row--alt' : ''}${selectedId === null ? ' al-row--wide' : ''}`}
                >
                  <div className="al-row-action">{item.action}</div>
                  {selectedId === null && (
                    <div className="al-row-task">{item.taskTitle}</div>
                  )}
                  <div className="al-row-user">{item.user}</div>
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
