import './App.css'
import { useLang } from './i18n/useLang'
import Header from './components/Header'
import Hero from './components/Hero'
import Work from './components/Work'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'

function App() {
  const { lang, t, toggle } = useLang()

  return (
    <>
      <a className="skip-link" href="#work">{t.skip}</a>
      <Header t={t} onToggleLang={toggle} />
      <main>
        <Hero t={t} lang={lang} />
        <Work t={t} />
        <Experience t={t} />
        <Projects t={t} />
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
