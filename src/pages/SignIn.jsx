import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login, register } from '../api/auth'

export default function SignIn() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const userStr = username.trim()
    if (!userStr) {
      setError('Enter a username')
      return
    }
    if (userStr.length < 2) {
      setError('Username must be at least 2 characters')
      return
    }
    if (!password) {
      setError('Enter a password')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const data = mode === 'login'
        ? await login(userStr, password)
        : await register(userStr, password)
      signIn(data.user, data.token)
      setUsername('')
      setPassword('')
      navigate('/')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <div className="welcome-page">
        <div className="welcome-hero">
          <p className="welcome-statement">You are signed in as {user.username}.</p>
          <Link to="/" className="btn btn-primary">Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="welcome-page">
      <div className="welcome-hero">
        <h1 className="welcome-title">Sign in</h1>
        <p className="welcome-desc">
          Sign in or create an account to use Dialogue Buddy.
        </p>
        <form onSubmit={handleSubmit} className="signin-form">
          <input
            type="text"
            className="form-input"
            placeholder="Username"
            value={username}
            onChange={e => { setUsername(e.target.value); setError('') }}
            autoComplete="username"
            autoFocus
          />
          <input
            type="password"
            className="form-input"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </div>
          <button
            type="button"
            className="btn-text-link"
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); setPassword('') }}
          >
            {mode === 'login' ? 'Create an account' : 'Already have an account? Sign in'}
          </button>
        </form>
        <p className="signin-back">
          <Link to="/">← Back to home</Link>
        </p>
      </div>
    </div>
  )
}
