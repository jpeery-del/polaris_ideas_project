import jwt from 'jsonwebtoken'
import { findUserById } from './store.js'

const JWT_SECRET = process.env.JWT_SECRET || 'platonic-study-secret-change-in-production'
const JWT_EXPIRY = '7d'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY })
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch {
    return null
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  const decoded = verifyToken(token)
  if (!decoded?.userId) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
  const user = findUserById(decoded.userId)
  if (!user) {
    return res.status(401).json({ error: 'User not found' })
  }
  req.user = { id: user.id, username: user.username }
  next()
}
