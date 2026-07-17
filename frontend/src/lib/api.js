const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

function getToken() {
  return localStorage.getItem('token')
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('role')
  // Remove legacy locally-persisted notes from older builds
  Object.keys(localStorage)
    .filter(key => key.startsWith('flowboard-notes-'))
    .forEach(key => localStorage.removeItem(key))
}

async function request(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401 && getToken()) {
      clearSession()
    }
    const error = new Error(data.message || `Request failed (${response.status})`)
    error.status = response.status
    error.errors = data.errors
    throw error
  }

  return data
}

// ── Auth ───────────────────────────────────────────────────────────

export async function login(credentials) {
  clearSession()

  const data = await request('/login', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  })

  localStorage.setItem('token', data.token)
  localStorage.setItem('username', data.user?.name || 'User')

  return data
}

export async function register(payload) {
  clearSession()

  const data = await request('/register', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      password_confirmation: payload.confirm,
    }),
  })

  localStorage.setItem('token', data.token)
  localStorage.setItem('username', data.user?.name || payload.name || 'User')

  return data
}

export async function getCurrentUser() {
  return request('/user')
}

export async function requestPasswordReset(email) {
  return request('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function logout() {
  try {
    await request('/logout', { method: 'POST' })
  } finally {
    clearSession()
  }
}

// ── Dashboard ──────────────────────────────────────────────────────

export async function getDashboard(workspaceId = null) {
  const query = workspaceId ? `?workspace_id=${workspaceId}` : ''
  return request(`/dashboard${query}`)
}

// ── Workspaces ─────────────────────────────────────────────────────

export async function getWorkspaces() {
  return request('/workspaces')
}

export async function getWorkspace(id) {
  return request(`/workspaces/${id}`)
}

export async function createWorkspace(payload) {
  return request('/workspaces', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteWorkspace(id) {
  return request(`/workspaces/${id}`, {
    method: 'DELETE',
  })
}

// ── Workspace invitations ──────────────────────────────────────────

export async function getInvitations(workspaceId) {
  return request(`/workspaces/${workspaceId}/invitations`)
}

export async function sendInvitation(workspaceId, email) {
  return request(`/workspaces/${workspaceId}/invitations`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function deleteInvitation(workspaceId, invitationId) {
  return request(`/workspaces/${workspaceId}/invitations/${invitationId}`, {
    method: 'DELETE',
  })
}

export async function getMyInvitations() {
  return request('/invitations/my')
}

export async function acceptInvitation(invitationId) {
  return request(`/invitations/${invitationId}/accept`, { method: 'POST' })
}

export async function declineInvitation(invitationId) {
  return request(`/invitations/${invitationId}/decline`, { method: 'POST' })
}

// ── Tasks ──────────────────────────────────────────────────────────

export async function getTasks(workspaceId) {
  return request(`/workspaces/${workspaceId}/tasks`)
}

export async function createTask(workspaceId, payload) {
  return request(`/workspaces/${workspaceId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateTask(taskId, payload) {
  return request(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function updateTaskStatus(taskId, status) {
  return request(`/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function assignTask(taskId, userId) {
  return request(`/tasks/${taskId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assigned_to: userId }),
  })
}

export async function deleteTask(taskId) {
  return request(`/tasks/${taskId}`, {
    method: 'DELETE',
  })
}

// ── Notes ──────────────────────────────────────────────────────────

export async function getNotes(workspaceId) {
  return request(`/workspaces/${workspaceId}/notes`)
}

export async function createNote(workspaceId, content) {
  return request(`/workspaces/${workspaceId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export async function updateNote(workspaceId, noteId, content) {
  return request(`/workspaces/${workspaceId}/notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
}

export async function deleteNote(workspaceId, noteId) {
  return request(`/workspaces/${workspaceId}/notes/${noteId}`, {
    method: 'DELETE',
  })
}

// ── Activity ───────────────────────────────────────────────────────

export async function getActivityLogs(workspaceId, params = {}) {
  const query = new URLSearchParams(params).toString()

  return request(`/workspaces/${workspaceId}/activity${query ? `?${query}` : ''}`)
}
