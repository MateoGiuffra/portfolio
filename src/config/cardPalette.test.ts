import { describe, expect, it } from 'vitest'
import type { Card } from '../domain/types'
import { CARD_VARIANTS, cardOf, defaultCard, PALETTE } from './cardPalette'

describe('defaultCard', () => {
  it('sin argumento usa la primera entrada, variante mark', () => {
    const [bg, fg, accent] = PALETTE[0]
    expect(defaultCard()).toEqual({ variant: 'mark', bg, fg, accent })
    expect(defaultCard(0)).toEqual(defaultCard())
  })
  it('rota por posición', () => {
    PALETTE.forEach(([bg, fg, accent], i) => {
      expect(defaultCard(i)).toEqual({ variant: 'mark', bg, fg, accent })
    })
    expect(defaultCard(PALETTE.length)).toEqual(defaultCard(0))
    expect(defaultCard(PALETTE.length + 2)).toEqual(defaultCard(2))
  })
  it('devuelve un objeto nuevo cada vez', () => {
    expect(defaultCard(1)).not.toBe(defaultCard(1))
  })
  it('índice negativo o NaN lanza (comportamiento actual: PALETTE[idx] es undefined)', () => {
    expect(() => defaultCard(-1)).toThrow(TypeError)
    expect(() => defaultCard(Number.NaN)).toThrow(TypeError)
  })
})

describe('cardOf', () => {
  it('sin card (undefined, null o {}) = tarjeta por defecto de esa posición', () => {
    expect(cardOf({}, 2)).toEqual(defaultCard(2))
    expect(cardOf({ card: null }, 2)).toEqual(defaultCard(2))
    expect(cardOf({ card: undefined }, 2)).toEqual(defaultCard(2))
    expect(cardOf({ card: {} }, 9)).toEqual(defaultCard(9))
  })
  it('lo guardado pisa al default y el resto se completa', () => {
    expect(cardOf({ card: { variant: 'gradient' } }, 1)).toEqual({ ...defaultCard(1), variant: 'gradient' })
    expect(cardOf({ card: { bg: '#000000', accent: '#ff0000' } }, 0)).toEqual({ ...defaultCard(0), bg: '#000000', accent: '#ff0000' })
  })
  it('card completa se respeta tal cual', () => {
    const card: Card = { variant: 'photo', bg: '#111', fg: '#222', accent: '#333' }
    expect(cardOf({ card }, 4)).toEqual(card)
  })
  it('un valor vacío guardado también pisa al default (spread simple)', () => {
    expect(cardOf({ card: { bg: '' } }, 0).bg).toBe('')
  })
  it('no muta ni el item ni la paleta', () => {
    const card: Partial<Card> = { variant: 'solid' }
    const before = JSON.stringify(PALETTE)
    const out = cardOf({ card }, 0)
    expect(out).not.toBe(card)
    expect(card).toEqual({ variant: 'solid' })
    expect(JSON.stringify(PALETTE)).toBe(before)
  })
})

describe('PALETTE / CARD_VARIANTS', () => {
  it('colores hex de 3 valores por entrada', () => {
    for (const entry of PALETTE) {
      expect(entry).toHaveLength(3)
      for (const c of entry) expect(c).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
  it('variantes únicas; "photo" no se ofrece (se usa con photos)', () => {
    const ids = CARD_VARIANTS.map((v) => v.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toContain('mark')
    expect(ids).not.toContain('photo')
    expect(ids).toContain(defaultCard().variant)
  })
})
