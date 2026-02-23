import { Link } from 'react-router-dom'

export default function ThemeIdsPicker({ themeIds, allThemes, onChange }) {
  const themes = allThemes || []
  const selected = themeIds.map(id => themes.find(t => t.id === id)).filter(Boolean)
  const add = (id) => {
    if (!id || themeIds.includes(id)) return
    onChange([...themeIds, id])
  }
  const remove = (id) => onChange(themeIds.filter(x => x !== id))
  return (
    <div className="quotations-themes-wrap">
      <div className="quotations-themes-list">
        {selected.map((t) => (
          <span key={t.id} className="quotations-theme-pill">
            <Link to={`/themes/${t.id}`} className="quotations-theme-link">{t.name}</Link>
            <button type="button" className="quotations-tag-remove" onClick={() => remove(t.id)} aria-label={`Remove ${t.name}`}>×</button>
          </span>
        ))}
      </div>
      {themes.filter(t => !themeIds.includes(t.id)).length > 0 && (
        <select
          className="form-input quotations-theme-select"
          value=""
          onChange={(e) => { add(e.target.value); e.target.value = '' }}
        >
          <option value="">— Add shared theme —</option>
          {themes.filter(t => !themeIds.includes(t.id)).map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      )}
      {themes.length === 0 && (
        <span className="quotations-themes-hint"><Link to="/themes">Create themes</Link> in the Themes index or in Cross-Connections to link here.</span>
      )}
    </div>
  )
}
