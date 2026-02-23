import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/', label: 'Welcome' },
  { to: '/books', label: 'Books' },
  { to: '/themes', label: 'Themes' },
  { to: '/essays', label: 'Essays' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const { user, signOut } = useAuth()

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-icon">◇</span>
          Dialogue Buddy
        </Link>
        <nav className="nav">
          {nav.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${location.pathname === to || (to === '/books' && (location.pathname === '/books' || location.pathname.startsWith('/book/'))) || (to === '/themes' && (location.pathname === '/themes' || location.pathname.startsWith('/themes/'))) || (to === '/essays' && location.pathname.startsWith('/essays')) ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
          {user && (
            <span className="header-user">
              <span className="header-user-name">{user.username}</span>
              <button type="button" className="btn-icon header-signout" onClick={signOut}>Sign out</button>
            </span>
          )}
        </nav>
      </header>
      <main className="main">
        {children}
      </main>
    </div>
  )
}
