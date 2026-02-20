const API_BASE = '/api'

function getToken() {
  return localStorage.getItem('platonic-study-token')
}

export async function register(username, password) {
  let res
  try {
    res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    })
  } catch (err) {
    throw new Error('Could not reach server. Make sure the backend is running (cd server && npm run dev).')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Registration failed (${res.status})`)
  return data
}

export async function login(username, password) {
  let res
  try {
    res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    })
  } catch (err) {
    throw new Error('Could not reach server. Make sure the backend is running (cd server && npm run dev).')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Login failed (${res.status})`)
  return data
}

export async function fetchMe() {
  const token = getToken()
  if (!token) return null
  const res = await fetch(`${API_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  const data = await res.json().catch(() => ({}))
  return data.user || null
}

export function getStoredToken() {
  return getToken()
}

export function setStoredToken(token) {
  if (token) localStorage.setItem('platonic-study-token', token)
  else localStorage.removeItem('platonic-study-token')
}
