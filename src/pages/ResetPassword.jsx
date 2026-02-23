import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!tokenFromUrl) {
      setError('Invalid reset link. Please use the link from your email.')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await resetPassword(tokenFromUrl, password)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="welcome-page">
        <div className="welcome-hero">
          <h1 className="welcome-title">Password reset</h1>
          <p className="welcome-desc">Your password has been reset. You can now sign in with your new password.</p>
          <Link to="/" className="btn btn-primary">Sign in</Link>
        </div>
      </div>
    )
  }

  if (!tokenFromUrl) {
    return (
      <div className="welcome-page">
        <div className="welcome-hero">
          <h1 className="welcome-title">Invalid link</h1>
          <p className="welcome-desc">This reset link is invalid or has expired. Please request a new password reset.</p>
          <Link to="/" className="btn btn-primary">Back to sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="welcome-page">
      <div className="welcome-hero">
        <h1 className="welcome-title">Set new password</h1>
        <p className="welcome-desc">Enter your new password below.</p>
        <form onSubmit={handleSubmit} className="signin-form">
          <input
            type="password"
            className="form-input"
            placeholder="New password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            autoComplete="new-password"
            autoFocus
          />
          <input
            type="password"
            className="form-input"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => { setConfirmPassword(e.target.value); setError('') }}
            autoComplete="new-password"
          />
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '…' : 'Reset password'}
            </button>
          </div>
          <Link to="/" className="btn-text-link">Back to sign in</Link>
        </form>
      </div>
    </div>
  )
}
