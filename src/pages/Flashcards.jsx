import { useState } from 'react'
import { flashcards } from '../data/dialogues'

export default function Flashcards() {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const card = flashcards[index]
  const total = flashcards.length

  const flip = () => setFlipped((f) => !f)
  const next = () => {
    setFlipped(false)
    setIndex((i) => (i + 1) % total)
  }
  const prev = () => {
    setFlipped(false)
    setIndex((i) => (i - 1 + total) % total)
  }

  return (
    <div className="flashcards-page">
      <header className="flashcards-header">
        <h1>Flashcards</h1>
        <p>Key concepts from the Platonic dialogues.</p>
      </header>

      <div className="flashcard-container">
        <div
          className={`flashcard ${flipped ? 'flipped' : ''}`}
          onClick={flip}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && flip()}
        >
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <span className="flashcard-label">Question</span>
              <p className="flashcard-text">{card.front}</p>
              <span className="flashcard-hint">Click to reveal</span>
            </div>
            <div className="flashcard-back">
              <span className="flashcard-label">Answer</span>
              <p className="flashcard-text">{card.back}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flashcard-controls">
        <button type="button" className="btn btn-secondary" onClick={prev}>
          ← Previous
        </button>
        <span className="flashcard-counter">
          {index + 1} / {total}
        </span>
        <button type="button" className="btn btn-primary" onClick={next}>
          Next →
        </button>
      </div>
    </div>
  )
}
