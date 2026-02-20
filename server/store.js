import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const USERS_PATH = path.join(DATA_DIR, 'users.json')

function readUsers() {
  try {
    if (!fs.existsSync(USERS_PATH)) return []
    const raw = fs.readFileSync(USERS_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('readUsers error:', e.message)
    return []
  }
}

function writeUsers(users) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    const safe = Array.isArray(users) ? users : []
    fs.writeFileSync(USERS_PATH, JSON.stringify(safe, null, 2), 'utf8')
  } catch (e) {
    console.error('writeUsers error:', e.message)
    throw new Error('Could not save user. Check server data directory permissions.')
  }
}

export function findUserByUsername(username) {
  const users = readUsers()
  const lower = (username || '').toLowerCase()
  return users.find(u => u && String(u.username).toLowerCase() === lower) || null
}

export function findUserById(id) {
  const users = readUsers()
  return users.find(u => u.id === id) || null
}

/** Call at server startup to ensure data dir exists and is writable. */
export function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    if (!fs.existsSync(USERS_PATH)) {
      fs.writeFileSync(USERS_PATH, '[]', 'utf8')
    }
  } catch (e) {
    console.error('Data directory not writable:', DATA_DIR, e.message)
    // Don't throw: allow server to start so the app loads (auth will fail until data dir is writable)
  }
}

export function createUser({ id, username, passwordHash }) {
  const users = readUsers()
  const lower = (username || '').toLowerCase()
  if (users.some(u => u && String(u.username).toLowerCase() === lower)) {
    return null
  }
  users.push({
    id: String(id),
    username: String(username),
    passwordHash: String(passwordHash),
    createdAt: new Date().toISOString(),
  })
  writeUsers(users)
  return { id, username }
}
