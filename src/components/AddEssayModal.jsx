import { useState, useRef, useEffect } from 'react'

export default function AddEssayModal({ onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [course, setCourse] = useState('')
  const [dueDate, setDueDate] = useState('')
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      prompt: prompt.trim(),
      course: course.trim(),
      dueDate: dueDate.trim(),
    })
  }

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-essay-modal-title"
    >
      <div className="modal add-essay-modal">
        <div className="modal-header">
          <h2 id="add-essay-modal-title" className="modal-title">
            Add Essay
          </h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <label className="form-label" htmlFor="essay-title">
            Title <span className="required">*</span>
          </label>
          <input
            id="essay-title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Final paper"
            required
            autoFocus
          />

          <label className="form-label" htmlFor="essay-prompt">
            Essay prompt
          </label>
          <textarea
            id="essay-prompt"
            className="form-input form-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste or type the assignment prompt…"
            rows={4}
          />

          <label className="form-label" htmlFor="essay-course">
            Course
          </label>
          <input
            id="essay-course"
            type="text"
            className="form-input"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="e.g. PHIL 101"
          />

          <label className="form-label" htmlFor="essay-due-date">
            Due date
          </label>
          <input
            id="essay-due-date"
            type="date"
            className="form-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <div className="form-actions modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!title.trim()}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
