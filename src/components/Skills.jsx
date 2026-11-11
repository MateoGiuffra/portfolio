import Section from './Section'

const Skills = ({ t }) => (
  <Section id="skills" title={t.skills.title}>
    <dl className="skills-list">
      {t.skills.groups.map(([name, items]) => (
        <div className="skills-row" key={name}>
          <dt>{name}</dt>
          <dd>{items}</dd>
        </div>
      ))}
    </dl>
  </Section>
)

export default Skills
