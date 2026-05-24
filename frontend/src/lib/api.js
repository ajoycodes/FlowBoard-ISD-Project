import { initialData } from './mockData'

const store = JSON.parse(JSON.stringify(initialData))

const delay = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms))

const clone = (value) => JSON.parse(JSON.stringify(value))

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const nextId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`

export async function login(credentials){
  await delay()
  return { user: clone(store.user), token: 'mock-token-login', credentials }
}

export async function register(payload){
  await delay()
  return { user: { name: payload.name, email: payload.email, role: 'Frontend Developer' }, token: 'mock-token-register' }
}

export async function requestPasswordReset(email){
  await delay()
  return { email, status: 'sent' }
}

export async function getDashboard(){
  await delay()
  return clone({ user: store.user, dashboard: store.dashboard })
}

export async function createWorkspace(payload){
  await delay()
  const id = payload.name ? slugify(payload.name) : nextId('workspace')
  const workspace = {
    id,
    name: payload.name,
    description: payload.description || 'New workspace created from the dashboard.',
    deadline: payload.deadline || 'Jun 30',
    progress: 0,
    stats: { tasks: 0, notes: 0, members: 1, activity: 0 },
    board: { todo: [], progress: [], done: [] },
    notes: [],
    members: [{ id: nextId('m'), name: store.user.name, email: store.user.email, role: 'Owner', status: 'Owner' }],
    activity: [{ id: nextId('a'), date: '2026-05-24', action: `Created workspace ${payload.name}`, user: store.user.name }]
  }
  store.workspaces[id] = workspace
  store.dashboard.workspaces = [
    {
      id,
      name: workspace.name,
      description: workspace.description,
      deadline: workspace.deadline,
      progress: workspace.progress,
      tasks: workspace.stats.tasks,
      members: workspace.stats.members,
      status: 'Active'
    },
    ...store.dashboard.workspaces
  ]
  return clone(workspace)
}

export async function getWorkspace(workspaceId){
  await delay()
  return clone(store.workspaces[workspaceId] || store.workspaces['flowboard-core'])
}

export async function saveTask(workspaceId, column, task){
  await delay()
  const workspace = store.workspaces[workspaceId]
  const newTask = { id: nextId('task'), ...task }
  workspace.board[column].unshift(newTask)
  workspace.stats.tasks += 1
  workspace.activity.unshift({ id: nextId('a'), date: '2026-05-24', action: `Created task ${task.title}`, user: store.user.name })
  return clone(newTask)
}

export async function moveTask(workspaceId, taskId, fromColumn, toColumn){
  await delay()
  const workspace = store.workspaces[workspaceId]
  const taskIndex = workspace.board[fromColumn].findIndex(task => task.id === taskId)
  if(taskIndex < 0) return null
  const [task] = workspace.board[fromColumn].splice(taskIndex, 1)
  task.status = toColumn
  workspace.board[toColumn].unshift(task)
  workspace.activity.unshift({ id: nextId('a'), date: '2026-05-24', action: `Moved task ${task.title} to ${toColumn}`, user: store.user.name })
  return clone(task)
}

export async function saveNote(workspaceId, note){
  await delay()
  const workspace = store.workspaces[workspaceId]
  const newNote = { id: nextId('note'), updatedAt: 'Today', updatedBy: store.user.name, ...note }
  const existingIndex = workspace.notes.findIndex(item => item.id === newNote.id)
  if(existingIndex >= 0){
    workspace.notes[existingIndex] = newNote
  } else {
    workspace.notes.unshift(newNote)
  }
  workspace.activity.unshift({ id: nextId('a'), date: '2026-05-24', action: `Saved note ${newNote.title}`, user: store.user.name })
  return clone(newNote)
}

export async function removeNote(workspaceId, noteId){
  await delay()
  const workspace = store.workspaces[workspaceId]
  workspace.notes = workspace.notes.filter(note => note.id !== noteId)
  return true
}

export async function inviteMember(workspaceId, member){
  await delay()
  const workspace = store.workspaces[workspaceId]
  const newMember = { id: nextId('member'), status: 'Invited', ...member }
  workspace.members.unshift(newMember)
  workspace.stats.members = workspace.members.length
  workspace.activity.unshift({ id: nextId('a'), date: '2026-05-24', action: `Invited ${member.name || member.email}`, user: store.user.name })
  return clone(newMember)
}

export async function updateMemberRole(workspaceId, memberId, role){
  await delay()
  const workspace = store.workspaces[workspaceId]
  const member = workspace.members.find(item => item.id === memberId)
  if(member){
    member.role = role
  }
  return clone(member)
}

export async function removeMember(workspaceId, memberId){
  await delay()
  const workspace = store.workspaces[workspaceId]
  workspace.members = workspace.members.filter(item => item.id !== memberId)
  workspace.stats.members = workspace.members.length
  return true
}

export async function getActivity(workspaceId, filterDate = ''){
  await delay()
  const workspace = store.workspaces[workspaceId]
  const activity = filterDate ? workspace.activity.filter(item => item.date === filterDate) : workspace.activity
  return clone(activity)
}
