import ArchitectureDiagram from './ArchitectureDiagram'
import { CV_FILES, LINKS } from '../i18n/content'

const Hero = ({ t, lang }) => (
  <section id="top" className="hero">
    <div className="hero-inner">
      <div className="hero-copy">
        <h1>{t.hero.title}</h1>
        <p className="hero-text">{t.hero.text}</p>
        <div className="hero-actions">
          <a
            className="btn btn-primary"
            href={`${import.meta.env.BASE_URL}${CV_FILES[lang]}`}
            download
          >
            {t.hero.cv}
          </a>
          <a className="btn btn-outline" href="#contact">{t.hero.contact}</a>
        </div>
        <ul className="hero-links">
          <li><a href={LINKS.github} target="_blank" rel="noreferrer">GitHub</a></li>
          <li><a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
        </ul>
      </div>
      <div className="hero-figure">
        <ArchitectureDiagram hero={t.hero} />
      </div>
    </div>
  </section>
)

export default Hero
