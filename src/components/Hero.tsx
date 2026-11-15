import GradientASCII from './GradientASCII'
import RollText from './RollText'
import { useContent } from '@/hooks/useContent'
import type { Lang, LangContent } from '@/domain/types'

interface HeroProps {
  t: LangContent
  lang: Lang
}

// Hero a pantalla completa: fondo GradientASCII con el texto abajo a la izquierda.
const Hero = ({ t, lang }: HeroProps) => {
  const { links: LINKS, cv } = useContent()
  return (
  <section id="top" className="hero hero--full">
    <div className="hero-bg" aria-hidden="true">
      <GradientASCII
        colors={['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8']}
        shape="horizon"
        characters=" =+xX0S8#@"
        cellSize={18}
        density={0.8}
        glyphOpacity={0.85}
        glow={0.2}
        depthOfField={0}
        flicker={0.2}
        softness={0.5}
        scale={1}
        flow={0.5}
        speed={1}
        gradientOpacity={0.9}
        grain={0.08}
        variation={0}
        mouseInteraction
        scrambleRadius={0.1}
        clickEffect="wave"
        intro
        lightMode={false}
      />
    </div>
    <div className="hero-inner hero-inner--full">
      <div className="hero-copy">
        <h1>{t.hero.title}</h1>
        <p className="hero-text">{t.hero.text}</p>
        <div className="hero-actions">
          <a
            className="btn btn-primary roll-host"
            href={`${import.meta.env.BASE_URL}${cv[lang]}`}
            download
          >
            <span className="sr-only">{t.hero.cv}</span>
            <RollText text={t.hero.cv} />
          </a>
          <a className="btn btn-outline roll-host" href="#contact">
            <span className="sr-only">{t.hero.contact}</span>
            <RollText text={t.hero.contact} />
          </a>
        </div>
        <ul className="hero-links">
          <li><a href={LINKS.github} target="_blank" rel="noreferrer">GitHub</a></li>
          <li><a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
        </ul>
      </div>
    </div>
  </section>
  )
}

export default Hero
