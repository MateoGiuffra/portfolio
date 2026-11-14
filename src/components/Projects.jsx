import { useEffect } from 'react'
import RollText from './RollText'
import HoverCursor from './HoverCursor'

// Paleta por tarjeta: [fondo, texto, acento del degradé].
const PALETTE = [
  ['#1a1411', '#ffedd7', '#c4793a'],
  ['#181818', '#fffde0', '#6b8fb5'],
  ['#121414', '#ffffff', '#2f6f8f'],
  ['#111a13', '#d9f3de', '#4f8a5b'],
  ['#e3e3f8', '#000000', '#a9a9f0'],
  ['#efd5d3', '#000000', '#e39a94'],
  ['#261c46', '#ffffff', '#7a5cff'],
]

const Projects = ({ t }) => {
  const p = t.projects

  // Reveal al entrar en viewport. Las tarjetas son visibles por defecto: solo se ocultan
  // (clase "will-reveal") las que están fuera de pantalla, así nunca quedan invisibles.
  useEffect(() => {
    const cards = [...document.querySelectorAll('.fcard')]
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) return
    const vh = window.innerHeight
    const pending = cards.filter((c) => c.getBoundingClientRect().top > vh * 0.9)
    pending.forEach((c) => c.classList.add('will-reveal'))
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      }),
      { threshold: 0.05 }
    )
    pending.forEach((c) => io.observe(c))
    return () => {
      io.disconnect()
      pending.forEach((c) => c.classList.remove('will-reveal', 'is-in'))
    }
  }, [p.items.length])

  return (
    <section id="projects" className="featured" aria-labelledby="projects-title">
      <div className="featured-inner">
        <div className="featured-top">
          <h2 id="projects-title" className="featured-title">{p.title}</h2>
          <p className="featured-lead">{p.lead}</p>
        </div>
        <ul className="featured-list">
          {p.items.map((item, idx) => {
            const [bg, fg, accent] = PALETTE[idx % PALETTE.length]
            return (
              <li
                className="fcard roll-host"
                key={item.title}
                style={{ '--card-bg': bg, '--card-fg': fg, '--card-accent': accent }}
              >
                <a
                  className="fcard-image"
                  data-cursor
                  href={item.demo || item.code}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.title}
                >
                  <span className="fcard-mark" aria-hidden="true">{item.title}</span>
                  <span className="fcard-num" aria-hidden="true">{String(idx + 1).padStart(2, '0')}</span>
                </a>
                <div className="fcard-line1">{item.stack.join(' • ')}</div>
                <h3 className="fcard-title">
                  <span className="sr-only">{item.title}</span>
                  <RollText text={item.title} />
                </h3>
                <p className="fcard-text">{item.text}</p>
                <span className="fcard-links">
                  <a href={item.code} target="_blank" rel="noreferrer">{p.code} ↗</a>
                  {item.demo && <a href={item.demo} target="_blank" rel="noreferrer">{p.demo} ↗</a>}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <HoverCursor label={p.view} />
    </section>
  )
}

export default Projects
