import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAllBooks,
  createBook,
} from '../data/books'

export default function Home() {
  const [version, setVersion] = useState(0)
  const books = getAllBooks()
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newTranslator, setNewTranslator] = useState('')
  const [newPublisher, setNewPublisher] = useState('')
  const [adding, setAdding] = useState(false)

  const refresh = () => setVersion(v => v + 1)

  const handleCreateBook = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    createBook(newTitle, newAuthor, newTranslator, newPublisher)
    setNewTitle('')
    setNewAuthor('')
    setNewTranslator('')
    setNewPublisher('')
    setAdding(false)
    refresh()
  }

  return (
    <div className="books-page single-page">
      <header className="books-header">
        <h1>Book Workspace</h1>
        <p className="books-desc">
          Add a book (Title, Author, Translator). Each book gets Book Overview (with Summary notes, Key concepts, Quotations, Questions, Implications), Character index, Concept index, and Argument map.
        </p>
      </header>

      <section className="books-form-section">
        {adding ? (
          <form onSubmit={handleCreateBook} className="book-add-form">
            <input
              type="text"
              className="form-input"
              placeholder="Book title (e.g. Republic)"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              autoFocus
            />
            <input
              type="text"
              className="form-input"
              placeholder="Author (e.g. Plato)"
              value={newAuthor}
              onChange={e => setNewAuthor(e.target.value)}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Translator (optional)"
              value={newTranslator}
              onChange={e => setNewTranslator(e.target.value)}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Publisher (optional)"
              value={newPublisher}
              onChange={e => setNewPublisher(e.target.value)}
            />
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setAdding(false); setNewTitle(''); setNewAuthor(''); setNewTranslator(''); setNewPublisher('') }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">Add book</button>
            </div>
          </form>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
            Add book
          </button>
        )}
      </section>

      <section className="books-list-section">
        {books.length === 0 ? (
          <p className="empty-hint">No workspaces yet. Add a book above to create a workspace with Book Overview, Character index, Concept index, and Argument map.</p>
        ) : (
          <div className="book-list">
            {books.map(book => (
              <Link key={book.id} to={`/book/${book.id}`} className="book-card-link">
                <span className="book-card-title">{book.title}</span>
                {(book.author ?? '') && <span className="book-card-meta-line">{book.author}</span>}
                {(book.translator ?? '') && <span className="book-card-meta-line">{book.translator}</span>}
                {(book.publisher ?? '') && <span className="book-card-meta-line">{book.publisher}</span>}
                <span className="book-card-meta">
                  {(book.sections || []).length} section{(book.sections || []).length !== 1 ? 's' : ''}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
