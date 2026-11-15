import { useEffect, useState } from 'react'
import RollText from './RollText'
import { useContent } from '@/hooks/useContent'
import { useOverHero } from '@/hooks/useOverHero'
import { vars } from '@/lib/cssVars'
import type { LangContent } from '@/domain/types'

interface HeaderProps {
  t: LangContent
  onToggleLang: () => void
}

// Menú desplegable estilo lusion.co: todo el listado queda dentro del panel.
const Header = ({ t, onToggleLang }: HeaderProps) => {
  const { links: LINKS } = useContent()
  const over = useOverHero()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const items: [id: string, label: string][] = [
    ['experience', t.nav.experience],
    ['projects', t.nav.projects],
    ['work', t.nav.work],
    ['skills', t.nav.skills],
    ['contact', t.nav.contact],
  ]

  return (
    <header className={`site-header${over && !open ? ' site-header--over' : ''}${open ? ' is-open' : ''}`}>
      <div className="site-header-inner">
        <a className="brand" href="#top" onClick={() => setOpen(false)}>Mateo Giuffra</a>

        <a className="pill pill-dark roll-host" href="#contact" onClick={() => setOpen(false)}>
          <span className="sr-only">{t.nav.talk}</span>
          <RollText text={t.nav.talk} />
          <i className="pill-dot" aria-hidden="true" />
        </a>

        <button
          type="button"
          className="pill pill-menu roll-host"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? t.nav.close : t.nav.menu}</span>
          <RollText text={open ? t.nav.close : t.nav.menu} />
          <span className="menu-dots" aria-hidden="true"><i /><i /></span>
        </button>
      </div>

      {open && (
        <button type="button" className="menu-scrim" aria-label={t.nav.close} onClick={() => setOpen(false)} />
      )}

      <nav id="site-menu" className="menu-panel" aria-label="Principal" hidden={!open}>
        <ul className="menu-card menu-links">
          {items.map(([id, label], n) => (
            <li key={id} style={vars({ '--n': n })}>
              <a className="roll-host" href={`#${id}`} onClick={() => setOpen(false)}>
                <span className="sr-only">{label}</span>
                <RollText text={label} />
                <i className="menu-dot" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>

        <div className="menu-card menu-talk" style={vars({ '--k': 5 })}>
          <p>{t.nav.talk}</p>
          <a className="menu-mail" href={LINKS.email}>
            <span>{t.contact.emailLink}</span>
            <span aria-hidden="true">→</span>
          </a>
          <button
            type="button"
            className="menu-lang"
            onClick={onToggleLang}
            aria-label={t.langToggle.label}
          >
            {t.langToggle.short}
          </button>
        </div>

        <div className="menu-card menu-social" style={vars({ '--k': 6 })}>
          <a href={LINKS.github} target="_blank" rel="noreferrer">
            <span>GitHub</span>
            <span aria-hidden="true">↗</span>
          </a>
          <a href={LINKS.linkedin} target="_blank" rel="noreferrer">
            <span>LinkedIn</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </nav>
    </header>
  )
}

export default Header
