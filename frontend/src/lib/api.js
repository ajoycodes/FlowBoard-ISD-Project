// Mock API helpers — replace with real fetch calls once the
// Laravel backend is running and tokens are issued.

export async function login(credentials) {
  await delay(400)
  const token = 'mock-token-login'
  // Derive a display name from the email (e.g. "fariha@..." → "Fariha")
  const raw   = credentials.email.split('@')[0] || 'User'
  const name  = raw.charAt(0).toUpperCase() + raw.slice(1)
  localStorage.setItem('token',    token)
  localStorage.setItem('username', name)
  return { user: { email: credentials.email, name }, token }
}

export async function register(payload) {
  await delay(400)
  const token = 'mock-token-register'
  const name  = payload.name || 'User'
  localStorage.setItem('token',    token)
  localStorage.setItem('username', name)
  return { user: { email: payload.email, name }, token }
}

export async function requestPasswordReset(email) {
  await delay(400)
  return { email, status: 'queued' }
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
