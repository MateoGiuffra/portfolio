import type { ReactNode } from 'react'

interface SectionProps {
  id: string
  title: string
  wide?: boolean
  children?: ReactNode
}

// Sección estilo lusion.co: título enorme arriba (máscara que sube) y contenido debajo.
const Section = ({ id, title, wide = false, children }: SectionProps) => (
  <section id={id} className="section" aria-labelledby={`${id}-title`}>
    <div className="section-inner">
      <h2 id={`${id}-title`} className="section-title" data-reveal="mask">
        <span className="mask-in">{title}</span>
      </h2>
      <div className={`section-body${wide ? ' section-body--wide' : ''}`} data-reveal="rise">{children}</div>
    </div>
  </section>
)

export default Section
