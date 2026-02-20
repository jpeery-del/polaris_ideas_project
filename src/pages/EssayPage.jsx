import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getEssayById, saveEssay, deleteEssay } from '../data/essays'

export default function EssayPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const essay = getEssayById(id)

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (essay) {
      setTitle(essay.title)
      setAuthor(essay.author ?? '')
      setContent(essay.content ?? '')
    }
  }, [essay?.id])

  const refresh = () => setVersion(v => v + 1)
  const current = getEssayById(id)

  if (!current) {
    return (
      <div className="essay-page">
        <p>Essay not found.</p>
        <Link to="/essays">← Back to Essays</Link>
      </div>
    )
  }

  const handleSave = () => {
    saveEssay({
      ...current,
      title: title.trim() || current.title,
      author: (author || '').trim(),
      content: content,
    })
    refresh()
  }
  const handleDelete = () => {
    if (window.confirm('Delete this essay?')) {
      deleteEssay(id)
      navigate('/essays')
    }
  }

  return (
    <div className="essay-page">
      <nav className="breadcrumb">
        <Link to="/essays">Essays</Link>
        <span className="sep">/</span>
        <span>{current.title}</span>
      </nav>

      <header className="essay-page-header">
        <input
          type="text"
          className="form-input essay-title-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleSave}
          placeholder="Title"
        />
        <input
          type="text"
          className="form-input essay-author-input"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          onBlur={handleSave}
          placeholder="Author (optional)"
        />
        <div className="essay-page-actions">
          <Link to="/essays" className="btn btn-secondary">← Essays</Link>
          <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
          <button type="button" className="btn danger" onClick={handleDelete}>Delete</button>
        </div>
      </header>

      <textarea
        className="form-input essay-content-textarea"
        value={content}
        onChange={e => setContent(e.target.value)}
        onBlur={handleSave}
        placeholder="Write your essay…"
        rows={20}
      />
    </div>
  )
}
