import React, { useEffect, useState } from 'react'
import { getTasks, getActivityLogs } from '../lib/api'
import DashboardLayout from './DashboardLayout'
import './ActivityLog.css'


const [tasks, setTasks] = useState([])
const [activity, setActivity] = useState([])
const [selectedId, setSelectedId] = useState(initialTaskId ?? null)
const [filterDate, setFilterDate] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

useEffect(() => {
  async function loadTasks() {
    try {
      const result = await getTasks(workspaceId)
      setTasks(result.data || result)
    } catch (error) {
      setError(error.message || 'Failed to load task list.')
    }
  }

  if (workspaceId) loadTasks()
}, [workspaceId])

useEffect(() => {
  async function loadActivityLogs() {
    try {
      setLoading(true)
      setError('')

      const params = {}
      if (selectedId) params.task_id = selectedId
      if (filterDate) params.date = filterDate

      const result = await getActivityLogs(workspaceId, params)
      setActivity(result.data || result)
    } catch (error) {
      setError(error.message || 'Failed to load activity logs.')
    } finally {
      setLoading(false)
    }
  }

  if (workspaceId) loadActivityLogs()
}, [workspaceId, selectedId, filterDate])

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
            <span className="al-task-btn-count">{activity.length}</span>
          </button>

          <div className="al-task-divider" />

          {/* Individual tasks */}
          {tasks.map(task => {
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
              {activity.map((item, i) => (
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
