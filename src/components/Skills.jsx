import Section from './Section'

// Parte "A, B (c, d), E" en ["A", "B (c, d)", "E"] sin cortar dentro de paréntesis.
const splitSkills = (str) => {
  const out = []
  let depth = 0
  let cur = ''
  for (const ch of str) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      out.push(cur.trim())
      cur = ''
    } else {
      cur += ch
    }
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

// Tarjetas por categoría con chips; cada chip se invierte al pasar el mouse.
const Skills = ({ t }) => (
  <Section id="skills" title={t.skills.title} wide>
    <ul className="skill-cards">
      {t.skills.groups.map(([name, items], i) => (
        <li className="skill-card" key={name}>
          <div className="skill-head">
            <h3>{name}</h3>
            <span className="skill-count" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          </div>
          <ul className="chips">
            {splitSkills(items).map((s) => <li key={s}>{s}</li>)}
          </ul>
        </li>
      ))}
    </ul>
  </Section>
)

export default Skills
