import Section from './Section'
import RollText from './RollText'
import { vars } from '@/lib/cssVars'
import { pad2 } from '@/lib/format'
import type { LangContent } from '@/domain/types'

interface WorkProps {
  t: LangContent
}

// Tres tarjetas anchas con número grande, en vez de una lista angosta.
const TONES = ['card-navy', 'card-signal', 'card-ink']

const Work = ({ t }: WorkProps) => (
  <Section id="work" title={t.work.title} wide>
    <ul className="work-grid">
      {t.work.items.map((item, i) => (
        <li
          className={`work-card roll-host ${TONES[i % TONES.length]}`}
          key={item.title}
          style={vars({ '--i': i })}
        >
          <span className="work-num" aria-hidden="true">{pad2(i + 1)}</span>
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
