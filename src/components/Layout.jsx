import { Link } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-icon">◇</span>
          Platonic Study
        </Link>
      </header>
      <main className="main">
        {children}
      </main>
    </div>
  )
}
