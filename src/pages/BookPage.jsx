import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getBookById,
  saveBook,
  deleteBook,
  BOOK_TAB_KEYS,
  BOOK_TAB_LABELS,
} from '../data/books'
import SummaryTab from '../components/SummaryTab'
import KeyArgumentsTab from '../components/KeyArgumentsTab'
import QuotationsTab from '../components/QuotationsTab'
import PhilosophicalAnalysisTab from '../components/PhilosophicalAnalysisTab'
import QuestionsObjectionsTab from '../components/QuestionsObjectionsTab'
import CrossConnectionsTab from '../components/CrossConnectionsTab'
import RichTextEditor from '../components/RichTextEditor'

export default function BookPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const [activeTab, setActiveTab] = useState(BOOK_TAB_KEYS[0])
  const [tabValue, setTabValue] = useState('')

  const book = getBookById(id)

  useEffect(() => {
    if (book?.tabContent && activeTab && activeTab !== 'summary' && activeTab !== 'keyArguments' && activeTab !== 'quotations' && activeTab !== 'philosophicalAnalysis' && activeTab !== 'questionsObjections' && activeTab !== 'crossConnections') {
      setTabValue(book.tabContent[activeTab] ?? '')
    }
  }, [book?.id, activeTab, version])

  const refresh = () => setVersion(v => v + 1)
  const currentBook = getBookById(id)

  if (!currentBook) {
    return (
      <div className="book-workspace-page">
        <p>Book not found.</p>
        <Link to="/books">← Back to Books</Link>
      </div>
    )
  }

  const handleTabBlur = (contentFromBlur) => {
    const structuredTabs = ['summary', 'keyArguments', 'quotations', 'philosophicalAnalysis', 'questionsObjections', 'crossConnections']
    if (structuredTabs.includes(activeTab)) return
    const content = contentFromBlur !== undefined ? contentFromBlur : tabValue
    if (content === (currentBook.tabContent || {})[activeTab]) return
    saveBook({
      ...currentBook,
      tabContent: {
        ...(currentBook.tabContent || {}),
        [activeTab]: content,
      },
    })
    refresh()
  }

  const handleDeleteBook = () => {
    if (window.confirm(`Delete "${currentBook.title}" and all its notes?`)) {
      deleteBook(currentBook.id)
      navigate('/books')
    }
  }

  const meta = [currentBook.year, currentBook.edition, currentBook.translator].filter(Boolean)

  return (
    <div className="book-workspace-page">
      <nav className="breadcrumb">
        <Link to="/books">Books</Link>
        <span className="sep">/</span>
        <span>{currentBook.title}</span>
      </nav>

      <header className="book-workspace-header">
        <div className="book-workspace-title-block">
          <h1 className="book-workspace-title">{currentBook.title}</h1>
          {currentBook.author && (
            <span className="book-workspace-author">{currentBook.author}</span>
          )}
          {meta.length > 0 && (
            <span className="book-workspace-meta">
              {meta.join(' · ')}
            </span>
          )}
          {(currentBook.tags || []).length > 0 && (
            <div className="book-workspace-tags">
              {(currentBook.tags || []).map((tag) => (
                <span key={tag} className="book-workspace-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className="book-workspace-actions">
          <Link to="/books" className="btn btn-secondary">← All books</Link>
          <button type="button" className="btn danger" onClick={handleDeleteBook}>
            Delete book
          </button>
        </div>
      </header>

      <div className="book-workspace-tabs">
        {BOOK_TAB_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`book-workspace-tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => {
              handleTabBlur()
              setActiveTab(key)
            }}
          >
            {BOOK_TAB_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="book-workspace-panel">
        {activeTab === 'summary' ? (
          <SummaryTab book={currentBook} onRefresh={refresh} />
        ) : activeTab === 'keyArguments' ? (
          <KeyArgumentsTab book={currentBook} onRefresh={refresh} />
        ) : activeTab === 'quotations' ? (
          <QuotationsTab book={currentBook} onRefresh={refresh} />
        ) : activeTab === 'philosophicalAnalysis' ? (
          <PhilosophicalAnalysisTab book={currentBook} onRefresh={refresh} />
        ) : activeTab === 'questionsObjections' ? (
          <QuestionsObjectionsTab book={currentBook} onRefresh={refresh} />
        ) : activeTab === 'crossConnections' ? (
          <CrossConnectionsTab book={currentBook} onRefresh={refresh} />
        ) : (
          <RichTextEditor
            value={tabValue}
            onChange={setTabValue}
            onBlur={handleTabBlur}
            placeholder={`Add notes for ${BOOK_TAB_LABELS[activeTab]}…`}
          />
        )}
      </div>
    </div>
  )
}
