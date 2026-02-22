import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { findUserByUsername, createUser, ensureDataDir } from './store.js'
import { signToken, authMiddleware } from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// Log early so Railway deploy logs show startup progress
console.log('Starting server...', { PORT, NODE_ENV: process.env.NODE_ENV })

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// Health check (for Railway and load balancers)
app.get('/health', (req, res) => res.status(200).json({ ok: true }))

// Register: POST /api/register { username, password }
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body || {}
    const user = (username || '').trim().toLowerCase()
    const pass = typeof password === 'string' ? password : ''
    if (!user || user.length < 2) {
      return res.status(400).json({ error: 'Username must be at least 2 characters' })
    }
    if (!pass || pass.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    if (findUserByUsername(user)) {
      return res.status(400).json({ error: 'Username already taken' })
    }
    const passwordHash = await bcrypt.hash(pass, 10)
    const id = crypto.randomUUID()
    const created = createUser({ id, username: user, passwordHash })
    if (!created) {
      return res.status(400).json({ error: 'Username already taken' })
    }
    const token = signToken({ userId: id })
    return res.json({ user: { id, username: created.username }, token })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ error: err.message || 'Registration failed' })
  }
})

// Login: POST /api/login { username, password }
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body || {}
    const user = (username || '').trim().toLowerCase()
    const pass = typeof password === 'string' ? password : ''
    if (!user || !pass) {
      return res.status(400).json({ error: 'Username and password required' })
    }
    const existing = findUserByUsername(user)
    if (!existing) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }
    const match = await bcrypt.compare(pass, existing.passwordHash)
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }
    const token = signToken({ userId: existing.id })
    return res.json({ user: { id: existing.id, username: existing.username }, token })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: err.message || 'Login failed' })
  }
})

// Me: GET /api/me (requires Authorization: Bearer <token>)
app.get('/api/me', authMiddleware, (req, res) => {
  return res.json({ user: req.user })
})

// Serve built React app when dist exists (production / Railway)
const distPath = path.join(__dirname, '..', 'dist')
const distExists = fs.existsSync(distPath)
console.log('Static dist:', distPath, distExists ? 'found' : 'MISSING')
if (distExists) {
  app.use(express.static(distPath))
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')))
} else {
  console.warn('No dist/ folder found; frontend will not be served. Check build output.')
  app.get('/', (req, res) => res.status(503).send('App not built. Check deploy logs.'))
}

ensureDataDir()

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (Railway will send traffic here)`)
}).on('error', (err) => {
  console.error('Server failed to start:', err.message)
  process.exit(1)
})
