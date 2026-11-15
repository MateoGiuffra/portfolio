import Section from './Section'
import { vars } from '@/lib/cssVars'
import { pad2 } from '@/lib/format'
import type { ExperienceSection, Job, LangContent } from '@/domain/types'

interface ExperienceProps {
  t: LangContent
}

// Meses transcurridos desde un mes de inicio "YYYY-MM" (mínimo 1).
const monthsSince = (startDate = '2026-04'): number => {
  const [year, month] = startDate.split('-').map(Number)
  const now = new Date()
  return Math.max(1, (now.getFullYear() - year) * 12 + now.getMonth() - (month - 1))
}

// Tarjeta oscura con línea de tiempo inicio → hoy + viñetas numeradas; formación en tarjetas.
// Cada trabajo (colección `jobs`) se muestra como un bloque; el primero conserva el diseño original.
const Experience = ({ t }: ExperienceProps) => {
  const e = t.experience
  const jobs: (Job | ExperienceSection)[] = e.jobs?.length ? e.jobs : [e]

  return (
    <Section id="experience" title={e.title} wide>
      {jobs.map((j) => {
        const ongoing = !j.endDate
        const months = monthsSince(j.startDate)
        const unit = months === 1 ? e.unit[0] : e.unit[1]
        return (
          <div className="exp" key={`${j.company}-${j.start}`}>
            <aside className="exp-card" aria-label={j.period}>
              <div className="tl" aria-hidden="true">
                <span className="tl-end">
                  <small>{e.startLabel}</small>
                  <b>{j.start}</b>
                </span>
                <span className="tl-line"><i /></span>
                <span className="tl-end tl-now">
                  <small>{ongoing ? e.endLabel : ''}</small>
                  <b>{j.end}</b>
                </span>
              </div>
              <span className="exp-live">
                {ongoing ? (
                  <>
                    <i aria-hidden="true" />
                    {e.ongoing} · {months} {unit}
                  </>
                ) : (
                  j.period
                )}
              </span>
              <div className="exp-brand">
                <h3 className="exp-company">{j.company}</h3>
                <p className="exp-role">{j.role}</p>
              </div>
              <div className="exp-foot">
                <span className="exp-facts">{(j.stats || []).map(([n, l]) => `${n} ${l}`).join(' · ')}</span>
                {j.siteUrl && <a className="exp-site" href={j.siteUrl} target="_blank" rel="noreferrer">{j.site} ↗</a>}
              </div>
            </aside>
            <ol className="exp-list">
              {(j.bullets || []).map((b, i) => (
                <li key={b}>
                  <span className="exp-n" aria-hidden="true">{pad2(i + 1)}</span>
                  <p>{b}</p>
                </li>
              ))}
            </ol>
          </div>
        )
      })}

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
                <span className="edu-bar"><i style={vars({ '--p': ed.progress })} /></span>
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
