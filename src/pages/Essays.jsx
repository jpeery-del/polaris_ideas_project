import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllEssays, createEssay } from '../data/essays'
import AddEssayModal from '../components/AddEssayModal'

export default function Essays() {
  const [version, setVersion] = useState(0)
  const essays = getAllEssays()
  const [viewMode, setViewMode] = useState('list') // 'list' | 'grid'
  const [showAddModal, setShowAddModal] = useState(false)
  const navigate = useNavigate()

  const refresh = () => setVersion((v) => v + 1)

  const handleAddSave = ({ title, prompt, course, dueDate }) => {
    const essay = createEssay(title, prompt, course, dueDate)
    setShowAddModal(false)
    refresh()
    navigate(`/essays/${essay.id}`)
  }

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null
    try {
      const d = new Date(dueDate)
      return isNaN(d.getTime()) ? dueDate : d.toLocaleDateString(undefined, { dateStyle: 'medium' })
    } catch {
      return dueDate
    }
  }

  return (
    <div className="essays-page">
      <header className="essays-header">
        <h1>Essays</h1>
        <p className="essays-desc">
          Manage your essays. Add a new essay to get a workspace with Prompt Analysis, Thesis Builder, Outline, and more.
        </p>
      </header>

      <section className="essays-toolbar">
        <div className="essays-view-toggle">
          <button
            type="button"
            className={`btn btn-secondary ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
          >
            List
          </button>
          <button
            type="button"
            className={`btn btn-secondary ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
          >
            Grid
          </button>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add essay
        </button>
      </section>

      <section className="essays-list-section">
        {essays.length === 0 ? (
          <p className="empty-hint">No essays yet. Add one to create a workspace and start planning.</p>
        ) : (
          <ul className={`essay-list essay-list--${viewMode}`}>
            {essays.map((essay) => (
              <li key={essay.id}>
                <Link to={`/essays/${essay.id}`} className="essay-card">
                  <span className="essay-card-title">{essay.title}</span>
                  {essay.course && (
                    <span className="essay-card-course">{essay.course}</span>
                  )}
                  {essay.dueDate && (
                    <span className="essay-card-due">
                      Due {formatDueDate(essay.dueDate)}
                    </span>
                  )}
                  <span className={`essay-card-status essay-card-status--${essay.status.toLowerCase()}`}>
                    {essay.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showAddModal && (
        <AddEssayModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddSave}
        />
      )}
    </div>
  )
}
