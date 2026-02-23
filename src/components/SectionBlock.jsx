import { useState, useEffect } from 'react'
import {
  getBookById,
  updateSection,
  deleteSection,
  moveSection,
  addNote,
  updateNote,
  deleteNote,
  addSubentry,
  updateSubentry,
  deleteSubentry,
  NOTE_TYPES,
  BOOK_OVERVIEW_NOTE_TYPES,
} from '../data/books'

export function SectionBlock({
  bookId,
  section,
  sectionIndex,
  sectionCount,
  newEntryByKey,
  setNewEntryByKey,
  editingNote,
  setEditingNote,
  newSubentryByKey,
  setNewSubentryByKey,
  editingSubentry,
  setEditingSubentry,
  onMutate,
}) {
  const [editingSectionTitle, setEditingSectionTitle] = useState(false)
  const [sectionTitleValue, setSectionTitleValue] = useState(section.title)
  const book = getBookById(bookId)
  useEffect(() => {
    setSectionTitleValue(section.title)
  }, [section.title])

  const saveSectionTitle = () => {
    if (sectionTitleValue.trim()) {
      updateSection(bookId, section.id, { title: sectionTitleValue.trim() })
      onMutate?.()
    }
    setEditingSectionTitle(false)
  }
  const handleDeleteSection = () => {
    if (window.confirm(`Delete section "${section.title}" and all its entries?`)) {
      deleteSection(bookId, section.id)
      onMutate?.()
    }
  }
  const handleMoveSection = (dir) => {
    moveSection(bookId, section.id, dir)
    onMutate?.()
  }

  const handleAddEntry = (e, typeId) => {
    e.preventDefault()
    const key = `${section.id}-${typeId}`
    const content = (newEntryByKey?.[key]?.content ?? '').trim()
    if (content) {
      addNote(bookId, section.id, typeId, content)
      setNewEntryByKey(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      onMutate?.()
    }
  }
  const startAddEntry = (typeId) => setNewEntryByKey(prev => ({ ...prev, [`${section.id}-${typeId}`]: { type: typeId, content: '' } }))
  const cancelAddEntry = (typeId) => setNewEntryByKey(prev => {
    const next = { ...prev }
    delete next[`${section.id}-${typeId}`]
    return next
  })

  const notes = section.notes || []
  const isBookOverview = section.title === 'Book Overview'
  const keyNote = `${section.id}-note`

  const handleAddFlatEntry = (e) => {
    e.preventDefault()
    const content = (newEntryByKey?.[keyNote]?.content ?? '').trim()
    if (content) {
      addNote(bookId, section.id, 'note', content)
      setNewEntryByKey(prev => {
        const next = { ...prev }
        delete next[keyNote]
        return next
      })
      onMutate?.()
    }
  }
  const startAddFlatEntry = () => setNewEntryByKey(prev => ({ ...prev, [keyNote]: { type: 'note', content: '' } }))
  const cancelAddFlatEntry = () => setNewEntryByKey(prev => {
    const next = { ...prev }
    delete next[keyNote]
    return next
  })

  return (
    <section className="section-block">
      <div className="section-block-header">
        <div className="section-block-title-row">
          {editingSectionTitle ? (
            <input
              type="text"
              className="form-input section-title-input"
              value={sectionTitleValue}
              onChange={e => setSectionTitleValue(e.target.value)}
              onBlur={saveSectionTitle}
              onKeyDown={e => e.key === 'Enter' && saveSectionTitle()}
              autoFocus
            />
          ) : (
            <h3 className="section-block-title" onClick={() => setEditingSectionTitle(true)} title="Click to edit">
              {section.title}
            </h3>
          )}
          <div className="section-move-actions">
            <button type="button" className="btn-icon" onClick={() => handleMoveSection('up')} disabled={sectionIndex === 0} title="Move up">↑</button>
            <button type="button" className="btn-icon" onClick={() => handleMoveSection('down')} disabled={sectionIndex >= sectionCount - 1} title="Move down">↓</button>
          </div>
        </div>
        <button type="button" className="btn-icon danger" onClick={handleDeleteSection}>Delete section</button>
      </div>

      {isBookOverview ? (
        <div className="entries-by-type">
          {BOOK_OVERVIEW_NOTE_TYPES.map(({ id: typeId, label }) => {
            const typeNotes = notes.filter(n => n.type === typeId)
            const key = `${section.id}-${typeId}`
            const newEntry = newEntryByKey?.[key]
            return (
              <div key={typeId} className="entry-type-group">
                <h4 className="entry-type-group-title">{label}</h4>
                <div className="entries-list">
                  {typeNotes.map(note => (
                    <EntryItem
                      key={note.id}
                      bookId={bookId}
                      sectionId={section.id}
                      note={note}
                      editingNote={editingNote}
                      setEditingNote={setEditingNote}
                      newSubentry={newSubentryByKey?.[note.id]}
                      setNewSubentry={c => setNewSubentryByKey(prev => ({ ...prev, [note.id]: c }))}
                      editingSubentry={editingSubentry}
                      setEditingSubentry={setEditingSubentry}
                      onMutate={onMutate}
                    />
                  ))}
                  {newEntry ? (
                    <form onSubmit={e => handleAddEntry(e, typeId)} className="entry-add-form">
                      <textarea
                        className="form-input note-edit-textarea"
                        placeholder={`Add ${label.toLowerCase()}…`}
                        value={newEntry.content || ''}
                        onChange={e => setNewEntryByKey(prev => ({ ...prev, [key]: { type: typeId, content: e.target.value } }))}
                        rows={2}
                      />
                      <div className="note-edit-actions">
                        <button type="button" className="btn-icon" onClick={() => cancelAddEntry(typeId)}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm">Add</button>
                      </div>
                    </form>
                  ) : (
                    <button type="button" className="btn-icon add-note-btn" onClick={() => startAddEntry(typeId)}>
                      + Add {label.toLowerCase()}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="entries-list">
          {notes.map(note => (
            <EntryItem
              key={note.id}
              bookId={bookId}
              sectionId={section.id}
              note={note}
              editingNote={editingNote}
              setEditingNote={setEditingNote}
              newSubentry={newSubentryByKey?.[note.id]}
              setNewSubentry={c => setNewSubentryByKey(prev => ({ ...prev, [note.id]: c }))}
              editingSubentry={editingSubentry}
              setEditingSubentry={setEditingSubentry}
              onMutate={onMutate}
            />
          ))}
          {newEntryByKey?.[keyNote] !== undefined ? (
            <form onSubmit={handleAddFlatEntry} className="entry-add-form">
              <textarea
                className="form-input note-edit-textarea"
                placeholder="Add note…"
                value={newEntryByKey[keyNote]?.content || ''}
                onChange={e => setNewEntryByKey(prev => ({ ...prev, [keyNote]: { type: 'note', content: e.target.value } }))}
                rows={2}
              />
              <div className="note-edit-actions">
                <button type="button" className="btn-icon" onClick={cancelAddFlatEntry}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Add entry</button>
              </div>
            </form>
          ) : (
            <button type="button" className="btn-icon add-note-btn" onClick={startAddFlatEntry}>
              + Add entry
            </button>
          )}
        </div>
      )}
    </section>
  )
}

export function EntryItem({
  bookId,
  sectionId,
  note,
  editingNote,
  setEditingNote,
  newSubentry,
  setNewSubentry,
  editingSubentry,
  setEditingSubentry,
  onMutate,
}) {
  const typeLabel = NOTE_TYPES.find(t => t.id === note.type)?.label ?? note.type ?? 'Note'
  const subentries = note.subentries || []

  return (
    <div className="entry-item">
      <div className="entry-item-main">
        {editingNote?.noteId === note.id ? (
          <div className="note-edit-inline">
            <textarea
              className="form-input note-edit-textarea"
              value={editingNote.content}
              onChange={e => setEditingNote(prev => prev ? { ...prev, content: e.target.value } : null)}
              rows={2}
            />
            <div className="note-edit-actions">
              <button type="button" className="btn-icon" onClick={() => setEditingNote(null)}>Cancel</button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  updateNote(bookId, sectionId, note.id, { content: editingNote.content.trim() })
                  setEditingNote(null)
                  onMutate?.()
                }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className="entry-type-badge">{typeLabel}</span>
            <p className="note-content">{note.content}</p>
            <div className="note-item-actions">
              <button type="button" className="btn-icon" onClick={() => setEditingNote({ sectionId, noteId: note.id, content: note.content })}>Edit</button>
              <button
                type="button"
                className="btn-icon danger"
                onClick={() => window.confirm('Delete this entry?') && (deleteNote(bookId, sectionId, note.id), onMutate?.())}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
      <div className="subentries-list">
        {subentries.map(sub => (
          <div key={sub.id} className="subentry-item">
            {editingSubentry?.noteId === note.id && editingSubentry?.subentryId === sub.id ? (
              <div className="note-edit-inline subentry-edit">
                <textarea
                  className="form-input note-edit-textarea"
                  value={editingSubentry.content}
                  onChange={e => setEditingSubentry(prev => prev ? { ...prev, content: e.target.value } : null)}
                  rows={1}
                />
                <div className="note-edit-actions">
                  <button type="button" className="btn-icon" onClick={() => setEditingSubentry(null)}>Cancel</button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      updateSubentry(bookId, sectionId, note.id, sub.id, editingSubentry.content.trim())
                      setEditingSubentry(null)
                      onMutate?.()
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="subentry-content">{sub.content}</p>
                <div className="note-item-actions">
                  <button type="button" className="btn-icon" onClick={() => setEditingSubentry({ noteId: note.id, subentryId: sub.id, sectionId, content: sub.content })}>Edit</button>
                  <button
                    type="button"
                    className="btn-icon danger"
                    onClick={() => window.confirm('Delete subentry?') && (deleteSubentry(bookId, sectionId, note.id, sub.id), onMutate?.())}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {newSubentry !== undefined && newSubentry !== null ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const content = (typeof newSubentry === 'string' ? newSubentry : '').trim()
              if (content) {
                addSubentry(bookId, sectionId, note.id, content)
                setNewSubentry(null)
                onMutate?.()
              }
            }}
            className="subentry-add-inline"
          >
            <input
              type="text"
              className="form-input"
              placeholder="Subentry…"
              value={typeof newSubentry === 'string' ? newSubentry : ''}
              onChange={e => setNewSubentry(e.target.value)}
            />
            <div className="note-edit-actions">
              <button type="button" className="btn-icon" onClick={() => setNewSubentry(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">Add</button>
            </div>
          </form>
        ) : (
          <button type="button" className="btn-icon add-subentry-btn" onClick={() => setNewSubentry('')}>
            + Add subentry
          </button>
        )}
      </div>
    </div>
  )
}
