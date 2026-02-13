import { Link } from 'react-router-dom'
import { tetralogies } from '../data/dialogues'

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Dialogues of Plato</h1>
        <p className="tagline">Read, reflect, and study the dialogues by tetralogy.</p>
      </section>

      <div className="tetralogies">
        {tetralogies.map((t) => (
          <section key={t.name} className="tetralogy">
            <h2 className="tetralogy-title">{t.name}</h2>
            <p className="tetralogy-theme">{t.theme}</p>
            <ul className="dialogue-list">
              {t.dialogues.map((d) => (
                <li key={d.id}>
                  <Link to={`/dialogue/${d.id}`} className="dialogue-card">
                    <span className="dialogue-name">{d.title}</span>
                    <span className="dialogue-theme">{d.theme}</span>
                    <span className="dialogue-short">{d.short}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
