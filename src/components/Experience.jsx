import Section from './Section'

// Tarjeta oscura fija con la empresa + viñetas numeradas; formación en tarjetas.
const Experience = ({ t }) => {
  const e = t.experience
  return (
    <Section id="experience" title={e.title} wide>
      <div className="exp">
        <aside className="exp-card">
          <span className="exp-period">{e.period}</span>
          <h3 className="exp-company">{e.company}</h3>
          <p className="exp-role">{e.role}</p>
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
        {e.education.map((ed) => (
          <li className="edu-card" key={ed.name}>
            <span className="edu-chip">{ed.period}</span>
            <strong>{ed.name}</strong>
            <span className="edu-meta">{ed.where}</span>
            {ed.text && <p>{ed.text}</p>}
          </li>
        ))}
      </ul>
    </Section>
  )
}

export default Experience
