import Section from './Section'

const Projects = ({ t }) => {
  const p = t.projects
  return (
    <Section id="projects" title={p.title}>
      <ul className="project-list">
        {p.items.map((item) => (
          <li className="project" key={item.title}>
            <div className="project-head">
              <h3>{item.title}</h3>
              <span className="project-links">
                <a href={item.code} target="_blank" rel="noreferrer">{p.code}</a>
                {item.demo && <a href={item.demo} target="_blank" rel="noreferrer">{p.demo}</a>}
              </span>
            </div>
            <p>{item.text}</p>
            <ul className="stack" aria-label="Stack">
              {item.stack.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export default Projects
