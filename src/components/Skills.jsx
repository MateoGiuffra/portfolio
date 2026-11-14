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

// Filas a todo el ancho: al pasar el mouse la fila se llena de azul desde abajo y los chips saltan en cascada.
const Skills = ({ t }) => (
  <Section id="skills" title={t.skills.title} wide>
    <ul className="skill-rows">
      {t.skills.groups.map(([name, items], i) => {
        const list = splitSkills(items)
        return (
          <li className="skill-row" key={name} tabIndex={0}>
            <span className="skill-fill" aria-hidden="true" />
            <span className="skill-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="skill-name">{name}</h3>
            <ul className="skill-chips">
              {list.map((s, k) => (
                <li key={s} style={{ '--k': k }}>{s}</li>
              ))}
            </ul>
            <span className="skill-total" aria-hidden="true">{list.length}</span>
          </li>
        )
      })}
    </ul>
  </Section>
)

export default Skills
