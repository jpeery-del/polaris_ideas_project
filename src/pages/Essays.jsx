import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllEssays, createEssay } from '../data/essays'

export default function Essays() {
  const [version, setVersion] = useState(0)
  const essays = getAllEssays()
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [adding, setAdding] = useState(false)

  const refresh = () => setVersion(v => v + 1)

  const handleCreate = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    createEssay(newTitle, newAuthor)
    setNewTitle('')
    setNewAuthor('')
    setAdding(false)
    refresh()
  }

  return (
    <div className="essays-page">
      <header className="essays-header">
        <h1>Essays</h1>
        <p className="essays-desc">Draft and organize your essays. Add a title and start writing.</p>
      </header>

      <section className="essays-form-section">
        {adding ? (
          <form onSubmit={handleCreate} className="essay-add-form">
            <input
              type="text"
              className="form-input"
              placeholder="Essay title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              autoFocus
            />
            <input
              type="text"
              className="form-input"
              placeholder="Author (optional)"
              value={newAuthor}
              onChange={e => setNewAuthor(e.target.value)}
            />
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setAdding(false); setNewTitle(''); setNewAuthor('') }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">Add essay</button>
            </div>
          </form>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
            + Add essay
          </button>
        )}
      </section>

      <section className="essays-list-section">
        {essays.length === 0 ? (
          <p className="empty-hint">No essays yet. Add one above to start writing.</p>
        ) : (
          <ul className="essay-list">
            {essays.map(essay => (
              <li key={essay.id}>
                <Link to={`/essays/${essay.id}`} className="essay-card">
                  <span className="essay-card-title">{essay.title}</span>
                  {essay.author && <span className="essay-card-author">{essay.author}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
