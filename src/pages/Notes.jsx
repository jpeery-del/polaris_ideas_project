import { useState, useEffect } from 'react'

const STORAGE_KEY = 'platonic-study-notes'

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export default function Notes() {
  const [notes, setNotes] = useState(loadNotes)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    saveNotes(notes)
  }, [notes])

  const add = () => {
    if (!title.trim() && !body.trim()) return
    setNotes((n) => [
      ...n,
      {
        id: crypto.randomUUID(),
        title: title.trim() || 'Untitled',
        body: body.trim(),
        createdAt: new Date().toISOString(),
      },
    ])
    setTitle('')
    setBody('')
    setEditingId(null)
  }

  const remove = (id) => {
    setNotes((n) => n.filter((note) => note.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const update = (id, updates) => {
    setNotes((n) =>
      n.map((note) => (note.id === id ? { ...note, ...updates } : note))
    )
  }

  const editing = notes.find((n) => n.id === editingId)

  return (
    <div className="notes-page">
      <header className="notes-header">
        <h1>Notes</h1>
        <p>Your notes on the dialogues. Stored in this browser only.</p>
      </header>

      <section className="notes-form">
        <h2>New note</h2>
        <input
          type="text"
          className="notes-input"
          placeholder="Title (e.g. Republic, Book IV)"
          value={editing ? editing.title : title}
          onChange={(e) =>
            editing ? update(editingId, { title: e.target.value }) : setTitle(e.target.value)
          }
        />
        <textarea
          className="notes-textarea"
          placeholder="Your thoughts, quotes, or summaries…"
          rows={4}
          value={editing ? editing.body : body}
          onChange={(e) =>
            editing ? update(editingId, { body: e.target.value }) : setBody(e.target.value)
          }
        />
        <div className="notes-form-actions">
          {editing ? (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setEditingId(null)}
              >
                Done editing
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={add}>
              Add note
            </button>
          )}
        </div>
      </section>

      <section className="notes-list-section">
        <h2>Your notes ({notes.length})</h2>
        <ul className="notes-list">
          {notes.length === 0 ? (
            <li className="notes-empty">No notes yet. Add one above.</li>
          ) : (
            [...notes]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((note) => (
                <li key={note.id} className="note-card">
                  <div className="note-card-header">
                    <h3>{note.title}</h3>
                    <div className="note-card-actions">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => setEditingId(note.id)}
                        aria-label="Edit"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-icon danger"
                        onClick={() => remove(note.id)}
                        aria-label="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {note.body && <p className="note-body">{note.body}</p>}
                  <time className="note-time">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </time>
                </li>
              ))
          )}
        </ul>
      </section>
    </div>
  )
}
