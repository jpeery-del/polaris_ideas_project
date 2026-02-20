const STORAGE_KEY_USER = 'platonic-study-user'

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEY_USER)
  }
}
