import { useRef } from 'react'
import RollText from './RollText'
import HoverCursor from './HoverCursor'
import ProjectCardArt from './ProjectCardArt'
import { cardOf } from '@/config/cardPalette'
import type { CursorMode } from '@/config/cursor'
import type { LangContent } from '@/domain/types'
import { useRevealCards } from '@/hooks/useRevealCards'
import { useSpine } from '@/hooks/useSpine'
import { vars } from '@/lib/cssVars'

interface ProjectsProps {
  t: LangContent
  cursorMode?: CursorMode
}

const Projects = ({ t, cursorMode = 'ghost' }: ProjectsProps) => {
  const p = t.projects
  const listRef = useRef<HTMLUListElement>(null)
  useRevealCards(listRef, p.items.length)
  useSpine(listRef, p.items.length)

  return (
    <section id="projects" className="featured" aria-labelledby="projects-title">
      <div className="featured-inner">
        <div className="featured-top">
          <h2 id="projects-title" className="featured-title">{p.title}</h2>
          <p className="featured-lead">{p.lead}</p>
        </div>
        <ul className="featured-list" ref={listRef}>
          {p.items.map((item, idx) => {
            const card = cardOf(item, idx)
            return (
              <li
                className="fcard roll-host"
                key={item.title}
                style={vars({ '--card-bg': card.bg, '--card-fg': card.fg, '--card-accent': card.accent })}
              >
                <a
                  className={`fcard-image fcard-image--${card.variant}`}
                  data-cursor
                  href={item.demo || item.code}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.title}
                >
                  <ProjectCardArt item={item} idx={idx} />
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
      {cursorMode === 'ghost' && <HoverCursor label={p.view} />}
    </section>
  )
}

export default Projects
