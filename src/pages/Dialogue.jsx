import { useParams, Link } from 'react-router-dom'
import { getDialogueById, getPassages } from '../data/dialogues'

export default function Dialogue() {
  const { id } = useParams()
  const dialogue = getDialogueById(id)
  const passages = dialogue ? getPassages(dialogue.id) : []

  if (!dialogue) {
    return (
      <div className="dialogue-page">
        <p>Dialogue not found.</p>
        <Link to="/">← Back to Dialogues</Link>
      </div>
    )
  }

  return (
    <div className="dialogue-page">
      <nav className="breadcrumb">
        <Link to="/">Dialogues</Link>
        <span className="sep">/</span>
        <span>{dialogue.title}</span>
      </nav>

      <header className="dialogue-header">
        <h1>{dialogue.title}</h1>
        <p className="dialogue-meta">
          <span className="badge">{dialogue.tetralogy}</span>
          <span className="theme">{dialogue.theme}</span>
        </p>
        <p className="dialogue-desc">{dialogue.short}</p>
      </header>

      <section className="passages">
        <h2>Key passages</h2>
        <p className="passages-intro">Study these excerpts; add more in <code>src/data/dialogues.js</code>.</p>
        <ul className="passage-list">
          {passages.map((p, i) => (
            <li key={i} className="passage">
              <span className="speaker">{p.speaker}</span>
              <blockquote className="quote">{p.text}</blockquote>
            </li>
          ))}
        </ul>
      </section>

      <div className="dialogue-actions">
        <Link to="/" className="btn btn-secondary">← All Dialogues</Link>
        <Link to="/flashcards" className="btn btn-primary">Study Flashcards</Link>
      </div>
    </div>
  )
}
