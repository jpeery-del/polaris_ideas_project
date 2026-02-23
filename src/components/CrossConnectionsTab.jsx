import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  getAllBooks,
  getAllThemes,
  getBookById,
  saveBook,
  addTheme,
} from '../data/books'

export default function CrossConnectionsTab({ book, onRefresh }) {
  const allBooks = getAllBooks().filter(b => b.id !== book.id)
  const allThemes = getAllThemes()
  const linkedBookIds = book.linkedBookIds || []
  const themeIds = book.themeIds || []

  const [newThemeName, setNewThemeName] = useState('')

  const addLinkedBook = useCallback((bookId) => {
    if (linkedBookIds.includes(bookId)) return
    saveBook({ ...book, linkedBookIds: [...linkedBookIds, bookId] })
    onRefresh?.()
  }, [book, linkedBookIds, onRefresh])

  const removeLinkedBook = useCallback((bookId) => {
    saveBook({ ...book, linkedBookIds: linkedBookIds.filter(id => id !== bookId) })
    onRefresh?.()
  }, [book, linkedBookIds, onRefresh])

  const addBookTheme = useCallback((themeId) => {
    if (themeIds.includes(themeId)) return
    saveBook({ ...book, themeIds: [...themeIds, themeId] })
    onRefresh?.()
  }, [book, themeIds, onRefresh])

  const removeBookTheme = useCallback((themeId) => {
    saveBook({ ...book, themeIds: themeIds.filter(id => id !== themeId) })
    onRefresh?.()
  }, [book, themeIds, onRefresh])

  const handleAddNewTheme = () => {
    const t = (newThemeName || '').trim()
    if (!t) return
    const theme = addTheme(t)
    if (theme) {
      addBookTheme(theme.id)
      setNewThemeName('')
      onRefresh?.()
    }
  }

  const linkedBooks = linkedBookIds.map(id => getBookById(id)).filter(Boolean)
  const linkedThemes = themeIds.map(id => allThemes.find(t => t.id === id)).filter(Boolean)

  return (
    <div className="cross-connections-tab">
      <p className="cross-connections-intro">
        Link this book to other books and to shared themes. All linking is manual—no automatic inference.
        Use the global <Link to="/themes">Themes index</Link> to see all themes and everything connected to each.
      </p>

      <section className="cross-connections-section">
        <h2 className="cross-connections-heading">Linked books</h2>
        <p className="cross-connections-hint">Connect this book to other books in your library.</p>
        {linkedBooks.length > 0 && (
          <ul className="cross-connections-list cross-connections-books">
            {linkedBooks.map((b) => (
              <li key={b.id} className="cross-connections-list-item">
                <Link to={`/book/${b.id}`} className="cross-connections-book-link">{b.title}</Link>
                {b.author && <span className="cross-connections-meta"> — {b.author}</span>}
                <button
                  type="button"
                  className="btn btn-sm btn-icon cross-connections-remove"
                  onClick={() => removeLinkedBook(b.id)}
                  title="Unlink book"
                  aria-label="Unlink book"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {allBooks.length > 0 ? (
          <div className="cross-connections-add-wrap">
            <label className="form-label cross-connections-label">Add a book</label>
            <select
              className="form-input cross-connections-select"
              value=""
              onChange={(e) => {
                const id = e.target.value
                if (id) addLinkedBook(id)
                e.target.value = ''
              }}
            >
              <option value="">— Choose book —</option>
              {allBooks.filter(b => !linkedBookIds.includes(b.id)).map((b) => (
                <option key={b.id} value={b.id}>{b.title}{b.author ? ` (${b.author})` : ''}</option>
              ))}
            </select>
          </div>
        ) : (
          <p className="cross-connections-empty">No other books in your library. Add books from the Books page to link them here.</p>
        )}
      </section>

      <section className="cross-connections-section">
        <h2 className="cross-connections-heading">Linked themes</h2>
        <p className="cross-connections-hint">Tag this book with shared themes (e.g. justice, freedom, knowledge). Click a theme in the Themes index to see all books, quotations, and arguments tagged with it.</p>
        {linkedThemes.length > 0 && (
          <ul className="cross-connections-list cross-connections-themes">
            {linkedThemes.map((t) => (
              <li key={t.id} className="cross-connections-list-item">
                <Link to={`/themes/${t.id}`} className="cross-connections-theme-link">{t.name}</Link>
                <button
                  type="button"
                  className="btn btn-sm btn-icon cross-connections-remove"
                  onClick={() => removeBookTheme(t.id)}
                  title="Remove theme from book"
                  aria-label="Remove theme"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="cross-connections-add-wrap">
          <label className="form-label cross-connections-label">Add theme</label>
          <div className="cross-connections-theme-add-row">
            <input
              type="text"
              className="form-input cross-connections-theme-input"
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewTheme())}
              placeholder="e.g. justice, freedom, knowledge"
            />
            <button type="button" className="btn btn-primary" onClick={handleAddNewTheme}>
              Create & link
            </button>
          </div>
          {allThemes.filter(t => !themeIds.includes(t.id)).length > 0 && (
            <select
              className="form-input cross-connections-select cross-connections-select-existing"
              value=""
              onChange={(e) => {
                const id = e.target.value
                if (id) addBookTheme(id)
                e.target.value = ''
              }}
            >
              <option value="">— Or pick existing theme —</option>
              {allThemes.filter(t => !themeIds.includes(t.id)).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
        </div>
      </section>

      <section className="cross-connections-section">
        <h2 className="cross-connections-heading">In this book</h2>
        <p className="cross-connections-hint">Quotations and arguments in this book that are linked to themes appear on the theme’s page in the Themes index.</p>
        {(book.quotations || []).filter(q => (q.themeIds || []).length > 0).length > 0 && (
          <div className="cross-connections-in-book">
            <strong>Quotations with themes:</strong>{' '}
            {(book.quotations || [])
              .filter(q => (q.themeIds || []).length > 0)
              .map(q => (q.quoteText || '').trim().slice(0, 40) + ((q.quoteText || '').trim().length > 40 ? '…' : ''))
              .join(' · ') || '—'}
          </div>
        )}
        {(book.keyArguments || []).filter(a => (a.themeIds || []).length > 0).length > 0 && (
          <div className="cross-connections-in-book">
            <strong>Arguments with themes:</strong>{' '}
            {(book.keyArguments || [])
              .filter(a => (a.themeIds || []).length > 0)
              .map(a => (a.title || a.claim || '').trim().slice(0, 40) || 'Untitled')
              .join(' · ')}
          </div>
        )}
        {(book.quotations || []).filter(q => (q.themeIds || []).length > 0).length === 0 &&
         (book.keyArguments || []).filter(a => (a.themeIds || []).length > 0).length === 0 && (
          <p className="cross-connections-empty">No quotations or arguments in this book are linked to themes yet. Add theme links in the Quotations and Key Arguments tabs.</p>
        )}
      </section>
    </div>
  )
}
