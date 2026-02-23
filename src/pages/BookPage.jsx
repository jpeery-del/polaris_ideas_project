import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getBookById,
  saveBook,
  deleteBook,
  addSection,
  deleteCustomType,
} from '../data/books'
import { SectionBlock } from '../components/SectionBlock'

export default function BookPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const book = getBookById(id)

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [authorValue, setAuthorValue] = useState('')
  const [translatorValue, setTranslatorValue] = useState('')
  const [publisherValue, setPublisherValue] = useState('')
  const [addingSection, setAddingSection] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [newEntryByKey, setNewEntryByKey] = useState({})
  const [editingNote, setEditingNote] = useState(null)
  const [newSubentryByKey, setNewSubentryByKey] = useState({})
  const [editingSubentry, setEditingSubentry] = useState(null)
  const [newCustomTypeLabel, setNewCustomTypeLabel] = useState(undefined)
  const [customTypesCollapsed, setCustomTypesCollapsed] = useState(false)

  useEffect(() => {
    if (book) {
      setTitleValue(book.title)
      setAuthorValue(book.author ?? '')
      setTranslatorValue(book.translator ?? '')
      setPublisherValue(book.publisher ?? '')
    }
  }, [book?.id])

  const refresh = () => setVersion(v => v + 1)
  const currentBook = getBookById(id)

  if (!currentBook) {
    return (
      <div className="book-page">
        <p>Book not found.</p>
        <Link to="/books">← Back to Book Workspace</Link>
      </div>
    )
  }

  const startEditTitle = () => {
    setTitleValue(currentBook.title)
    setAuthorValue(currentBook.author ?? '')
    setTranslatorValue(currentBook.translator ?? '')
    setPublisherValue(currentBook.publisher ?? '')
    setEditingTitle(true)
  }
  const saveTitle = () => {
    saveBook({
      ...currentBook,
      title: titleValue.trim() || currentBook.title,
      author: (authorValue || '').trim(),
      translator: (translatorValue || '').trim(),
      publisher: (publisherValue || '').trim(),
    })
    setEditingTitle(false)
    refresh()
  }
  const handleAddSection = (e) => {
    e.preventDefault()
    if (newSectionTitle.trim()) {
      addSection(currentBook.id, newSectionTitle)
      setNewSectionTitle('')
      setAddingSection(false)
      refresh()
    }
  }
  const handleDeleteBook = () => {
    if (window.confirm(`Delete "${currentBook.title}" and all its sections and notes?`)) {
      deleteBook(currentBook.id)
      navigate('/')
    }
  }
  const handleDeleteCustomType = (typeId) => {
    const type = (currentBook.customTypes || []).find(t => t.id === typeId)
    if (type && window.confirm(`Remove the custom type "${type.label}"? Entries using it will keep their content but show as "other" in the type badge.`)) {
      deleteCustomType(currentBook.id, typeId)
      refresh()
    }
  }

  const sections = (currentBook.sections || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const customTypes = currentBook.customTypes || []

  return (
    <div className="book-page">
      <nav className="breadcrumb">
        <Link to="/books">Book Workspace</Link>
        <span className="sep">/</span>
        <span>{currentBook.title}</span>
      </nav>

      <header className="book-page-header">
        {editingTitle ? (
          <div className="book-title-edit-inline" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              className="form-input book-title-inline"
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => e.key === 'Enter' && saveTitle()}
              placeholder="Title"
              autoFocus
            />
            <input
              type="text"
              className="form-input book-author-inline"
              value={authorValue}
              onChange={e => setAuthorValue(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => e.key === 'Enter' && saveTitle()}
              placeholder="Author"
            />
            <input
              type="text"
              className="form-input book-meta-inline"
              value={translatorValue}
              onChange={e => setTranslatorValue(e.target.value)}
              onBlur={saveTitle}
              placeholder="Translator (optional)"
            />
            <input
              type="text"
              className="form-input book-meta-inline"
              value={publisherValue}
              onChange={e => setPublisherValue(e.target.value)}
              onBlur={saveTitle}
              placeholder="Publisher (optional)"
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={saveTitle}>Save</button>
          </div>
        ) : (
          <div className="book-page-title-block" onClick={startEditTitle}>
            <h1 className="book-page-title">{currentBook.title}</h1>
            {(currentBook.author ?? '') && <span className="book-card-meta-line">{currentBook.author}</span>}
            {(currentBook.translator ?? '') && <span className="book-card-meta-line">{currentBook.translator}</span>}
            {(currentBook.publisher ?? '') && <span className="book-card-meta-line">{currentBook.publisher}</span>}
          </div>
        )}
        <div className="book-page-actions">
          <Link to="/books" className="btn btn-secondary">← All workspaces</Link>
          <button type="button" className="btn danger" onClick={handleDeleteBook}>Delete book</button>
        </div>
      </header>

      {addingSection ? (
        <form onSubmit={handleAddSection} className="section-add-form">
          <input
            type="text"
            className="form-input"
            placeholder="Section name (e.g. Book 1, Book 2)"
            value={newSectionTitle}
            onChange={e => setNewSectionTitle(e.target.value)}
            autoFocus
          />
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setAddingSection(false); setNewSectionTitle('') }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Add section</button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddingSection(true)}>
          + Add section
        </button>
      )}

      {customTypes.length > 0 && (
        <div className={`custom-types-block ${customTypesCollapsed ? 'custom-types-collapsed' : ''}`}>
          <button
            type="button"
            className="custom-types-header"
            onClick={() => setCustomTypesCollapsed(c => !c)}
          >
            <span className="custom-types-chevron">{customTypesCollapsed ? '▶' : '▼'}</span>
            <h3 className="custom-types-title">Custom entry types</h3>
            <span className="custom-types-count">({customTypes.length})</span>
          </button>
          {!customTypesCollapsed && (
            <ul className="custom-types-list">
              {customTypes.map(t => (
                <li key={t.id} className="custom-type-item">
                  <span className="custom-type-label">{t.label}</span>
                  <button type="button" className="btn-icon danger" onClick={() => handleDeleteCustomType(t.id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="sections-list">
        {sections.map((section, idx, arr) => (
          <SectionBlock
            key={section.id}
            bookId={currentBook.id}
            section={section}
            sectionIndex={idx}
            sectionCount={arr.length}
            newEntryByKey={newEntryByKey}
            setNewEntryByKey={setNewEntryByKey}
            editingNote={editingNote}
            setEditingNote={setEditingNote}
            newSubentryByKey={newSubentryByKey}
            setNewSubentryByKey={setNewSubentryByKey}
            editingSubentry={editingSubentry}
            setEditingSubentry={setEditingSubentry}
            onMutate={refresh}
          />
        ))}
      </div>
    </div>
  )
}
