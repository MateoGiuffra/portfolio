import { Suspense, lazy, useEffect } from 'react'
import { useLang } from '@/hooks/useLang'
import { useReveal } from '@/hooks/useReveal'
import { useGhostOnBackground } from '@/hooks/useGhostOnBackground'
import { cursorConfig } from '@/config/cursor'
import { ghostPreset } from '@/config/ghostPreset'
import { asciiPreset } from '@/config/asciiPreset'
import Header from '@/components/Header'
import FigmaCursor from '@/components/FigmaCursor'
import SmoothScroll from '@/components/SmoothScroll'
import Hero from '@/components/Hero'
import GradientASCII from '@/components/GradientASCII'
import Work from '@/components/Work'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Contact from '@/components/Contact'

// Solo se descarga si el modo de cursor es 'ghost'.
const GhostCursor = lazy(() => import('@/components/GhostCursor'))

export default function Home() {
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
          <Suspense fallback={null}>
            <GhostCursor {...ghostPreset} />
          </Suspense>
        </div>
      )}
      {mode === 'figma' && <FigmaCursor {...cursorConfig.figma} />}
      <Header t={t} onToggleLang={toggle} />
      <main>
        <Hero t={t} lang={lang} />
        <div className="sheet">
          <div className="ascii-band" aria-hidden="true">
            <GradientASCII {...asciiPreset} />
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
