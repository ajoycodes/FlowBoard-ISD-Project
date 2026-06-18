import React, { useState } from 'react'
import DashboardLayout from './DashboardLayout'
import './ActivityLog.css'

// ── All workspace tasks, each with their own activity log ──────────
// workspaceId is used to label the heading; tasks are shared across
// all mock workspaces for demo purposes.
const WORKSPACE_TASKS = [
  {
    id: 1,
    title: 'Activity log API endpoint',
    assignee: 'Dev 3',
    status: 'To Do',
    activity: [
      { id: 101, action: 'Task created',               user: 'Dev 3',  created_at: '2026-06-04T09:00:00Z' },
      { id: 102, action: 'Priority set to Medium',     user: 'Dev 3',  created_at: '2026-06-04T09:05:00Z' },
      { id: 103, action: 'Deadline set to Jun 10',     user: 'Fariha', created_at: '2026-06-04T09:10:00Z' },
      { id: 104, action: 'Assigned to Dev 3',          user: 'Fariha', created_at: '2026-06-04T09:15:00Z' },
    ],
  },
  {
    id: 2,
    title: 'Write unit tests',
    assignee: 'Dev 2',
    status: 'To Do',
    activity: [
      { id: 201, action: 'Task created',               user: 'Dev 2',  created_at: '2026-06-05T10:00:00Z' },
      { id: 202, action: 'Assigned to Dev 2',          user: 'Fariha', created_at: '2026-06-05T10:05:00Z' },
      { id: 203, action: 'Deadline set to Jun 15',     user: 'Dev 2',  created_at: '2026-06-05T10:10:00Z' },
    ],
  },
  {
    id: 3,
    title: 'Design dashboard UI',
    assignee: 'Fariha',
    status: 'In Progress',
    activity: [
      { id: 301, action: 'Task created',               user: 'Fariha', created_at: '2026-06-02T08:00:00Z' },
      { id: 302, action: 'Priority set to High',       user: 'Fariha', created_at: '2026-06-02T08:05:00Z' },
      { id: 303, action: 'Status moved to In Progress',user: 'Fariha', created_at: '2026-06-03T09:00:00Z' },
      { id: 304, action: 'Deadline updated to Jun 5',  user: 'Dev 3',  created_at: '2026-06-03T11:30:00Z' },
    ],
  },
  {
    id: 4,
    title: 'Set up Oracle schema',
    assignee: 'Dev 2',
    status: 'In Progress',
    activity: [
      { id: 401, action: 'Task created',               user: 'Dev 2',  created_at: '2026-06-01T14:00:00Z' },
      { id: 402, action: 'Schema draft uploaded',       user: 'Dev 2',  created_at: '2026-06-02T10:00:00Z' },
      { id: 403, action: 'Status moved to In Progress',user: 'Dev 2',  created_at: '2026-06-02T10:30:00Z' },
    ],
  },
  {
    id: 5,
    title: 'Implement login page',
    assignee: 'Fariha',
    status: 'Done',
    activity: [
      { id: 501, action: 'Task created',               user: 'Fariha', created_at: '2026-05-28T09:00:00Z' },
      { id: 502, action: 'Priority set to High',       user: 'Fariha', created_at: '2026-05-28T09:05:00Z' },
      { id: 503, action: 'Status moved to In Progress',user: 'Fariha', created_at: '2026-05-29T08:00:00Z' },
      { id: 504, action: 'Status moved to Done',       user: 'Fariha', created_at: '2026-06-01T17:00:00Z' },
      { id: 505, action: 'Task marked as completed',   user: 'Dev 3',  created_at: '2026-06-01T17:10:00Z' },
    ],
  },
  {
    id: 6,
    title: 'Configure Vite project',
    assignee: 'Dev 3',
    status: 'Done',
    activity: [
      { id: 601, action: 'Task created',               user: 'Dev 3',  created_at: '2026-05-20T10:00:00Z' },
      { id: 602, action: 'Vite config committed',      user: 'Dev 3',  created_at: '2026-05-20T11:30:00Z' },
      { id: 603, action: 'Status moved to Done',       user: 'Dev 3',  created_at: '2026-05-20T12:00:00Z' },
    ],
  },
]

// Flatten all activity entries across all tasks (sorted newest-first)
const ALL_ACTIVITY = WORKSPACE_TASKS
  .flatMap(t => t.activity.map(a => ({ ...a, taskTitle: t.title })))
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

function formatTimestamp(ts) {
  const d = new Date(ts)
  return isNaN(d.getTime()) ? ts : d.toLocaleString()
}

const STATUS_COLOR = {
  'To Do':      { bg: '#F9FAFB', color: '#374151', border: '#9CA3AF' },
  'In Progress':{ bg: '#EFF6FF', color: '#1D4ED8', border: '#93C5FD' },
  'Done':       { bg: '#ECFDF5', color: '#065F46', border: '#6EE7B7' },
}

// ── Component ──────────────────────────────────────────────────────
export default function ActivityLog({ workspaceId, taskId: initialTaskId, onNavigate }) {
  // selectedId: null = All Activity, number = specific task id
  const [selectedId, setSelectedId] = useState(initialTaskId ?? null)
  const [filterDate, setFilterDate] = useState('')

  // Entries to display based on selected task
  const baseEntries = selectedId === null
    ? ALL_ACTIVITY
    : (WORKSPACE_TASKS.find(t => t.id === selectedId)?.activity ?? [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  // Apply date filter on top
  const displayed = filterDate
    ? baseEntries.filter(a => a.created_at.startsWith(filterDate))
    : baseEntries

  const selectedTask = selectedId !== null
    ? WORKSPACE_TASKS.find(t => t.id === selectedId)
    : null

  const heading = selectedTask
    ? selectedTask.title
    : 'All Activity'

  return (
    <DashboardLayout activeNav="activity" onNavigate={onNavigate} workspaceId={workspaceId}>

      <h1 className="al-heading">Activity Log</h1>

      <div className="al-body">

        {/* ── Left: task navigation panel ── */}
        <aside className="al-task-nav">
          <p className="al-task-nav-label">Tasks</p>

          {/* All Activity option */}
          <button
            className={`al-task-btn${selectedId === null ? ' al-task-btn--active' : ''}`}
            onClick={() => { setSelectedId(null); setFilterDate('') }}
          >
            <span className="al-task-btn-title">All Activity</span>
            <span className="al-task-btn-count">{ALL_ACTIVITY.length}</span>
          </button>

          <div className="al-task-divider" />

          {/* Individual tasks */}
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

        {/* ── Right: activity entries ── */}
        <div className="al-content">

          {/* Sub-heading + date filter */}
          <div className="al-content-header">
            <h2 className="al-sub-heading">{heading}</h2>
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

          {/* Task meta chip (shown when a single task is selected) */}
          {selectedTask && (
            <div className="al-task-meta">
              <span className="al-meta-chip al-meta-assignee">
                &#128100; {selectedTask.assignee}
              </span>
              <span
                className="al-meta-chip"
                style={{
                  background: STATUS_COLOR[selectedTask.status]?.bg,
                  color:      STATUS_COLOR[selectedTask.status]?.color,
                  border:     `1px solid ${STATUS_COLOR[selectedTask.status]?.border}`,
                }}
              >
                {selectedTask.status}
              </span>
            </div>
          )}

          {/* Activity list */}
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
