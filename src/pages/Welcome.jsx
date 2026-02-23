import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login, register } from '../api/auth'

export default function Welcome() {
  const { user, signIn, signOut } = useAuth()
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
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="welcome-page">
      <div className="welcome-hero">
        <h1 className="welcome-title">Dialogue Buddy</h1>
        <p className="welcome-tagline">Organize your reading and thinking.</p>

        {user ? (
          <>
            <p className="welcome-statement">Welcome back, {user.username}.</p>
            <p className="welcome-desc">
              Keep notes on books by section, draft essays, and track ideas, questions, and arguments—all in one place.
            </p>
            <div className="welcome-actions">
              <Link to="/books" className="btn btn-primary welcome-btn">Book Workspace</Link>
              <Link to="/essays" className="btn btn-secondary welcome-btn">Essays</Link>
              <button type="button" className="btn btn-secondary welcome-btn" onClick={signOut}>Sign out</button>
            </div>
          </>
        ) : (
          <>
            <p className="welcome-statement">Welcome to Dialogue Buddy.</p>
            <p className="welcome-desc">
              Sign in or create an account to organize notes on books, draft essays, and track ideas.
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
          </>
        )}
      </div>
    </div>
  )
}
