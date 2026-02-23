import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllBooks, createBook } from '../data/books'
import AddBookModal from '../components/AddBookModal'

export default function Home() {
  const [version, setVersion] = useState(0)
  const books = getAllBooks()
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  const refresh = () => setVersion(v => v + 1)

  const handleAddBook = (data) => {
    const book = createBook({
      title: data.title,
      author: data.author,
      year: data.year,
      edition: data.edition,
      translator: data.translator,
      tags: data.tags,
    })
    setModalOpen(false)
    refresh()
    navigate(`/book/${book.id}`)
  }

  return (
    <div className="books-page single-page">
      <header className="books-dashboard-header">
        <h1>Books</h1>
        <p className="books-dashboard-desc">
          Philosophical literature workspaces. Add a book to create a dedicated workspace with overview, summary, arguments, quotations, and more.
        </p>
        <div className="books-dashboard-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
          >
            + Add Book
          </button>
        </div>
      </header>

      <section className="books-grid-section">
        {books.length === 0 ? (
          <p className="empty-hint">No books yet. Add a book to create a workspace.</p>
        ) : (
          <div className="books-grid">
            {books.map((book) => (
              <Link key={book.id} to={`/book/${book.id}`} className="book-card">
                <span className="book-card-title">{book.title}</span>
                {book.author && <span className="book-card-author">{book.author}</span>}
                {book.year && <span className="book-card-year">{book.year}</span>}
                {(book.tags || []).length > 0 && (
                  <div className="book-card-tags">
                    {(book.tags || []).map((tag) => (
                      <span key={tag} className="book-card-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {modalOpen && (
        <AddBookModal
          onClose={() => setModalOpen(false)}
          onSave={handleAddBook}
        />
      )}
    </div>
  )
}
