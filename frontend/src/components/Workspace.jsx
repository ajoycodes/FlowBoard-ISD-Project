import { createWorkspace } from '../lib/api'
import './Workspace.css'

export default function Workspace({ onClose, onCreated }) {
  const [name,  setName]  = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleSubmit = async (e) => {
  e.preventDefault()

  if (!name.trim()) {
    setError('Workspace name is required.')
    return
  }

  try {
    setLoading(true)
    setError('')

    const result = await createWorkspace({ name: name.trim() })
    onCreated(result.data || result)
  } catch (error) {
    setError(error.message || 'Failed to create workspace.')
  } finally {
    setLoading(false)
  }
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
            <button className="primary-btn" type="submit" disabled={loading}>
  {loading ? 'Creating...' : 'Create'}
</button>
            <button className="ghost-btn"   type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
