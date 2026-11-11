import Section from './Section'

const Work = ({ t }) => (
  <Section id="work" title={t.work.title}>
    <dl className="work-list">
      {t.work.items.map((item) => (
        <div className="work-item" key={item.title}>
          <dt>{item.title}</dt>
          <dd>{item.text}</dd>
        </div>
      ))}
    </dl>
  </Section>
)

export default Work
