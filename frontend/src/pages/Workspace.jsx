import React from 'react'
import {
  getWorkspace,
  saveTask,
  moveTask,
  saveNote,
  removeNote,
  inviteMember,
  updateMemberRole,
  removeMember,
  getActivity
} from '../lib/api'

const tabs = [
  { key: 'board', label: 'Task board' },
  { key: 'notes', label: 'Notes' },
  { key: 'members', label: 'Members' },
  { key: 'activity', label: 'Activity' }
]

const columnMeta = [
  { key: 'todo', label: 'To Do', tone: 'amber' },
  { key: 'progress', label: 'In Progress', tone: 'blue' },
  { key: 'done', label: 'Done', tone: 'green' }
]

export default function Workspace({ workspaceId, onNavigate }){
  const [workspace, setWorkspace] = React.useState(null)
  const [activeTab, setActiveTab] = React.useState('board')

  React.useEffect(() => {
    let alive = true
    getWorkspace(workspaceId).then(data => {
      if(alive){
        setWorkspace(data)
      }
    })
    return () => { alive = false }
  }, [workspaceId])

  const refresh = React.useCallback(async () => {
    const updated = await getWorkspace(workspaceId)
    setWorkspace(updated)
  }, [workspaceId])

  if(!workspace){
    return <div className="panel loading-card">Loading workspace...</div>
  }

  const activeContent = {
    board: <BoardPanel workspace={workspace} onChange={refresh} />,
    notes: <NotesPanel workspace={workspace} onChange={refresh} />,
    members: <MembersPanel workspace={workspace} onChange={refresh} />,
    activity: <ActivityPanel workspace={workspace} />
  }[activeTab]

  return (
    <div className="page-shell">
      <header className="page-hero panel workspace-hero">
        <div>
          <span className="eyebrow">Workspace</span>
          <h1>{workspace.name}</h1>
          <p className="muted">{workspace.description}</p>
        </div>
        <div className="hero-actions">
          <button className="ghost-btn" onClick={() => onNavigate('dashboard')}>Back to dashboard</button>
        </div>
      </header>

      <section className="stat-grid workspace-stats">
        {[
          { label: 'Tasks', value: workspace.stats.tasks, detail: 'Board items tracked' },
          { label: 'Notes', value: workspace.stats.notes, detail: 'Workspace notes' },
          { label: 'Members', value: workspace.stats.members, detail: 'Team collaborators' },
          { label: 'Progress', value: `${workspace.progress}%`, detail: `Deadline ${workspace.deadline}` }
        ].map(stat => (
          <article className="panel stat-card" key={stat.label}>
            <span className="eyebrow">{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.detail}</p>
          </article>
        ))}
      </section>

      <nav className="tab-strip panel">
        {tabs.map(tab => (
          <button key={tab.key} className={activeTab === tab.key ? 'tab active' : 'tab'} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </nav>

      {activeContent}
    </div>
  )
}

function BoardPanel({ workspace, onChange }){
  const [draft, setDraft] = React.useState({ title: '', summary: '', assignee: 'Fariha', deadline: '', priority: 'Medium', column: 'todo' })
  const [dragState, setDragState] = React.useState(null)

  const handleCreateTask = async (event) => {
    event.preventDefault()
    if(!draft.title) return
    await saveTask(workspace.id, draft.column, {
      title: draft.title,
      summary: draft.summary,
      assignee: draft.assignee,
      deadline: draft.deadline || 'TBD',
      priority: draft.priority,
      status: draft.column
    })
    setDraft({ title: '', summary: '', assignee: 'Fariha', deadline: '', priority: 'Medium', column: 'todo' })
    await onChange()
  }

  const moveCard = async (taskId, fromColumn, toColumn) => {
    if(fromColumn === toColumn) return
    await moveTask(workspace.id, taskId, fromColumn, toColumn)
    await onChange()
  }

  return (
    <section className="panel content-card">
      <div className="card-header">
        <div>
          <span className="eyebrow">Task board</span>
          <h2>Kanban board</h2>
        </div>
      </div>

      <form className="task-form" onSubmit={handleCreateTask}>
        <div className="form-grid three-col">
          <div className="form-group"><label>Task</label><input value={draft.title} onChange={event => setDraft(current => ({ ...current, title: event.target.value }))} placeholder="Design login page" /></div>
          <div className="form-group"><label>Assignee</label><input value={draft.assignee} onChange={event => setDraft(current => ({ ...current, assignee: event.target.value }))} /></div>
          <div className="form-group"><label>Deadline</label><input value={draft.deadline} onChange={event => setDraft(current => ({ ...current, deadline: event.target.value }))} placeholder="Jun 04" /></div>
        </div>
        <div className="form-grid three-col">
          <div className="form-group"><label>Priority</label><select value={draft.priority} onChange={event => setDraft(current => ({ ...current, priority: event.target.value }))}><option>High</option><option>Medium</option><option>Low</option></select></div>
          <div className="form-group"><label>Column</label><select value={draft.column} onChange={event => setDraft(current => ({ ...current, column: event.target.value }))}><option value="todo">To Do</option><option value="progress">In Progress</option><option value="done">Done</option></select></div>
          <div className="form-group"><label>Summary</label><input value={draft.summary} onChange={event => setDraft(current => ({ ...current, summary: event.target.value }))} placeholder="Brief task description" /></div>
        </div>
        <button className="primary-btn" type="submit">Add task</button>
      </form>

      <div className="board-grid">
        {columnMeta.map(column => (
          <article className={`board-column tone-${column.tone}`} key={column.key} onDragOver={event => event.preventDefault()} onDrop={() => dragState && moveCard(dragState.taskId, dragState.column, column.key)}>
            <div className="column-header">
              <div>
                <span className="eyebrow">{column.label}</span>
                <h3>{workspace.board[column.key].length} tasks</h3>
              </div>
            </div>

            <div className="task-list">
              {workspace.board[column.key].map(task => (
                <article className="task-card" key={task.id} draggable onDragStart={() => setDragState({ taskId: task.id, column: column.key })}>
                  <div className="task-card-head">
                    <strong>{task.title}</strong>
                    <span className={`pill priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                  </div>
                  <p>{task.summary}</p>
                  <div className="task-foot">
                    <span>{task.assignee}</span>
                    <span>Due {task.deadline}</span>
                  </div>
                  <div className="task-actions">
                    {columnMeta.map(nextColumn => (
                      <button key={nextColumn.key} type="button" className="mini-btn" onClick={() => moveCard(task.id, column.key, nextColumn.key)} disabled={nextColumn.key === column.key}>
                        {nextColumn.label}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function NotesPanel({ workspace, onChange }){
  const [draft, setDraft] = React.useState({ id: '', title: '', content: '' })

  React.useEffect(() => {
    setDraft(workspace.notes[0] ? workspace.notes[0] : { id: '', title: '', content: '' })
  }, [workspace.id, workspace.notes])

  const saveCurrentNote = async (event) => {
    event.preventDefault()
    if(!draft.title) return
    await saveNote(workspace.id, draft)
    await onChange()
  }

  return (
    <section className="panel content-card split-layout">
      <div>
        <div className="card-header">
          <div>
            <span className="eyebrow">Notes editor</span>
            <h2>Workspace notes</h2>
          </div>
        </div>
        <div className="notes-list">
          {workspace.notes.map(note => (
            <button key={note.id} className="note-card" type="button" onClick={() => setDraft(note)}>
              <strong>{note.title}</strong>
              <p>{note.content}</p>
              <span className="muted">Updated by {note.updatedBy} • {note.updatedAt}</span>
            </button>
          ))}
        </div>
      </div>

      <form className="editor-panel stack" onSubmit={saveCurrentNote}>
        <span className="eyebrow">Edit note</span>
        <div className="form-group"><label>Title</label><input value={draft.title} onChange={event => setDraft(current => ({ ...current, title: event.target.value }))} /></div>
        <div className="form-group"><label>Content</label><textarea rows="12" value={draft.content} onChange={event => setDraft(current => ({ ...current, content: event.target.value }))} /></div>
        <button className="primary-btn" type="submit">Save note</button>
        <div className="inline-actions">
          {workspace.notes.map(note => (
            <button key={note.id} type="button" className="ghost-btn" onClick={async () => { await removeNote(workspace.id, note.id); await onChange() }}>Delete {note.title}</button>
          ))}
        </div>
      </form>
    </section>
  )
}

function MembersPanel({ workspace, onChange }){
  const [draft, setDraft] = React.useState({ name: '', email: '', role: 'Viewer' })

  const invite = async (event) => {
    event.preventDefault()
    if(!draft.email) return
    await inviteMember(workspace.id, draft)
    setDraft({ name: '', email: '', role: 'Viewer' })
    await onChange()
  }

  return (
    <section className="panel content-card split-layout">
      <div>
        <div className="card-header">
          <div>
            <span className="eyebrow">Team members</span>
            <h2>Invite and manage collaborators</h2>
          </div>
        </div>
        <form className="stack invite-form" onSubmit={invite}>
          <div className="form-grid three-col">
            <div className="form-group"><label>Name</label><input value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} /></div>
            <div className="form-group"><label>Email</label><input type="email" value={draft.email} onChange={event => setDraft(current => ({ ...current, email: event.target.value }))} /></div>
            <div className="form-group"><label>Role</label><select value={draft.role} onChange={event => setDraft(current => ({ ...current, role: event.target.value }))}><option>Viewer</option><option>Frontend Developer</option><option>Backend Developer</option><option>Scrum Master</option></select></div>
          </div>
          <button className="primary-btn" type="submit">Invite member</button>
        </form>
      </div>

      <div className="member-table">
        {workspace.members.map(member => (
          <article className="member-row" key={member.id}>
            <div>
              <strong>{member.name}</strong>
              <p>{member.email}</p>
            </div>
            <select value={member.role} onChange={async event => { await updateMemberRole(workspace.id, member.id, event.target.value); await onChange() }}>
              <option>Owner</option>
              <option>Scrum Master</option>
              <option>Frontend Developer</option>
              <option>Backend Developer</option>
              <option>Viewer</option>
            </select>
            <span className="pill">{member.status}</span>
            <button type="button" className="mini-btn danger" onClick={async () => { await removeMember(workspace.id, member.id); await onChange() }}>Remove</button>
          </article>
        ))}
      </div>
    </section>
  )
}

function ActivityPanel({ workspace }){
  const [filterDate, setFilterDate] = React.useState('')
  const [activity, setActivity] = React.useState([])

  React.useEffect(() => {
    let alive = true
    getActivity(workspace.id, filterDate).then(items => {
      if(alive){
        setActivity(items)
      }
    })
    return () => { alive = false }
  }, [workspace.id, filterDate])

  return (
    <section className="panel content-card">
      <div className="card-header">
        <div>
          <span className="eyebrow">Activity log</span>
          <h2>Workspace updates</h2>
        </div>
        <div className="filter-group">
          <input type="date" value={filterDate} onChange={event => setFilterDate(event.target.value)} />
          <button type="button" className="ghost-btn" onClick={() => setFilterDate('')}>Clear</button>
        </div>
      </div>
      <div className="timeline vertical">
        {activity.map(item => (
          <article className="timeline-item" key={item.id}>
            <span className="timeline-time">{item.date}</span>
            <div>
              <strong>{item.action}</strong>
              <p>By {item.user}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
