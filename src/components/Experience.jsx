import Section from './Section'

// Meses transcurridos desde abril 2026 (mínimo 1).
const monthsSince = (year, month) => {
  const now = new Date()
  return Math.max(1, (now.getFullYear() - year) * 12 + now.getMonth() - (month - 1))
}

// Tarjeta oscura con línea de tiempo inicio → hoy + viñetas numeradas; formación en tarjetas.
const Experience = ({ t }) => {
  const e = t.experience
  const months = monthsSince(2026, 4)
  const unit = months === 1 ? e.unit[0] : e.unit[1]

  return (
    <Section id="experience" title={e.title} wide>
      <div className="exp">
        <aside className="exp-card" aria-label={e.period}>
          <div className="tl" aria-hidden="true">
            <span className="tl-end">
              <small>{e.startLabel}</small>
              <b>{e.start}</b>
            </span>
            <span className="tl-line"><i /></span>
            <span className="tl-end tl-now">
              <small>{e.endLabel}</small>
              <b>{e.end}</b>
            </span>
          </div>
          <span className="exp-live">
            <i aria-hidden="true" />
            {e.ongoing} · {months} {unit}
          </span>
          <div className="exp-brand">
            <h3 className="exp-company">{e.company}</h3>
            <p className="exp-role">{e.role}</p>
          </div>
          <div className="exp-foot">
            <span className="exp-facts">{e.stats.map(([n, l]) => `${n} ${l}`).join(' · ')}</span>
            <a className="exp-site" href={e.siteUrl} target="_blank" rel="noreferrer">{e.site} ↗</a>
          </div>
        </aside>
        <ol className="exp-list">
          {e.bullets.map((b, i) => (
            <li key={b}>
              <span className="exp-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <p>{b}</p>
            </li>
          ))}
        </ol>
      </div>

      <h3 className="subhead">{e.educationTitle}</h3>
      <ul className="edu-grid">
        {e.education.map((ed, i) => (
          <li className={`edu-card ${ed.mark === 'UNQ' ? 'edu-red' : i % 2 ? 'edu-amber' : 'edu-navy'}`} key={ed.name}>
            <span className="edu-mark" aria-hidden="true">{ed.mark}</span>
            <div className="edu-top">
              <span className="edu-kind">{ed.kind}</span>
              <span className="edu-chip">{ed.period}</span>
            </div>
            <strong>{ed.name}</strong>
            <span className="edu-meta">{ed.where}</span>
            {ed.progress && (
              <div className="edu-progress">
                <span className="edu-bar"><i style={{ '--p': ed.progress }} /></span>
                <small>{ed.progressLabel}</small>
              </div>
            )}
            <ul className="edu-tags">
              {ed.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export default Experience
