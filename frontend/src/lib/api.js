const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

function getToken() {
  return localStorage.getItem('token')
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
    throw data
  }

  return data
}

export async function login(credentials) {
  const data = await request('/login', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  })

  localStorage.setItem('token', data.token)
  localStorage.setItem('username', data.user?.name || 'User')
  localStorage.setItem('role', data.user?.role || 'Member')

  return data
}

export async function register(payload) {
  const data = await request('/register', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      role: payload.role,
      password: payload.password,
      password_confirmation: payload.confirm,
    }),
  })

  localStorage.setItem('token', data.token)
  localStorage.setItem('username', data.user?.name || payload.name || 'User')
  localStorage.setItem('role', data.user?.role || payload.role || 'Member')

  return data
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
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
  }
}

export async function getWorkspaces() {
  return request('/workspaces')
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
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteTask(taskId) {
  return request(`/tasks/${taskId}`, {
    method: 'DELETE',
  })
}

export async function getActivityLogs(workspaceId, params = {}) {
  const query = new URLSearchParams(params).toString()

  return request(`/workspaces/${workspaceId}/activity-logs${query ? `?${query}` : ''}`)
}