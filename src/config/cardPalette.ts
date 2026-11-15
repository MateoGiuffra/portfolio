import type { Card, CardVariant } from '../domain/types'

type PaletteEntry = readonly [bg: string, fg: string, accent: string]

// Paleta por defecto de las tarjetas de proyecto: [fondo, texto, acento del degradé].
// Se rota por posición cuando el proyecto no define su propia tarjeta.
export const PALETTE: readonly PaletteEntry[] = [
  ['#1a1411', '#ffedd7', '#c4793a'],
  ['#181818', '#fffde0', '#6b8fb5'],
  ['#121414', '#ffffff', '#2f6f8f'],
  ['#111a13', '#d9f3de', '#4f8a5b'],
  ['#e3e3f8', '#000000', '#a9a9f0'],
  ['#efd5d3', '#000000', '#e39a94'],
  ['#261c46', '#ffffff', '#7a5cff'],
]

// Variantes de tarjeta para proyectos sin foto (la foto se usa cuando hay `photos`).
export const CARD_VARIANTS: readonly { id: CardVariant; label: string }[] = [
  { id: 'mark', label: 'Marca (título grande)' },
  { id: 'gradient', label: 'Degradé' },
  { id: 'pattern', label: 'Patrón ASCII' },
  { id: 'stack', label: 'Stack' },
  { id: 'monogram', label: 'Monograma' },
  { id: 'solid', label: 'Color liso' },
]

export const defaultCard = (index = 0): Card => {
  const [bg, fg, accent] = PALETTE[index % PALETTE.length]
  return { variant: 'mark', bg, fg, accent }
}

// Tarjeta efectiva de un proyecto: lo guardado en la base, completado con la paleta por defecto.
export const cardOf = (item: { card?: Partial<Card> | null }, idx: number): Card => ({
  ...defaultCard(idx),
  ...(item.card || {}),
})
