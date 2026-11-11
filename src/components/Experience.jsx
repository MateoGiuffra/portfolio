import Section from './Section'

const Experience = ({ t }) => {
  const e = t.experience
  return (
    <Section id="experience" title={e.title}>
      <article className="job">
        <h3>{e.company}</h3>
        <p className="job-meta">{e.role}. {e.period}</p>
        <ul className="job-bullets">
          {e.bullets.map((b) => <li key={b}>{b}</li>)}
        </ul>
      </article>

      <h3 className="subhead">{e.educationTitle}</h3>
      <ul className="edu-list">
        {e.education.map((ed) => (
          <li key={ed.name}>
            <strong>{ed.name}</strong>
            <span className="edu-meta">{ed.where}. {ed.period}</span>
            {ed.text && <p>{ed.text}</p>}
          </li>
        ))}
      </ul>
    </Section>
  )
}

export default Experience
