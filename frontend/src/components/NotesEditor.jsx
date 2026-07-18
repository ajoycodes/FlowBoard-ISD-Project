import React, { useEffect, useRef, useState } from 'react'
import { getNotes, createNote, updateNote, deleteNote } from '../lib/api'
import DashboardLayout from './DashboardLayout'
import './NotesEditor.css'

function noteTitle(content) {
  const firstLine = (content || '').split('\n')[0].trim()
  return firstLine || 'Untitled note'
}

function formatTimestamp(ts) {
  const d = new Date(ts)
  return isNaN(d.getTime()) ? ts : d.toLocaleString([], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function NotesEditor({ workspaceId, onNavigate }) {
  const [notes, setNotes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const saveTimer = useRef(null)

  const selectedNote = notes.find(note => note.id === selectedId) ?? null

  useEffect(() => {
    if (!workspaceId) return

    getNotes(workspaceId)
      .then(result => {
        const list = result.data || []
        setNotes(list)
        setSelectedId(list[0]?.id ?? null)
        setDraft(list[0]?.content ?? '')
      })
      .catch(err => setError(err.message || 'Failed to load notes.'))
      .finally(() => setLoading(false))
  }, [workspaceId])

  const choose = (note) => {
    setSelectedId(note.id)
    setDraft(note.content || '')
  }

  const handleCreate = async () => {
    try {
      const result = await createNote(workspaceId, 'Untitled note')
      const note = result.data

      setNotes(prev => [note, ...prev])
      setSelectedId(note.id)
      setDraft(note.content)
    } catch (err) {
      setError(err.message || 'Failed to create note.')
    }
  }

  const persistDraft = async (noteId, content) => {
    try {
      setSaving(true)
      const result = await updateNote(workspaceId, noteId, content)
      setNotes(prev => prev.map(note => note.id === noteId ? result.data : note))
    } catch (err) {
      setError(err.message || 'Failed to save note.')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (value) => {
    setDraft(value)
    if (!selectedNote) return

    // Debounced autosave
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => persistDraft(selectedNote.id, value), 600)
  }

  useEffect(() => () => saveTimer.current && clearTimeout(saveTimer.current), [])

  const handleDelete = async (note = selectedNote) => {
    if (!note) return
    if (!window.confirm(`Delete "${noteTitle(note.content)}"?`)) return

    try {
      await deleteNote(workspaceId, note.id)
      const next = notes.filter(item => item.id !== note.id)
      setNotes(next)

      if (note.id === selectedId) {
        setSelectedId(next[0]?.id ?? null)
        setDraft(next[0]?.content ?? '')
      }
    } catch (err) {
      setError(err.message || 'Failed to delete note.')
    }
  }

  return (
    <DashboardLayout activeNav="notes" onNavigate={onNavigate} workspaceId={workspaceId}>
      <div className="notes-page">
        <div className="notes-header">
          <div>
            <p className="notes-breadcrumb">FlowBoard &rsaquo; Notes</p>
            <h1 className="notes-title">Workspace Notes</h1>
          </div>
          <button className="primary-btn" onClick={handleCreate}>
            + New Note
          </button>
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="notes-shell">
          <aside className="notes-list" aria-label="Workspace notes">
            <div className="notes-list-header">
              <span>Notes</span>
              <span className="notes-count">{notes.length}</span>
            </div>

            {loading ? (
              <p className="notes-empty">Loading…</p>
            ) : notes.length === 0 ? (
              <p className="notes-empty">No notes yet. Create the first one.</p>
            ) : (
              notes.map(note => (
                <div
                  key={note.id}
                  className={`notes-list-item${note.id === selectedId ? ' notes-list-item--active' : ''}`}
                >
                  <button
                    className="notes-list-main"
                    onClick={() => choose(note)}
                  >
                    <span className="notes-list-title">{noteTitle(note.content)}</span>
                    <span className="notes-list-preview">
                      {(note.content || '').split('\n').slice(1).join(' ').trim() || 'Empty note'}
                    </span>
                    <span className="notes-list-meta">
                      {note.user?.name ? `${note.user.name} · ` : ''}{formatTimestamp(note.updated_at)}
                    </span>
                  </button>
                  <button
                    className="notes-list-delete"
                    onClick={() => handleDelete(note)}
                    aria-label={`Delete ${noteTitle(note.content)}`}
                    title="Delete note"
                  >
                    &times;
                  </button>
                </div>
              ))
            )}
          </aside>

          <section className="notes-editor" aria-label="Note editor">
            {selectedNote ? (
              <>
                <div className="notes-editor-top">
                  <h2 className="notes-editor-title">{noteTitle(draft)}</h2>
                  <button className="ghost-btn ghost-btn--danger" onClick={() => handleDelete()}>
                    Delete
                  </button>
                </div>

                <textarea
                  className="notes-content-input"
                  value={draft}
                  onChange={e => handleChange(e.target.value)}
                  aria-label="Note content"
                  placeholder="Write your note here… The first line becomes its title."
                />

                <div className="notes-editor-footer">
                  <span>
                    {selectedNote.user?.name ? `By ${selectedNote.user.name}` : ''}
                  </span>
                  <span>{saving ? 'Saving…' : `Updated ${formatTimestamp(selectedNote.updated_at)}`}</span>
                </div>
              </>
            ) : (
              <div className="notes-editor-empty">
                <p>Select a note or create a new one.</p>
                <button className="primary-btn" onClick={handleCreate}>
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
