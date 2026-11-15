import { describe, expect, it } from 'vitest'
import { content, LINKS, CV_FILES } from '../i18n/content'
import { assemble, buildSeed, isSubset, pickLang } from './schema'
import type { RawContent, SeedItem } from './types'

const withIds = <D extends object>(docs: SeedItem<D>[]): (D & { id: string })[] =>
  docs.map((d) => ({ id: d.id, ...d.data }))

describe('pickLang', () => {
  it('elige el idioma y cae a ES si falta o está vacío', () => {
    expect(pickLang({ es: 'hola', en: 'hello' }, 'en')).toBe('hello')
    expect(pickLang({ es: 'hola', en: '' }, 'en')).toBe('hola')
  })
  it('deja pasar lo que no está localizado', () => {
    expect(pickLang('x', 'en')).toBe('x')
    expect(pickLang(['a', 'b'], 'es')).toEqual(['a', 'b'])
  })
})

describe('buildSeed -> assemble', () => {
  it('ida y vuelta idéntica al contenido', () => {
    const seed = buildSeed(content, LINKS, CV_FILES)
    const raw: RawContent = {
      content: seed.content,
      workItems: withIds(seed.workItems),
      jobs: withIds(seed.jobs),
      education: withIds(seed.education),
      skillGroups: withIds(seed.skillGroups),
      projects: withIds(seed.projects),
    }
    const built = assemble(JSON.parse(JSON.stringify(raw)), null)
    expect(isSubset(content.es, built.es)).toEqual([])
    expect(isSubset(content.en, built.en)).toEqual([])
    expect(isSubset(LINKS, built.links)).toEqual([])
    expect(isSubset(CV_FILES, built.cv)).toEqual([])
  })
})

describe('isSubset', () => {
  it('detecta diferencias y tolera campos extra', () => {
    expect(isSubset({ a: 1, b: [1, 2] }, { a: 1, b: [1, 2], c: 3 })).toEqual([])
    expect(isSubset({ a: 1 }, { a: 2 })).toHaveLength(1)
    expect(isSubset([1, 2], [1])).toEqual([': largo distinto'])
  })
})
