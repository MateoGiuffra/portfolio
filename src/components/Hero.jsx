import { useEffect, useRef } from 'react'
import GradientASCII from './GradientASCII'
import RollText from './RollText'
import ArchitectureDiagram from './ArchitectureDiagram'
import { CV_FILES, LINKS } from '../i18n/content'

// El hero se achica, se redondea y se desvanece a medida que se scrollea la primera pantalla.
const useHeroShrink = (ref) => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    let raf = 0
    const apply = () => {
      raf = 0
      const p = Math.min(Math.max(window.scrollY / (el.offsetHeight * 0.9), 0), 1)
      el.style.transform = `translate3d(0, ${p * 36}px, 0) scale(${1 - p * 0.1})`
      el.style.borderRadius = `${24 + p * 48}px`
      el.style.setProperty('--hero-fade', String(1 - p * 0.75))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply) }
    window.addEventListener('scroll', onScroll, { passive: true })
    apply()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [ref])
}

const Hero = ({ t, lang }) => {
  const ref = useRef(null)
  useHeroShrink(ref)
  return (
  <section id="top" className="hero" ref={ref}>
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
    <div className="hero-inner">
      <div className="hero-copy">
        <h1>{t.hero.title}</h1>
        <p className="hero-text">{t.hero.text}</p>
        <div className="hero-actions">
          <a
            className="btn btn-primary roll-host"
            href={`${import.meta.env.BASE_URL}${CV_FILES[lang]}`}
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
      <div className="hero-figure">
        <ArchitectureDiagram hero={t.hero} />
      </div>
    </div>
  </section>
  )
}

export default Hero
