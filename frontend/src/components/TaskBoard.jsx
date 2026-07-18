import React, { useEffect, useState } from 'react'
import {
  getWorkspace,
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getInvitations,
  sendInvitation,
  deleteInvitation,
} from '../lib/api'
import './TaskBoard.css'

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' },
]

const FILTER_TABS = ['All Tasks', 'Assigned to Me', 'High Priority', 'In Progress', 'Completed']

function priorityClass(priority) {
  const p = (priority || '').toLowerCase()
  if (p === 'high') return 'badge badge--high'
  if (p === 'medium') return 'badge badge--medium'
  return 'badge badge--low'
}

function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return isNaN(d) ? dateStr : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function applyFilter(tasks, tab, search, username) {
  let result = [...tasks]

  if (tab === 'Assigned to Me') result = result.filter(t => t.assigned_user?.name === username)
  if (tab === 'High Priority') result = result.filter(t => (t.priority || '').toLowerCase() === 'high')
  if (tab === 'In Progress') result = result.filter(t => t.status === 'in_progress')
  if (tab === 'Completed') result = result.filter(t => t.status === 'done')

  if (search.trim()) {
    const q = search.trim().toLowerCase()
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.assigned_user?.name || '').toLowerCase().includes(q) ||
      (t.priority || '').toLowerCase().includes(q)
    )
  }

  return result
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function InviteMemberModal({ workspaceId, members, onClose }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInvitations(workspaceId)
      .then(result => setInvites(result.data || []))
      .catch(err => setError(err.message || 'Failed to load invitations.'))
      .finally(() => setLoading(false))
  }, [workspaceId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextEmail = email.trim().toLowerCase()

    if (!nextEmail) {
      setError('Email address is required.')
      return
    }

    if (!isValidEmail(nextEmail)) {
      setError('Enter a valid email address.')
      return
    }

    try {
      const result = await sendInvitation(workspaceId, nextEmail)
      setInvites(prev => [result.data, ...prev.filter(i => i.id !== result.data.id)])
      setEmail('')
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to send invitation.')
    }
  }

  const handleRemove = async (invite) => {
    if (!window.confirm(`Remove the invitation for ${invite.email}?`)) return

    try {
      await deleteInvitation(workspaceId, invite.id)
      setInvites(prev => prev.filter(item => item.id !== invite.id))
    } catch (err) {
      setError(err.message || 'Failed to remove invitation.')
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal invite-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title">
        <h2 id="invite-title" className="modal-title">Invite Member</h2>

        <form className="stack" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="invite-email">Email address</label>
            <div className="invite-email-row">
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="teammate@example.com"
                autoFocus
              />
              <button type="submit" className="primary-btn">Send Invite</button>
            </div>
          </div>

          {error && <p className="hint hint--error">{error}</p>}

          <div className="invite-list">
            <div className="invite-list-header">
              <span>Members</span>
              <span>{members.length}</span>
            </div>
            {members.map(member => (
              <div key={member.id} className="invite-row">
                <span className="invite-avatar">{initials(member.name)}</span>
                <span className="invite-email">{member.name} · {member.email}</span>
                <span className="invite-status invite-status--accepted">Member</span>
              </div>
            ))}

            <div className="invite-list-header">
              <span>Invitations</span>
              <span>{invites.length}</span>
            </div>
            {loading ? (
              <p className="invite-empty">Loading…</p>
            ) : invites.length === 0 ? (
              <p className="invite-empty">No pending invitations.</p>
            ) : (
              invites.map(invite => (
                <div key={invite.id} className="invite-row">
                  <span className="invite-avatar">{invite.email[0].toUpperCase()}</span>
                  <span className="invite-email">{invite.email}</span>
                  <span className={`invite-status invite-status--${invite.status}`}>
                    {invite.status}
                  </span>
                  <button
                    type="button"
                    className="ghost-btn ghost-btn--danger"
                    onClick={() => handleRemove(invite)}
                    aria-label={`Remove ${invite.email}`}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>Close</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TaskFormModal({ mode, initialValues, members, onClose, onSubmit, onDelete }) {
  const [form, setForm] = useState(initialValues)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Task title is required.')
      return
    }

    try {
      setSaving(true)
      await onSubmit({
        title: form.title.trim(),
        description: form.description || null,
        priority: form.priority,
        deadline: form.deadline || null,
        status: form.status,
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      })
    } catch (err) {
      setError(err.message || `Failed to ${mode === 'add' ? 'create' : 'save'} task.`)
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <h2 id="task-modal-title" className="modal-title">
          {mode === 'add' ? 'Add New Task' : 'Edit Task'}
        </h2>

        <form className="stack" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="tb-title">Task title</label>
            <input
              id="tb-title"
              type="text"
              value={form.title}
              onChange={e => { set('title', e.target.value); setError('') }}
              placeholder="e.g. Build auth middleware"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="tb-desc">Description</label>
            <textarea
              id="tb-desc"
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Optional details..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tb-priority">Priority</label>
              <select
                id="tb-priority"
                value={form.priority}
                onChange={e => set('priority', e.target.value)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tb-status">Column</label>
              <select
                id="tb-status"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tb-deadline">Deadline</label>
              <input
                id="tb-deadline"
                type="date"
                value={form.deadline}
                onChange={e => set('deadline', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tb-assignee">Assignee</label>
              <select
                id="tb-assignee"
                value={form.assigned_to}
                onChange={e => set('assigned_to', e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="hint hint--error">{error}</p>}

          <div className="modal-actions modal-actions--split">
            {mode === 'edit' ? (
              <button type="button" className="text-link text-link--danger" onClick={onDelete}>
                Delete task
              </button>
            ) : <span />}

            <div className="modal-actions-right">
              <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? 'Saving…' : mode === 'add' ? 'Create Task' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function TaskCard({ task, onMove, onEdit }) {
  const colIndex = COLUMNS.findIndex(c => c.key === task.status)
  const prevCol = colIndex > 0 ? COLUMNS[colIndex - 1] : null
  const nextCol = colIndex >= 0 && colIndex < COLUMNS.length - 1 ? COLUMNS[colIndex + 1] : null
  const isOverdue = task.deadline && task.status !== 'done' &&
    new Date(task.deadline) < new Date(new Date().toDateString())

  return (
    <div className="task-card">
      <div className="task-card-top">
        <span className={priorityClass(task.priority)}>{task.priority || 'low'}</span>
        <span className="task-avatar" title={task.assigned_user?.name || 'Unassigned'}>
          {initials(task.assigned_user?.name)}
        </span>
      </div>

      <button className="task-title-btn" onClick={() => onEdit(task)}>
        {task.title}
      </button>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {task.deadline && (
        <span className={`task-deadline-chip${isOverdue ? ' task-deadline-chip--overdue' : ''}`}>
          Due {fmtDate(task.deadline)}
        </span>
      )}

      <div className="task-footer">
        <button
          className="icon-btn"
          onClick={() => onEdit(task)}
          title="Edit task"
        >
          Edit
        </button>

        <div className="task-move-group">
          {prevCol && (
            <button
              className="icon-btn"
              onClick={() => onMove(task, prevCol.key)}
              aria-label={`Move to ${prevCol.label}`}
              title={`Move to ${prevCol.label}`}
            >
              &larr;
            </button>
          )}
          {nextCol && (
            <button
              className="icon-btn icon-btn--accent"
              onClick={() => onMove(task, nextCol.key)}
              aria-label={`Move to ${nextCol.label}`}
              title={`Move to ${nextCol.label}`}
            >
              &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TaskBoard({ workspaceId, onNavigate }) {
  const username = localStorage.getItem('username') || 'User'
  const [workspace, setWorkspace] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('All Tasks')
  const [search, setSearch] = useState('')
  const [taskModal, setTaskModal] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  const members = workspace?.members || []
  const visibleTasks = applyFilter(tasks, activeTab, search, username)

  useEffect(() => {
    if (!workspaceId) return

    async function load() {
      try {
        setLoading(true)
        setError('')

        const [wsResult, taskResult] = await Promise.all([
          getWorkspace(workspaceId),
          getTasks(workspaceId),
        ])

        setWorkspace(wsResult.data)
        setTasks(taskResult.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load the task board.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [workspaceId])

  const replaceTask = (updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t))
  }

  const handleAdd = async (payload) => {
    const result = await createTask(workspaceId, payload)
    const created = result.data

    // Refresh so assigned_user relation is populated
    const taskResult = await getTasks(workspaceId)
    setTasks(taskResult.data || (created ? [created] : []))
    setTaskModal(null)
  }

  const handleEditSubmit = async (task, payload) => {
    const result = await updateTask(task.id, payload)
    const member = payload.assigned_to ? members.find(m => m.id === payload.assigned_to) : null
    replaceTask({
      ...task,
      ...result.data,
      assigned_user: member ? { id: member.id, name: member.name } : null,
    })
    setTaskModal(null)
  }

  const handleMove = async (task, newStatus) => {
    const previous = task.status
    replaceTask({ ...task, status: newStatus })

    try {
      await updateTaskStatus(task.id, newStatus)
    } catch (err) {
      replaceTask({ ...task, status: previous })
      setError(err.message || 'Failed to move task.')
    }
  }

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return

    try {
      await deleteTask(task.id)
      setTasks(prev => prev.filter(t => t.id !== task.id))
      setTaskModal(null)
    } catch (err) {
      setError(err.message || 'Failed to delete task.')
    }
  }

  const wsName = workspace?.name || `Workspace #${workspaceId ?? ''}`

  return (
    <div className="board-page">
      <nav className="board-navbar">
        <span className="board-brand">FlowBoard</span>
        <div className="board-navbar-right">
          <button
            className="board-nav-pill"
            onClick={() => onNavigate && onNavigate('dashboard')}
          >
            &larr; Dashboard
          </button>
          <button
            className="board-nav-pill"
            onClick={() => onNavigate && onNavigate('activity', workspaceId)}
          >
            Activity Log
          </button>
          <button
            className="board-nav-pill"
            onClick={() => onNavigate && onNavigate('notes', workspaceId)}
          >
            Notes
          </button>
          <button
            className="board-nav-pill board-nav-pill--invite"
            onClick={() => setInviteOpen(true)}
          >
            Invite Member
          </button>
        </div>
      </nav>

      <div className="board-content">
        <p className="board-breadcrumb">FlowBoard &rsaquo; {wsName} &rsaquo; Board</p>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="board-filter-bar">
          <div className="board-filter-top">
            <div className="board-tabs" role="tablist">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`board-tab${activeTab === tab ? ' board-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              className="primary-btn"
              onClick={() => setTaskModal({ mode: 'add', defaultStatus: 'todo' })}
            >
              + Add Task
            </button>
          </div>

          <div className="board-search-row">
            <input
              type="search"
              className="board-search"
              placeholder="Search tasks by title, assignee or priority..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search tasks"
            />
          </div>
        </div>

        {loading ? (
          <div className="db-empty">Loading tasks…</div>
        ) : (
          <div className="board-columns">
            {COLUMNS.map(col => {
              const colTasks = visibleTasks.filter(t => t.status === col.key)
              return (
                <div key={col.key} className="board-column">
                  <div className="board-column-header">
                    <span className="board-column-title">{col.label}</span>
                    <span className="board-column-count">{colTasks.length}</span>
                  </div>

                  <div className="board-column-cards">
                    {colTasks.length === 0 ? (
                      <p className="board-column-empty">No tasks here.</p>
                    ) : (
                      colTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onMove={handleMove}
                          onEdit={(t) => setTaskModal({ mode: 'edit', task: t })}
                        />
                      ))
                    )}
                  </div>

                  <button
                    className="board-col-add-btn"
                    onClick={() => setTaskModal({ mode: 'add', defaultStatus: col.key })}
                  >
                    + Add Task
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {taskModal?.mode === 'add' && (
        <TaskFormModal
          mode="add"
          initialValues={{
            title: '',
            description: '',
            priority: 'medium',
            deadline: '',
            assigned_to: '',
            status: taskModal.defaultStatus || 'todo',
          }}
          members={members}
          onClose={() => setTaskModal(null)}
          onSubmit={handleAdd}
        />
      )}

      {taskModal?.mode === 'edit' && (
        <TaskFormModal
          mode="edit"
          initialValues={{
            title: taskModal.task.title,
            description: taskModal.task.description || '',
            priority: taskModal.task.priority || 'medium',
            deadline: taskModal.task.deadline ? taskModal.task.deadline.slice(0, 10) : '',
            assigned_to: taskModal.task.assigned_user?.id ?? '',
            status: taskModal.task.status,
          }}
          members={members}
          onClose={() => setTaskModal(null)}
          onSubmit={(payload) => handleEditSubmit(taskModal.task, payload)}
          onDelete={() => handleDeleteTask(taskModal.task)}
        />
      )}

      {inviteOpen && (
        <InviteMemberModal
          workspaceId={workspaceId}
          members={members}
          onClose={() => setInviteOpen(false)}
        />
      )}
    </div>
  )
}
