import Section from './Section'
import RollText from './RollText'

// Tres tarjetas anchas con número grande, en vez de una lista angosta.
const TONES = ['card-navy', 'card-signal', 'card-ink']

const Work = ({ t }) => (
  <Section id="work" title={t.work.title} wide>
    <ul className="work-grid">
      {t.work.items.map((item, i) => (
        <li className={`work-card roll-host ${TONES[i % TONES.length]}`} key={item.title}>
          <span className="work-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <div>
            <h3 className="work-card-title">
              <span className="sr-only">{item.title}</span>
              <RollText text={item.title} />
            </h3>
            <p>{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  </Section>
)

export default Work
