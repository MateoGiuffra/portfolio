import { cardOf } from '@/config/cardPalette'
import type { Project } from '@/domain/types'

interface ProjectCardArtProps {
  item: Project
  idx: number
}

// Glifos ASCII determinísticos a partir del título (mismo patrón siempre para el mismo proyecto).
const GLYPHS = ' .:=+xX0S8#@'
const asciiPattern = (seed: string, rows = 12, cols = 46): string => {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  const rnd = (): number => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) / 4294967296)
  return Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x) => {
      const wave = (Math.sin(x / 5 + y / 2.2) + 1) / 2
      return GLYPHS[Math.min(GLYPHS.length - 1, Math.floor((wave * 0.7 + rnd() * 0.3) * GLYPHS.length))]
    }).join(''),
  ).join('\n')
}

const initials = (title: string): string =>
  title.split(/[\s\-_.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

// Contenido de la tarjeta según la variante elegida en el backoffice.
export default function ProjectCardArt({ item, idx }: ProjectCardArtProps) {
  // `string` (no CardVariant): 'photo' es una variante legada que el contenido aún puede traer.
  const { variant }: { variant: string } = cardOf(item, idx)
  const num = <span className="fcard-num" aria-hidden="true">{String(idx + 1).padStart(2, '0')}</span>

  if (variant === 'photo' && item.photos?.length) {
    return (
      <>
        <img className="fcard-photo" src={item.photos[0]} alt={item.title} loading="lazy" />
        {num}
      </>
    )
  }
  if (variant === 'pattern') {
    return (
      <>
        <pre className="fcard-ascii" aria-hidden="true">{asciiPattern(item.title)}</pre>
        <span className="fcard-mark fcard-mark--small" aria-hidden="true">{item.title}</span>
        {num}
      </>
    )
  }
  if (variant === 'stack') {
    return (
      <>
        <ul className="fcard-stack" aria-hidden="true">
          {(item.stack || []).slice(0, 5).map((s) => <li key={s}>{s}</li>)}
        </ul>
        {num}
      </>
    )
  }
  if (variant === 'monogram') {
    return (
      <>
        <span className="fcard-mark fcard-mark--mono" aria-hidden="true">{initials(item.title)}</span>
        {num}
      </>
    )
  }
  // 'mark' (la tarjeta original), 'gradient' y 'solid' comparten el título grande.
  return (
    <>
      <span className="fcard-mark" aria-hidden="true">{item.title}</span>
      {num}
    </>
  )
}
