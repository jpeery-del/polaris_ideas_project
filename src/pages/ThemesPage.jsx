import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getAllThemes,
  getThemeById,
  addTheme,
  updateTheme,
  deleteTheme,
  getBooksByThemeId,
  getQuotationsByThemeId,
  getArgumentsByThemeId,
} from '../data/books'

function ThemeDetail({ themeId, onBack, navigate }) {
  const theme = getThemeById(themeId)
  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState(theme?.name ?? '')

  if (!theme) {
    return (
      <div className="themes-page">
        <p>Theme not found.</p>
        <Link to="/themes">← Back to Themes</Link>
      </div>
    )
  }

  const books = getBooksByThemeId(themeId)
  const quotations = getQuotationsByThemeId(themeId)
  const argumentsList = getArgumentsByThemeId(themeId)

  const handleSaveName = () => {
    const t = editName.trim()
    if (t && t !== theme.name) {
      updateTheme(themeId, { name: t })
    }
    setEditingName(false)
  }

  return (
    <div className="themes-page themes-detail">
      <nav className="breadcrumb">
        <Link to="/themes">Themes</Link>
        <span className="sep">/</span>
        <span>{theme.name}</span>
      </nav>

      <header className="themes-detail-header">
        {editingName ? (
          <div className="themes-title-edit">
            <input
              type="text"
              className="form-input themes-title-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              autoFocus
            />
            <button type="button" className="btn btn-sm" onClick={handleSaveName}>Save</button>
          </div>
        ) : (
          <h1 className="themes-detail-title" onClick={() => { setEditName(theme.name); setEditingName(true) }} title="Click to edit">
            {theme.name}
          </h1>
        )}
        <div className="themes-detail-actions">
          <button type="button" className="btn btn-secondary" onClick={onBack}>← All themes</button>
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              if (window.confirm(`Delete theme "${theme.name}"? This will not remove the theme from books, quotations, or arguments—you may end up with broken links.`)) {
                deleteTheme(themeId)
                if (navigate) navigate('/themes')
                else onBack()
              }
            }}
          >
            Delete theme
          </button>
        </div>
      </header>

      <section className="themes-detail-section">
        <h2>Connected books</h2>
        {books.length === 0 ? (
          <p className="themes-empty">No books linked to this theme.</p>
        ) : (
          <ul className="themes-list themes-books">
            {books.map((b) => (
              <li key={b.id}>
                <Link to={`/book/${b.id}`} className="themes-link">{b.title}</Link>
                {b.author && <span className="themes-meta"> — {b.author}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="themes-detail-section">
        <h2>Connected quotations</h2>
        {quotations.length === 0 ? (
          <p className="themes-empty">No quotations linked to this theme.</p>
        ) : (
          <ul className="themes-list themes-quotations">
            {quotations.map(({ book, quotation }) => (
              <li key={`${book.id}-${quotation.id}`} className="themes-quotation-item">
                <span className="themes-quotation-text">"{ (quotation.quoteText || '').trim().slice(0, 120) }{ (quotation.quoteText || '').trim().length > 120 ? '…' : '' }"</span>
                <span className="themes-quotation-source">
                  — <Link to={`/book/${book.id}`}>{book.title}</Link>
                  {quotation.pageNumber ? `, p. ${quotation.pageNumber}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="themes-detail-section">
        <h2>Connected arguments</h2>
        {argumentsList.length === 0 ? (
          <p className="themes-empty">No arguments linked to this theme.</p>
        ) : (
          <ul className="themes-list themes-arguments">
            {argumentsList.map(({ book, argument }) => (
              <li key={`${book.id}-${argument.id}`} className="themes-argument-item">
                <span className="themes-argument-title">{argument.title?.trim() || 'Untitled argument'}</span>
                {argument.claim && (
                  <span className="themes-argument-claim"> — {argument.claim.trim().slice(0, 80)}{ argument.claim.trim().length > 80 ? '…' : '' }</span>
                )}
                <span className="themes-argument-source">
                  — <Link to={`/book/${book.id}`}>{book.title}</Link>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default function ThemesPage() {
  const { themeId } = useParams()
  const [version, setVersion] = useState(0)
  const [newThemeName, setNewThemeName] = useState('')

  const themes = getAllThemes()

  const refresh = () => setVersion(v => v + 1)

  const navigate = useNavigate()
  if (themeId) {
    return (
      <ThemeDetail
        themeId={themeId}
        onBack={() => navigate(-1)}
        navigate={navigate}
      />
    )
  }

  const handleAddTheme = () => {
    const t = (newThemeName || '').trim()
    if (!t) return
    addTheme(t)
    setNewThemeName('')
    refresh()
  }

  return (
    <div className="themes-page themes-index">
      <header className="themes-index-header">
        <h1>Themes</h1>
        <p className="themes-index-desc">
          Shared themes for cross-connecting books, quotations, and arguments. Click a theme to see all connected items.
        </p>
        <div className="themes-index-actions">
          <input
            type="text"
            className="form-input themes-new-input"
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTheme())}
            placeholder="New theme name (e.g. justice, freedom)"
          />
          <button type="button" className="btn btn-primary" onClick={handleAddTheme}>
            + Add theme
          </button>
        </div>
      </header>

      <section className="themes-index-list">
        {themes.length === 0 ? (
          <p className="themes-empty">No themes yet. Create a theme above or link to themes from a book’s Cross-Connections tab.</p>
        ) : (
          <ul className="themes-grid">
            {themes.map((theme) => (
              <li key={theme.id}>
                <Link to={`/themes/${theme.id}`} className="themes-card">
                  <span className="themes-card-name">{theme.name}</span>
                  <span className="themes-card-hint">Click to view connections</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
