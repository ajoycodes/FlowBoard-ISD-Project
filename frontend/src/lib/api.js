export async function requestPasswordReset(email) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { email, status: 'queued' };
}

export async function login(credentials) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { user: { email: credentials.email }, token: 'mock-token-login' };
}

export async function register(payload) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { user: { email: payload.email }, token: 'mock-token-register' };
}
