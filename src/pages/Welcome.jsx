import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Welcome() {
  const { user } = useAuth()

  return (
    <div className="welcome-page">
      <div className="welcome-hero">
        <h1 className="welcome-title">Dialogue Buddy</h1>
        <p className="welcome-tagline">Organize your reading and thinking.</p>
        <p className="welcome-motto">Philosophy Is Hard. Studying It Shouldn't Be.</p>

        {user ? (
          <>
            <p className="welcome-statement">Welcome back, {user.username}.</p>
            <p className="welcome-desc">
              Keep notes on books by section, draft essays, and track ideas, questions, and arguments—all in one place.
            </p>
            <div className="welcome-actions">
              <Link to="/books" className="btn btn-secondary welcome-btn">Books</Link>
              <Link to="/themes" className="btn btn-secondary welcome-btn">Themes</Link>
              <Link to="/essays" className="btn btn-secondary welcome-btn">Essays</Link>
            </div>
          </>
        ) : (
          <>
            <p className="welcome-statement">Welcome to Dialogue Buddy.</p>
            <p className="welcome-desc">
              Sign in or create an account to get started.
            </p>
            <section className="welcome-features" aria-label="Features">
              <h2 className="welcome-features-title">What you can do</h2>
              <div className="welcome-features-content">
                <h3 className="welcome-features-heading">Book workspace</h3>
                <p>
                  Create a dedicated workspace for each philosophical text. Add books with full bibliographic details (author, translator, edition, year) and optional tags. Each book gives you structured tabs to work through your reading:
                </p>
                <ul>
                  <li><strong>Overview</strong> — Free-form notes by section (e.g. Book 1, Book 2). Use note types such as summary, key concepts, quotations, questions, and implications, with optional subentries so you can nest and organize as you go.</li>
                  <li><strong>Summary</strong> — Chapter-by-chapter summaries with page ranges, main theses, and rich-text content that auto-saves as you type.</li>
                  <li><strong>Key arguments</strong> — Capture arguments with claim, premises, conclusion, assumptions, strengths, and weaknesses. Link arguments to themes for cross-referencing.</li>
                  <li><strong>Quotations</strong> — Store important passages with text, page numbers, context, and why they matter. Tag and link quotations to themes.</li>
                  <li><strong>Philosophical analysis</strong> — Your own analysis in expandable sections with rich text.</li>
                  <li><strong>Questions & objections</strong> — Track questions and objections that arise from the text.</li>
                  <li><strong>Cross-connections</strong> — Connect the book to shared themes and see how it ties into your broader reading.</li>
                </ul>

                <h3 className="welcome-features-heading">Themes</h3>
                <p>
                  Themes let you connect ideas across books. Create themes (e.g. justice, freedom, virtue), attach them to arguments and quotations in your book workspaces, then open any theme to see all linked books, quotations, and arguments in one place. Great for papers and revision.
                </p>

                <h3 className="welcome-features-heading">Essays</h3>
                <p>
                  Manage essay projects in one place. Add essays with title, prompt, course, and due date. Each essay gets its own workspace with Prompt Analysis, Thesis Builder, Outline, and full writing area. Export drafts to PDF when you’re ready.
                </p>

                <p className="welcome-features-close">
                  All of your books, themes, and essays stay in your account—private, organized, and ready whenever you sit down to read or write.
                </p>
              </div>
            </section>
            <div className="welcome-signin-trigger">
              <Link to="/signin" className="btn btn-secondary btn-sm welcome-signin-btn">
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
