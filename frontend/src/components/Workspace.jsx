import React, { useState } from 'react'
import './Workspace.css'

export default function Workspace({ onClose, onCreated }) {
  const [name,  setName]  = useState('')
  const [error, setError] = useState('')

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Workspace name is required.')
      return
    }
    // Create locally (swap this for a real POST when the backend is ready)
    onCreated({ id: Date.now(), name: name.trim(), task_count: 0 })
  }

  return (
    <div className="ws-overlay" onClick={handleOverlayClick} role="presentation">
      <div
        className="ws-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ws-modal-title"
      >
        <h2 id="ws-modal-title" className="ws-modal-title">Create Workspace</h2>

        <form className="stack" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="ws-name-input">Workspace name</label>
            <input
              id="ws-name-input"
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="e.g. Sprint Q3"
              autoFocus
            />
          </div>

          {error && <p className="hint ws-error">{error}</p>}

          <div className="ws-modal-actions">
            <button className="primary-btn" type="submit">Create</button>
            <button className="ghost-btn"   type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
