import { useEffect } from 'react'
import './App.css'
import { useLang } from './i18n/useLang'
import Header from './components/Header'
import { useReveal } from './components/useReveal'
import { useGhostOnBackground } from './components/useGhostOnBackground'
import GhostCursor from './components/GhostCursor'
import FigmaCursor from './components/FigmaCursor'
import { cursorConfig } from './config/cursor'
import SmoothScroll from './components/SmoothScroll'
import Hero from './components/Hero'
import GradientASCII from './components/GradientASCII'
import Work from './components/Work'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'

function App() {
  const { lang, t, toggle } = useLang()
  useReveal(lang)
  const mode = cursorConfig.mode
  useGhostOnBackground(mode === 'ghost')
  useEffect(() => {
    const cls = `cursor-mode-${mode}`
    document.documentElement.classList.add(cls)
    return () => document.documentElement.classList.remove(cls)
  }, [mode])

  return (
    <>
      <a className="skip-link" href="#experience">{t.skip}</a>
      <SmoothScroll />
      {mode === 'ghost' && (
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
      )}
      {mode === 'figma' && <FigmaCursor {...cursorConfig.figma} />}
      <Header t={t} onToggleLang={toggle} />
      <main>
        <Hero t={t} lang={lang} />
        <div className="sheet">
          <div className="ascii-band" aria-hidden="true">
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
              mouseInteraction={false}
              intro={false}
              lightMode={false}
            />
          </div>
          <Experience t={t} />
          <Projects t={t} cursorMode={mode} />
          <Work t={t} />
          <Skills t={t} />
          <Contact t={t} />
        </div>
      </main>
      <footer className="site-footer">
        <p>{t.footer}</p>
      </footer>
    </>
  )
}

export default App
