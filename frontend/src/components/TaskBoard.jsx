import React, { useMemo, useState } from 'react'
import './TaskBoard.css'

const COLUMNS = ['To Do', 'In Progress', 'Done']

const FILTER_TABS = ['All Tasks', 'Assigned to Me', 'High Priority', 'In Progress', 'Completed']

const CURRENT_USER = localStorage.getItem('username') || 'Fariha'

const DEFAULT_ASSIGNEES = ['Fariha', 'Dev 2', 'Dev 3']

const INITIAL_TASKS = [
  {
    id: 1,
    title: 'Activity log API endpoint',
    description: 'Return workspace activity with actor, action, and timestamp fields.',
    priority: 'Medium',
    deadline: '2026-06-10',
    assignee: 'Dev 3',
    status: 'To Do',
  },
  {
    id: 2,
    title: 'Write unit tests',
    description: 'Cover task creation, update, status movement, and deletion cases.',
    priority: 'Low',
    deadline: '2026-06-15',
    assignee: 'Dev 2',
    status: 'To Do',
  },
  {
    id: 3,
    title: 'Design dashboard UI',
    description: 'Match the dashboard wireframe and keep project cards easy to scan.',
    priority: 'High',
    deadline: '2026-06-05',
    assignee: 'Fariha',
    status: 'In Progress',
  },
  {
    id: 4,
    title: 'Set up Oracle schema',
    description: 'Create workspace, task, note, member, and activity log tables.',
    priority: 'Medium',
    deadline: '2026-05-28',
    assignee: 'Dev 2',
    status: 'In Progress',
  },
  {
    id: 5,
    title: 'Implement login page',
    description: 'Connect login form validation with the auth flow.',
    priority: 'High',
    deadline: '2026-06-01',
    assignee: 'Fariha',
    status: 'Done',
  },
  {
    id: 6,
    title: 'Configure Vite project',
    description: 'Prepare the React app shell, scripts, and initial project structure.',
    priority: 'Low',
    deadline: '2026-05-20',
    assignee: 'Dev 3',
    status: 'Done',
  },
]

function priorityClass(priority) {
  const p = (priority || '').toLowerCase()
  if (p === 'high') return 'task-badge priority-high'
  if (p === 'medium') return 'task-badge priority-medium'
  return 'task-badge priority-low'
}

function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return isNaN(d) ? dateStr : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getAssigneeOptions(tasks) {
  const names = new Set([CURRENT_USER, ...DEFAULT_ASSIGNEES])
  tasks.forEach(task => {
    if (task.assignee) names.add(task.assignee)
  })
  return Array.from(names)
}

function applyFilter(tasks, tab, search) {
  let result = [...tasks]

  if (tab === 'Assigned to Me') result = result.filter(t => t.assignee === CURRENT_USER)
  if (tab === 'High Priority') result = result.filter(t => (t.priority || '').toLowerCase() === 'high')
  if (tab === 'In Progress') result = result.filter(t => t.status === 'In Progress')
  if (tab === 'Completed') result = result.filter(t => t.status === 'Done')

  if (search.trim()) {
    const q = search.trim().toLowerCase()
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.assignee || '').toLowerCase().includes(q) ||
      (t.priority || '').toLowerCase().includes(q)
    )
  }

  return result
}

const EMPTY_FORM = { title: '', description: '', priority: 'Medium', deadline: '', assignee: '' }

