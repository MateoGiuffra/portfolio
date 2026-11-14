import './App.css'
import { useLang } from './i18n/useLang'
import Header from './components/Header'
import { useReveal } from './components/useReveal'
import Marquee from './components/Marquee'
import GhostCursor from './components/GhostCursor'
import SmoothScroll from './components/SmoothScroll'
import Hero from './components/Hero'
import Work from './components/Work'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'

function App() {
  const { lang, t, toggle } = useLang()
  useReveal(lang)

  return (
    <>
      <a className="skip-link" href="#experience">{t.skip}</a>
      <SmoothScroll />
      <div className="ghost-layer" aria-hidden="true">
        <GhostCursor
          color="#B497CF"
          size={41}
          trailLength={15}
          inertia={0.32}
          turbulence={1.15}
          drift={-0.6}
          bloomStrength={0.35}
          grainIntensity={0.09}
          detail={0.35}
          brightness={0.25}
          bloomRadius={0.15}
          edgeIntensity={0}
          fadeDelayMs={500}
          fadeDurationMs={400}
          clickPuff
          intro
        />
      </div>
      <Header t={t} onToggleLang={toggle} />
      <main>
        <Hero t={t} lang={lang} />
        <Marquee items={t.skills.groups.map(([name]) => name)} />
        <Experience t={t} />
        <Projects t={t} />
        <Marquee items={t.projects.items.map((i) => i.title)} reverse outline />
        <Work t={t} />
        <Skills t={t} />
        <Contact t={t} />
      </main>
      <footer className="site-footer">
        <p>{t.footer}</p>
      </footer>
    </>
  )
}

export default App
