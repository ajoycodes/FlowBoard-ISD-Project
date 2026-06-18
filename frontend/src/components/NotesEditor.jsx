import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from './DashboardLayout'
import './NotesEditor.css'

const WORKSPACE_TASKS = [
  { id: 1, title: 'Activity log API endpoint', status: 'To Do', assignee: 'Dev 3' },
  { id: 2, title: 'Write unit tests', status: 'To Do', assignee: 'Dev 2' },
  { id: 3, title: 'Design dashboard UI', status: 'In Progress', assignee: 'Fariha' },
  { id: 4, title: 'Set up Oracle schema', status: 'In Progress', assignee: 'Dev 2' },
  { id: 5, title: 'Implement login page', status: 'Done', assignee: 'Fariha' },
  { id: 6, title: 'Configure Vite project', status: 'Done', assignee: 'Dev 3' },
]

function storageKey(workspaceId) {
  return `flowboard-notes-${workspaceId ?? 1}`
}

function nowLabel() {
  return new Date().toLocaleString([], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function taskTitle(taskId) {
  return WORKSPACE_TASKS.find(task => task.id === taskId)?.title || 'Unassigned task'
}

function defaultNotes(workspaceId) {
  const author = localStorage.getItem('username') || 'User'

  return [
    {
      id: 1,
      task_id: 5,
      title: 'Login validation checklist',
      content: 'Confirm email validation, password required state, and successful redirect back to the dashboard.',
      updated_at: nowLabel(),
      author,
      workspace_id: workspaceId ?? 1,
    },
    {
      id: 2,
      task_id: 3,
      title: 'Dashboard UI notes',
      content: 'Keep project cards compact, use light borders, and make the primary workspace actions easy to scan.',
      updated_at: nowLabel(),
      author,
      workspace_id: workspaceId ?? 1,
    },
    {
      id: 3,
      task_id: 1,
      title: 'Activity endpoint fields',
      content: 'Return actor, action, task title, and timestamp so the activity log can be filtered cleanly.',
      updated_at: nowLabel(),
      author,
      workspace_id: workspaceId ?? 1,
    },
  ]
}

function normalizeNotes(notes) {
  return notes.map((note, index) => ({
    ...note,
    task_id: note.task_id ?? WORKSPACE_TASKS[index % WORKSPACE_TASKS.length].id,
  }))
}

function loadNotes(workspaceId) {
  try {
    const saved = localStorage.getItem(storageKey(workspaceId))
    return saved ? normalizeNotes(JSON.parse(saved)) : defaultNotes(workspaceId)
  } catch {
    return defaultNotes(workspaceId)
  }
}

export default function NotesEditor({ workspaceId, taskId: initialTaskId, onNavigate }) {
  const username = localStorage.getItem('username') || 'User'
  const isTaskScoped = initialTaskId !== null && initialTaskId !== undefined
  const [notes, setNotes] = useState(() => loadNotes(workspaceId))
  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId ?? 'all')
  const filteredNotes = useMemo(() => (
    selectedTaskId === 'all'
      ? notes
      : notes.filter(note => note.task_id === selectedTaskId)
  ), [notes, selectedTaskId])
  const [selectedId, setSelectedId] = useState(() => filteredNotes[0]?.id ?? null)
  const selectedNote = notes.find(note => note.id === selectedId) ?? null
  const wsName = `Workspace #${workspaceId ?? 1}`

  const noteCount = filteredNotes.length

  const persist = (nextNotes) => {
    setNotes(nextNotes)
    localStorage.setItem(storageKey(workspaceId), JSON.stringify(nextNotes))
  }

  const chooseTask = (taskId) => {
    const nextFiltered = taskId === 'all'
      ? notes
      : notes.filter(note => note.task_id === taskId)

    setSelectedTaskId(taskId)
    setSelectedId(nextFiltered[0]?.id ?? null)
  }

  useEffect(() => {
    if (initialTaskId) chooseTask(initialTaskId)
  }, [initialTaskId])

  const handleCreate = () => {
    const targetTaskId = isTaskScoped
      ? initialTaskId
      : selectedTaskId === 'all'
        ? WORKSPACE_TASKS[0].id
        : selectedTaskId
    const note = {
      id: Date.now(),
      task_id: targetTaskId,
      title: 'Untitled note',
      content: '',
      updated_at: nowLabel(),
      author: username,
      workspace_id: workspaceId ?? 1,
    }

    persist([note, ...notes])
    setSelectedTaskId(targetTaskId)
    setSelectedId(note.id)
  }

  const updateSelected = (field, value) => {
    if (!selectedNote) return
    if (isTaskScoped && field === 'task_id') return

    persist(notes.map(note => (
      note.id === selectedNote.id
        ? { ...note, [field]: value, updated_at: nowLabel(), author: username }
        : note
    )))

    if (field === 'task_id') {
      setSelectedTaskId(value)
    }
  }

  const handleDelete = () => {
    if (!selectedNote) return
    if (!window.confirm(`Delete "${selectedNote.title || 'Untitled note'}"?`)) return

    const nextNotes = notes.filter(note => note.id !== selectedNote.id)
    const nextFiltered = selectedTaskId === 'all'
      ? nextNotes
      : nextNotes.filter(note => note.task_id === selectedTaskId)

    persist(nextNotes)
    setSelectedId(nextFiltered[0]?.id ?? null)
  }

  return (
    <DashboardLayout activeNav="notes" onNavigate={onNavigate} workspaceId={workspaceId}>
      <div className="notes-page">
        <div className="notes-header">
          <div>
            <p className="notes-breadcrumb">FlowBoard &rsaquo; {wsName} &rsaquo; Notes</p>
            <h1 className="notes-title">
              {isTaskScoped ? taskTitle(initialTaskId) : 'Task Notes'}
            </h1>
          </div>
          <button className="notes-create-btn" onClick={handleCreate}>
            + New Note
          </button>
        </div>

        <div className="notes-shell">
          <aside className="notes-task-filter" aria-label="Filter notes by task">
            <div className="notes-list-header">
              <span>Tasks</span>
              <span className="notes-count">{notes.length}</span>
            </div>

            {!isTaskScoped && (
              <button
                className={`notes-task-btn${selectedTaskId === 'all' ? ' notes-task-btn--active' : ''}`}
                onClick={() => chooseTask('all')}
              >
                <span className="notes-task-title">All Tasks</span>
                <span className="notes-task-count">{notes.length}</span>
              </button>
            )}

            {WORKSPACE_TASKS
              .filter(task => !isTaskScoped || task.id === initialTaskId)
              .map(task => {
              const count = notes.filter(note => note.task_id === task.id).length

              return (
                <button
                  key={task.id}
                  className={`notes-task-btn${selectedTaskId === task.id ? ' notes-task-btn--active' : ''}`}
                  onClick={() => chooseTask(task.id)}
                >
                  <span className="notes-task-title">{task.title}</span>
                  <span className="notes-task-meta">{task.status} • {count} note{count === 1 ? '' : 's'}</span>
                </button>
              )
            })}
          </aside>

          <aside className="notes-list" aria-label="Task notes">
            <div className="notes-list-header">
              <span>Notes</span>
              <span className="notes-count">{noteCount}</span>
            </div>

            {filteredNotes.length === 0 ? (
              <p className="notes-empty">No notes for this task yet.</p>
            ) : (
              filteredNotes.map(note => (
                <button
                  key={note.id}
                  className={`notes-list-item${note.id === selectedId ? ' notes-list-item--active' : ''}`}
                  onClick={() => setSelectedId(note.id)}
                >
                  <span className="notes-list-title">{note.title || 'Untitled note'}</span>
                  <span className="notes-list-task">{taskTitle(note.task_id)}</span>
                  <span className="notes-list-preview">{note.content || 'Empty note'}</span>
                  <span className="notes-list-meta">{note.updated_at}</span>
                </button>
              ))
            )}
          </aside>

          <section className="notes-editor" aria-label="Note editor">
            {selectedNote ? (
              <>
                <div className="notes-editor-top">
                  <input
                    className="notes-title-input"
                    value={selectedNote.title}
                    onChange={e => updateSelected('title', e.target.value)}
                    aria-label="Note title"
                    placeholder="Note title"
                  />
                  <button className="notes-delete-btn" onClick={handleDelete}>
                    Delete
                  </button>
                </div>

                {isTaskScoped ? (
                  <div className="notes-task-select-field">
                    <span>Task</span>
                    <span className="notes-task-locked">{taskTitle(initialTaskId)}</span>
                  </div>
                ) : (
                  <label className="notes-task-select-field">
                    <span>Task</span>
                    <select
                      className="notes-task-select"
                      value={selectedNote.task_id}
                      onChange={e => updateSelected('task_id', Number(e.target.value))}
                    >
                      {WORKSPACE_TASKS.map(task => (
                        <option key={task.id} value={task.id}>{task.title}</option>
                      ))}
                    </select>
                  </label>
                )}

                <textarea
                  className="notes-content-input"
                  value={selectedNote.content}
                  onChange={e => updateSelected('content', e.target.value)}
                  aria-label="Note content"
                  placeholder="Write task notes here..."
                />

                <div className="notes-editor-footer">
                  <span>Edited by {selectedNote.author}</span>
                  <span>{selectedNote.updated_at}</span>
                </div>
              </>
            ) : (
              <div className="notes-editor-empty">
                <button className="notes-create-btn" onClick={handleCreate}>
                  + New Note
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