function AddTaskModal({ defaultStatus, assigneeOptions, onClose, onAdd }) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    assignee: assigneeOptions[0] || '',
    status: defaultStatus || 'To Do',
  })
  const [error, setError] = useState('')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Task title is required.')
      return
    }
    onAdd({ ...form, title: form.title.trim(), id: Date.now() })
  }

  return (
    <div className="task-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="task-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title" className="task-modal-title">Add New Task</h2>

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
              className="task-modal-textarea"
            />
          </div>

          <div className="task-modal-row">
            <div className="form-group">
              <label htmlFor="tb-priority">Priority</label>
              <select
                id="tb-priority"
                value={form.priority}
                onChange={e => set('priority', e.target.value)}
                className="task-modal-select"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tb-status">Column</label>
              <select
                id="tb-status"
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="task-modal-select"
              >
                {COLUMNS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="task-modal-row">
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
                value={form.assignee}
                onChange={e => set('assignee', e.target.value)}
                className="task-modal-select"
              >
                {assigneeOptions.map(name => <option key={name}>{name}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="hint task-modal-error">{error}</p>}

          <div className="task-modal-actions">
            <button type="submit" className="primary-btn">Create Task</button>
            <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TaskCard({ task, assigneeOptions, onAssign, onMove, onDelete }) {
  const nextStatus = task.status === 'To Do' ? 'In Progress'
    : task.status === 'In Progress' ? 'Done'
    : null

  const prevStatus = task.status === 'Done' ? 'In Progress'
    : task.status === 'In Progress' ? 'To Do'
    : null

  return (
    <div className="task-card">
      <p className="task-title">{task.title}</p>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-badges">
        <span className={priorityClass(task.priority)}>{task.priority || 'Low'}</span>
        <span className="task-badge task-badge-assignee" title={task.assignee || 'Unassigned'}>
          {initials(task.assignee)}
        </span>
      </div>

      <label className="task-assignee-field">
        <span>Assignee</span>
        <select
          value={task.assignee || ''}
          onChange={e => onAssign(task.id, e.target.value)}
          className="task-assignee-select"
          aria-label={`Assignee for ${task.title}`}
        >
          {assigneeOptions.map(name => <option key={name}>{name}</option>)}
        </select>
      </label>

      {task.deadline && (
        <p className="task-deadline">Due {fmtDate(task.deadline)}</p>
      )}

      <div className="task-actions">
        {prevStatus && (
          <button
            className="task-btn"
            onClick={() => onMove(task.id, prevStatus)}
            title={`Move to ${prevStatus}`}
          >
            &lt;- {prevStatus}
          </button>
        )}
        {nextStatus && (
          <button
            className="task-btn task-btn-advance"
            onClick={() => onMove(task.id, nextStatus)}
            title={`Move to ${nextStatus}`}
          >
            {nextStatus} -&gt;
          </button>
        )}
        <button
          className="task-btn task-btn-delete"
          onClick={() => window.confirm(`Delete "${task.title}"?`) && onDelete(task.id)}
          title="Delete task"
          aria-label={`Delete ${task.title}`}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default function TaskBoard({ workspaceId, onNavigate }) {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [activeTab, setActiveTab] = useState('All Tasks')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)

  const assigneeOptions = useMemo(() => getAssigneeOptions(tasks), [tasks])
  const visibleTasks = applyFilter(tasks, activeTab, search)

  const handleAdd = (newTask) => {
    setTasks(prev => [...prev, newTask])
    setModal(null)
  }

  const handleAssign = (id, assignee) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, assignee } : t))
  }

  const handleMove = (id, newStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
  }

  const handleDelete = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const wsName = `Workspace #${workspaceId ?? 1}`

  return (
    <div className="board-page">
      <nav className="board-navbar">
        <span className="board-brand">FlowBoard</span>
        <div className="board-navbar-right">
          <button
            className="board-nav-pill board-nav-pill--workspace"
            onClick={() => onNavigate && onNavigate('dashboard')}
          >
            &lt;- Dashboard
          </button>
          <button
            className="board-nav-pill"
            onClick={() => onNavigate && onNavigate('activity', workspaceId)}
          >
            Activity Log
          </button>
        </div>
      </nav>

      <div className="board-content">
        <p className="board-breadcrumb">FlowBoard &rsaquo; {wsName} &rsaquo; Board</p>

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
              className="board-add-task-btn"
              onClick={() => setModal('To Do')}
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

        <div className="board-columns">
          {COLUMNS.map(col => {
            const colTasks = visibleTasks.filter(t => t.status === col)
            return (
              <div key={col} className="board-column">
                <div className="board-column-header">
                  <span className="board-column-title">{col}</span>
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
                        assigneeOptions={assigneeOptions}
                        onAssign={handleAssign}
                        onMove={handleMove}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>

                <button
                  className="board-col-add-btn"
                  onClick={() => setModal(col)}
                >
                  + Add Task
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {modal && (
        <AddTaskModal
          defaultStatus={modal}
          assigneeOptions={assigneeOptions}
          onClose={() => setModal(null)}
          onAdd={handleAdd}
        />
      )}
    </div>
  )
}
