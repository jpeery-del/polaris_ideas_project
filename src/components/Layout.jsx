import { Link, useLocation } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Dialogues' },
  { to: '/flashcards', label: 'Flashcards' },
  { to: '/notes', label: 'Notes' },
]

export default function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-icon">◇</span>
          Platonic Study
        </Link>
        <nav className="nav">
          {nav.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${location.pathname === to || (to === '/' && location.pathname.startsWith('/dialogue')) ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="main">
        {children}
      </main>
    </div>
  )
}
