import { vars } from '@/lib/cssVars'

interface RollTextProps {
  text: string
}

// Cada palabra es un bloque (no se corta); cada letra apila dos copias para el efecto "roll".
// El efecto se dispara con :hover / :focus-within de cualquier ancestro con clase .roll-host
// (ver App.css) o del propio enlace.
const RollText = ({ text }: RollTextProps) => (
  <span className="roll" aria-hidden="true">
    {text.split(' ').map((word, w) => (
      <span className="roll-word" key={w}>
        {[...word].map((ch, i) => (
          <span className="roll-col" key={i} style={vars({ '--i': i + w * 3 })}>
            <span>{ch}</span>
            <span>{ch}</span>
          </span>
        ))}
      </span>
    ))}
  </span>
)

export default RollText
