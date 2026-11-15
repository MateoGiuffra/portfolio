import { describe, expect, it } from 'vitest'
import { defaultCard } from '@/config/cardPalette'
import type { ListName } from '@/domain/types'
import { stripMeta } from '@/lib/stripMeta'
import {
  blankDict, blankLike, copyAllFromEs, isEmpty, isLocalized, isMissing, isUrl, labelOf, missingCount,
  NEW_ITEM, photosRule, PRIMARY, requiredEs, summaryOf, titleOf, urlRule,
} from './shape'

const loc = (es: string, en = es): { es: string; en: string } => ({ es, en })

describe('isLocalized', () => {
  it('es true si es objeto con es o en (aunque sean undefined)', () => {
    expect(isLocalized({ es: 'a', en: 'b' })).toBe(true)
    expect(isLocalized({ es: 'a' })).toBe(true)
    expect(isLocalized({ en: 'b' })).toBe(true)
    expect(isLocalized({ es: undefined })).toBe(true)
  })
  it('es false para el resto', () => {
    expect(isLocalized({})).toBe(false)
    expect(isLocalized({ fr: 'x' })).toBe(false)
    expect(isLocalized(null)).toBe(false)
    expect(isLocalized(undefined)).toBe(false)
    expect(isLocalized('es')).toBe(false)
    expect(isLocalized(['es'])).toBe(false)
  })
})

describe('isEmpty', () => {
  it('vacíos', () => {
    for (const v of [undefined, null, '', [], {}, [[], ''], { a: '', b: [null] }, loc('')]) {
      expect(isEmpty(v)).toBe(true)
    }
  })
  it('no vacíos (0 y false cuentan como contenido)', () => {
    for (const v of [0, false, ' ', 'x', ['x'], [0], { a: 'x' }, { a: { b: 1 } }, loc('', 'x')]) {
      expect(isEmpty(v)).toBe(false)
    }
  })
})

describe('blankLike / blankDict', () => {
  it('vacía según el tipo', () => {
    expect(blankLike([1, 2])).toEqual([])
    expect(blankLike(5)).toBe(0)
    expect(blankLike(true)).toBe(false)
    expect(blankLike('x')).toBe('')
    expect(blankLike(null)).toBe('')
    expect(blankLike(undefined)).toBe('')
  })
  it('recursivo en objetos, conserva claves', () => {
    expect(blankLike({ a: 'x', b: { c: 3, d: [1] }, e: false })).toEqual({ a: '', b: { c: 0, d: [] }, e: false })
    expect(blankDict({ n: '12', l: 'x' })).toEqual({ n: '', l: '' })
  })
})

describe('isMissing / missingCount', () => {
  it('falta traducir si está vacío en lang y hay contenido en el otro', () => {
    expect(isMissing(loc('hola', ''), 'en')).toBe(true)
    expect(isMissing(loc('', 'hi'), 'es')).toBe(true)
    expect(isMissing(loc('hola', 'hi'), 'en')).toBe(false)
    expect(isMissing(loc('', ''), 'en')).toBe(false)
    expect(isMissing({ es: 'hola' }, 'en')).toBe(true)
  })
  it('funciona con listas localizadas', () => {
    expect(isMissing({ es: ['a'], en: [] }, 'en')).toBe(true)
    expect(isMissing({ es: [], en: [] }, 'en')).toBe(false)
  })
  it('valores no localizados nunca faltan', () => {
    expect(isMissing('texto', 'en')).toBe(false)
    expect(isMissing(null, 'es')).toBe(false)
    expect(isMissing(['a'], 'en')).toBe(false)
  })
  it('missingCount cuenta solo los campos faltantes', () => {
    const values = { a: loc('x', ''), b: loc('y'), c: loc('', ''), d: 'plano', e: { es: ['z'], en: [] } }
    expect(missingCount(values, 'en')).toBe(2)
    expect(missingCount(values, 'es')).toBe(0)
    expect(missingCount({}, 'en')).toBe(0)
  })
})

describe('copyAllFromEs', () => {
  it('copia ES a EN solo donde EN está vacío y ES tiene contenido', () => {
    const out = copyAllFromEs({ a: loc('x', ''), b: loc('y', 'z'), c: loc('', ''), d: 'plano' })
    expect(out).toEqual({ a: loc('x'), b: loc('y', 'z'), c: loc('', ''), d: 'plano' })
  })
  it('no muta la entrada y clona en profundidad', () => {
    const src = { tags: { es: ['a', 'b'], en: [] as string[] } }
    const out = copyAllFromEs(src)
    expect(src.tags.en).toEqual([])
    const copied = out.tags as { es: string[]; en: string[] }
    expect(copied.en).toEqual(['a', 'b'])
    expect(copied.en).not.toBe(copied.es)
  })
  it('no toca los campos que no faltan (misma referencia)', () => {
    const ok = loc('x', 'y')
    expect(copyAllFromEs({ ok }).ok).toBe(ok)
  })
})

