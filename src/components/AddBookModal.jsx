import { useState, useRef, useEffect } from 'react'

export default function AddBookModal({ onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [year, setYear] = useState('')
  const [edition, setEdition] = useState('')
  const [translator, setTranslator] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const overlayRef = useRef(null)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleAddTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag) => {
    setTags(tags.filter((x) => x !== tag))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !author.trim()) return
    onSave({
      title: title.trim(),
      author: author.trim(),
      year: year.trim(),
      edition: edition.trim(),
      translator: translator.trim(),
      tags: [...tags],
    })
  }

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-book-modal-title"
    >
      <div className="modal add-book-modal">
        <div className="modal-header">
          <h2 id="add-book-modal-title" className="modal-title">Add Book</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <label className="form-label" htmlFor="book-title">
            Title <span className="required">*</span>
          </label>
          <input
            id="book-title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Republic"
            required
            autoFocus
          />

          <label className="form-label" htmlFor="book-author">
            Author <span className="required">*</span>
          </label>
          <input
            id="book-author"
            type="text"
            className="form-input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. Plato"
            required
          />

          <label className="form-label" htmlFor="book-year">Publication Year</label>
          <input
            id="book-year"
            type="text"
            className="form-input"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 380"
          />

          <label className="form-label" htmlFor="book-edition">Edition</label>
          <input
            id="book-edition"
            type="text"
            className="form-input"
            value={edition}
            onChange={(e) => setEdition(e.target.value)}
            placeholder="e.g. 2nd"
          />

          <label className="form-label" htmlFor="book-translator">Translator</label>
          <input
            id="book-translator"
            type="text"
            className="form-input"
            value={translator}
            onChange={(e) => setTranslator(e.target.value)}
            placeholder="Optional"
          />

          <label className="form-label">Tags</label>
          <p className="form-hint">e.g. metaphysics, ethics, political philosophy. Type and press Enter to add.</p>
          <div className="tags-input-row">
            <input
              type="text"
              className="form-input tags-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add tag"
            />
            <button type="button" className="btn btn-secondary" onClick={handleAddTag}>
              Add
            </button>
          </div>
          {(tags.length > 0) && (
            <div className="tags-list">
              {tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                  <button
                    type="button"
                    className="tag-chip-remove"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="form-actions modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim() || !author.trim()}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
