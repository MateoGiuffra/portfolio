import { afterEach, describe, expect, it, vi } from 'vitest'
import { readJson, readString, writeJson, writeString } from './storage'

interface FakeStorage {
  getItem: (k: string) => string | null
  setItem: (k: string, v: string) => void
  data: Map<string, string>
}

const fakeStorage = (): FakeStorage => {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, String(v)),
  }
}

const throwingStorage = (): Pick<FakeStorage, 'getItem' | 'setItem'> => ({
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('storage con localStorage funcional', () => {
  it('readString / writeString', () => {
    const ls = fakeStorage()
    vi.stubGlobal('localStorage', ls)
    expect(readString('k')).toBeNull()
    writeString('k', 'v')
    expect(readString('k')).toBe('v')
    expect(ls.data.get('k')).toBe('v')
  })

  it('writeJson / readJson ida y vuelta', () => {
    vi.stubGlobal('localStorage', fakeStorage())
    writeJson('obj', { a: 1, b: ['x'], c: { es: 'hola' } })
    expect(readJson('obj')).toEqual({ a: 1, b: ['x'], c: { es: 'hola' } })
    writeJson('arr', [1, 2])
    expect(readJson<number[]>('arr')).toEqual([1, 2])
  })

  it('readJson devuelve null si falta, está vacío o es JSON inválido', () => {
    const ls = fakeStorage()
    vi.stubGlobal('localStorage', ls)
    expect(readJson('nada')).toBeNull()
    ls.data.set('vacio', '')
    expect(readJson('vacio')).toBeNull()
    ls.data.set('roto', '{no es json')
    expect(readJson('roto')).toBeNull()
    ls.data.set('nulo', 'null')
    expect(readJson('nulo')).toBeNull()
  })

  it('readJson devuelve primitivos válidos (no solo objetos)', () => {
    const ls = fakeStorage()
    vi.stubGlobal('localStorage', ls)
    ls.data.set('n', '0')
    ls.data.set('s', '"hola"')
    ls.data.set('f', 'false')
    expect(readJson('n')).toBe(0)
    expect(readJson('s')).toBe('hola')
    expect(readJson('f')).toBe(false)
  })

  it('writeJson con valor no serializable no lanza ni escribe', () => {
    const ls = fakeStorage()
    const setItem = vi.spyOn(ls, 'setItem')
    vi.stubGlobal('localStorage', ls)
    const circular: Record<string, unknown> = {}
    circular.self = circular
    expect(() => writeJson('c', circular)).not.toThrow()
    expect(() => writeJson('big', { n: 1n })).not.toThrow()
    expect(setItem).not.toHaveBeenCalled()
    expect(readString('c')).toBeNull()
  })

  it('writeJson(undefined) no lanza y no deja un JSON legible', () => {
    vi.stubGlobal('localStorage', fakeStorage())
    expect(() => writeJson('u', undefined)).not.toThrow()
    expect(readJson('u')).toBeNull()
  })
})

describe('storage cuando localStorage lanza', () => {
  it('lectura y escritura fallan en silencio', () => {
    vi.stubGlobal('localStorage', throwingStorage())
    expect(readString('k')).toBeNull()
    expect(() => writeString('k', 'v')).not.toThrow()
    expect(readJson('k')).toBeNull()
    expect(() => writeJson('k', { a: 1 })).not.toThrow()
  })
})

describe('storage sin localStorage', () => {
  it('undefined: se comporta como modo privado', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(readString('k')).toBeNull()
    expect(() => writeString('k', 'v')).not.toThrow()
    expect(readJson('k')).toBeNull()
    expect(() => writeJson('k', 1)).not.toThrow()
  })
})
