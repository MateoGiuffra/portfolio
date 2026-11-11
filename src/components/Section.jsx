// Sección con título a la izquierda y contenido a la derecha (apilado en mobile).
const Section = ({ id, title, children }) => (
  <section id={id} className="section" aria-labelledby={`${id}-title`}>
    <div className="section-inner">
      <h2 id={`${id}-title`} className="section-title">{title}</h2>
      <div className="section-body">{children}</div>
    </div>
  </section>
)

export default Section