describe('isUrl', () => {
  it('acepta http, https y mailto (con trim)', () => {
    expect(isUrl('https://a.com')).toBe(true)
    expect(isUrl('http://a.com/x?y=1')).toBe(true)
    expect(isUrl('mailto:a@b.c')).toBe(true)
    expect(isUrl('  https://a.com  ')).toBe(true)
  })
  it('rechaza otros protocolos y basura', () => {
    expect(isUrl('javascript:alert(1)')).toBe(false)
    expect(isUrl('ftp://a.com')).toBe(false)
    expect(isUrl('a.com')).toBe(false)
    expect(isUrl('')).toBe(false)
    expect(isUrl(null)).toBe(false)
    expect(isUrl(undefined)).toBe(false)
    expect(isUrl(42)).toBe(false)
  })
})

describe('reglas de validación', () => {
  it('urlRule: vacío pasa, URL válida pasa, el resto da mensaje', () => {
    expect(urlRule('')).toBeNull()
    expect(urlRule(undefined)).toBeNull()
    expect(urlRule(null)).toBeNull()
    expect(urlRule('https://a.com')).toBeNull()
    expect(urlRule('nope')).toBe('URL inválida (ej: https://…)')
  })
  it('photosRule: solo valida arrays; cualquier URL mala falla', () => {
    expect(photosRule([])).toBeNull()
    expect(photosRule(['https://a.com/1.png', 'https://a.com/2.png'])).toBeNull()
    expect(photosRule(['https://a.com/1.png', 'x'])).toBe('Hay URLs inválidas')
    expect(photosRule([''])).toBe('Hay URLs inválidas')
    expect(photosRule('x')).toBeNull()
    expect(photosRule(undefined)).toBeNull()
  })
  it('requiredEs: mira ES si es localizado, o el valor plano', () => {
    const msg = 'Obligatorio en ES'
    expect(requiredEs(loc('hola', ''))).toBeNull()
    expect(requiredEs(loc('', 'hi'))).toBe(msg)
    expect(requiredEs(loc('   ', 'hi'))).toBe(msg)
    expect(requiredEs({ en: 'hi' })).toBe(msg)
    expect(requiredEs('texto')).toBeNull()
    expect(requiredEs('  ')).toBe(msg)
    expect(requiredEs(undefined)).toBe(msg)
    expect(requiredEs(null)).toBe(msg)
    expect(requiredEs(0)).toBeNull() // String(0) = '0'
  })
})

describe('labelOf / PRIMARY', () => {
  it('etiqueta conocida o la clave tal cual', () => {
    expect(labelOf('title')).toBe('Título')
    expect(labelOf('claveRara')).toBe('claveRara')
  })
  it('PRIMARY cubre todas las listas', () => {
    expect(Object.keys(PRIMARY).sort()).toEqual(['education', 'jobs', 'projects', 'skillGroups', 'workItems'])
  })
})

describe('NEW_ITEM', () => {
  const names = Object.keys(NEW_ITEM) as ListName[]

  it('hay uno por lista', () => {
    expect(names.sort()).toEqual(Object.keys(PRIMARY).sort())
  })
  it('el campo principal arranca vacío y localizado (falla requiredEs)', () => {
    for (const n of names) {
      const item = NEW_ITEM[n](0) as unknown as Record<string, unknown>
      expect(item[PRIMARY[n]]).toEqual({ es: '', en: '' })
      expect(requiredEs(item[PRIMARY[n]])).not.toBeNull()
    }
  })
  it('formas por lista', () => {
    expect(NEW_ITEM.workItems(0)).toEqual({ title: loc(''), text: loc('') })
    expect(NEW_ITEM.skillGroups(0)).toEqual({ name: loc(''), text: loc('') })
    const job = NEW_ITEM.jobs(0)
    expect(job.bullets).toEqual({ es: [], en: [] })
    expect(job.stats).toEqual({ es: [], en: [] })
    expect(job).toMatchObject({ siteUrl: '', startDate: '', endDate: '' })
    expect(NEW_ITEM.education(0)).toMatchObject({ mark: '', progress: 0, tags: { es: [], en: [] } })
  })
  it('projects usa la paleta por posición', () => {
    const p0 = NEW_ITEM.projects(0)
    expect(p0.card).toEqual(defaultCard(0))
    expect(p0).toMatchObject({ stack: [], photos: [], code: '', demo: '', github: '', linkedin: '' })
    expect(NEW_ITEM.projects(3).card).toEqual(defaultCard(3))
    expect(NEW_ITEM.projects(7).card).toEqual(defaultCard(0))
  })
  it('cada llamada devuelve objetos nuevos (sin estado compartido)', () => {
    const a = NEW_ITEM.jobs(0)
    const b = NEW_ITEM.jobs(0)
    expect(a).not.toBe(b)
    expect(a.bullets).not.toBe(b.bullets)
    expect(a.company).not.toBe(b.company)
  })
})

describe('titleOf', () => {
  it('usa el campo principal en ES', () => {
    expect(titleOf('projects', { ...NEW_ITEM.projects(0), id: 'p1', title: loc('Mi proyecto', 'My project') })).toBe('Mi proyecto')
    expect(titleOf('jobs', { ...NEW_ITEM.jobs(0), id: 'j1', company: loc('Acme') })).toBe('Acme')
    expect(titleOf('education', { ...NEW_ITEM.education(0), id: 'e1', name: loc('UBA') })).toBe('UBA')
  })
  it('cae al id si el título está vacío (aunque EN tenga texto)', () => {
    expect(titleOf('projects', { ...NEW_ITEM.projects(0), id: 'p1' })).toBe('p1')
    expect(titleOf('workItems', { ...NEW_ITEM.workItems(0), id: 'w9', title: { es: '', en: 'Only EN' } })).toBe('w9')
  })
})

describe('summaryOf', () => {
  it('fechas + stack', () => {
    const p = { ...NEW_ITEM.projects(0), id: 'p', startDate: '2024-01', endDate: '2024-06', stack: ['React', 'TS'] }
    expect(summaryOf(p)).toBe('2024-01 → 2024-06 · React, TS')
  })
  it('endDate vacío = actual', () => {
    const p = { ...NEW_ITEM.projects(0), id: 'p', startDate: '2024-01' }
    expect(summaryOf(p)).toBe('2024-01 → actual')
  })
  it('sin startDate no hay fechas aunque haya endDate', () => {
    const j = { ...NEW_ITEM.jobs(0), id: 'j', endDate: '2024-06', role: loc('Dev') }
    expect(summaryOf(j)).toBe('Dev')
  })
  it('el stack gana sobre el texto alternativo', () => {
    const p = { ...NEW_ITEM.projects(0), id: 'p', stack: ['Go'], text: loc('Descripción') }
    expect(summaryOf(p)).toBe('Go')
  })
  it('texto alternativo por prioridad role > where > period > text', () => {
    const base = { ...NEW_ITEM.jobs(0), id: 'j' }
    expect(summaryOf({ ...base, role: loc('R'), period: loc('P') })).toBe('R')
    expect(summaryOf({ ...base, period: loc('P') })).toBe('P')
    const e = { ...NEW_ITEM.education(0), id: 'e', where: loc('W'), period: loc('P') }
    expect(summaryOf(e)).toBe('W')
    expect(summaryOf({ ...NEW_ITEM.workItems(0), id: 'w', text: loc('T') })).toBe('T')
  })
  it('usa ES y salta alternativos vacíos', () => {
    const j = { ...NEW_ITEM.jobs(0), id: 'j', role: { es: '', en: 'Dev' }, period: loc('2020') }
    expect(summaryOf(j)).toBe('2020')
  })
  it('vacío si no hay nada', () => {
    expect(summaryOf({ ...NEW_ITEM.workItems(0), id: 'w' })).toBe('')
    expect(summaryOf({ ...NEW_ITEM.projects(0), id: 'p' })).toBe('')
  })
})

describe('stripMeta', () => {
  it('quita id y _updatedAt, conserva el resto sin mutar', () => {
    const src = { ...NEW_ITEM.workItems(0), id: 'w1', _updatedAt: 'ts', title: loc('T') }
    const out = stripMeta<'workItems'>(src)
    expect(out).toEqual({ title: loc('T'), text: loc('') })
    expect('id' in out).toBe(false)
    expect('_updatedAt' in out).toBe(false)
    expect(src.id).toBe('w1')
    expect(src._updatedAt).toBe('ts')
  })
  it('funciona sin metadatos', () => {
    expect(stripMeta<'workItems'>(NEW_ITEM.workItems(0))).toEqual(NEW_ITEM.workItems(0))
  })
})
