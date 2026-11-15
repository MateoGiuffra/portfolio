// Esquema de contenido persistido en Firestore + conversión desde/hacia content.ts.
// Módulo puro (sin React ni Firebase): lo comparten el script de migración, la web y el backoffice.
import { defaultCard } from '../config/cardPalette'
import { pad2 } from '../lib/format'
import type {
  ContentData,
  CvFiles,
  Lang,
  LangContent,
  Links,
  ListName,
  ListSpec,
  Localized,
  PartialContentData,
  RawContent,
  SectionId,
  SectionSpec,
  Seed,
} from './types'

const LANGS: readonly Lang[] = ['es', 'en']

// Secciones: un documento `content/<id>` con cada clave como {es, en}.
export const SECTION_SPECS: Record<SectionId, SectionSpec> = {
  general: { label: 'General (menú, footer)', target: '', keys: ['htmlLang', 'skip', 'nav', 'langToggle', 'footer'] },
  hero: { label: 'Portada', target: 'hero' },
  workSection: { label: 'Cómo trabajo (títulos)', target: 'work', exclude: ['items'] },
  experienceSection: {
    label: 'Experiencia (títulos)',
    target: 'experience',
    keys: ['title', 'startLabel', 'endLabel', 'ongoing', 'unit', 'educationTitle'],
  },
  projectsSection: { label: 'Proyectos (títulos)', target: 'projects', exclude: ['items'] },
  skillsSection: { label: 'Habilidades (título)', target: 'skills', exclude: ['groups'] },
  contact: { label: 'Contacto', target: 'contact' },
}

// Listas: una colección con un documento por elemento ({es,en} en los campos `localized`).
export const LIST_SPECS: Record<ListName, ListSpec> = {
  workItems: { label: 'Cómo trabajo', localized: ['title', 'text'], shared: [] },
  jobs: {
    label: 'Trabajos',
    localized: ['company', 'role', 'period', 'start', 'end', 'tagline', 'badge', 'site', 'bullets', 'stats'],
    shared: ['siteUrl', 'startDate', 'endDate'],
  },
  education: {
    label: 'Estudios',
    localized: ['name', 'where', 'period', 'kind', 'progressLabel', 'tags'],
    shared: ['mark', 'progress'],
  },
  skillGroups: { label: 'Habilidades', localized: ['name', 'text'], shared: [] },
  projects: {
    label: 'Proyectos',
    localized: ['title', 'text'],
    shared: ['stack', 'code', 'demo', 'github', 'linkedin', 'startDate', 'endDate', 'photos', 'card'],
  },
}

const LIST_NAMES: readonly ListName[] = ['workItems', 'jobs', 'education', 'skillGroups', 'projects']
export const COLLECTIONS: readonly ('content' | ListName)[] = ['content', ...LIST_NAMES]

// ---------- utilidades ----------
type Dict = Record<string, unknown>
const isDict = (v: unknown): v is Dict => typeof v === 'object' && v !== null && !Array.isArray(v)

// Object.entries con las claves tipadas (las claves de un Record<K, V> son siempre K).
const entries = <K extends string, V>(o: Record<K, V>): [K, V][] => Object.entries(o) as [K, V][] // Object.entries pierde K

// Copia superficial a un diccionario (los tipos de entidad son interfaces, sin firma de índice).
const dict = (o: object): Dict => ({ ...o })

const clone = <T>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)))
const slug = (s: unknown): string =>
  String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Firestore no admite arrays anidados: [[a,b]] se guarda como [{a,b}].
const pairsEncode = (rows: readonly (readonly unknown[])[], keys: readonly string[]): Dict[] =>
  rows.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i]])))
const pairsDecode = (rows: readonly Dict[], keys: readonly string[]): unknown[][] =>
  rows.map((r) => keys.map((k) => r[k]))

const isLocalizedValue = (v: unknown): v is Partial<Localized<unknown>> =>
  isDict(v) && ('es' in v || 'en' in v)

export function pickLang<T>(v: Localized<T>, lang: Lang): T
export function pickLang(v: unknown, lang: Lang): unknown
export function pickLang(v: unknown, lang: Lang): unknown {
  if (isLocalizedValue(v)) {
    const x = v[lang]
    return x === undefined || x === null || x === '' ? v.es : x
  }
  return v
}

const sectionKeys = (spec: SectionSpec, src: Dict): readonly string[] =>
  spec.keys || Object.keys(src).filter((k) => !(spec.exclude || []).includes(k))
const target = (c: LangContent, spec: SectionSpec): object => (spec.target ? c[spec.target] : c)

// ---------- content.ts  ->  documentos ----------
const JOB_DATES = { startDate: '2026-04', endDate: '' }

const listSources = (c: LangContent): Record<ListName, Dict[]> => ({
  workItems: c.work.items.map(dict),
  jobs: [
    {
      company: c.experience.company, role: c.experience.role, period: c.experience.period,
      start: c.experience.start, end: c.experience.end, tagline: c.experience.tagline,
      badge: c.experience.badge, site: c.experience.site, siteUrl: c.experience.siteUrl,
      bullets: c.experience.bullets, stats: pairsEncode(c.experience.stats, ['n', 'l']),
      ...JOB_DATES,
    },
  ],
  education: c.experience.education.map(dict),
  skillGroups: c.skills.groups.map(([name, text]) => ({ name, text })),
  projects: c.projects.items.map((it, i) => ({
    ...it, github: '', linkedin: '', startDate: '', endDate: '', photos: [], card: defaultCard(i),
  })),
})

const itemId = (name: ListName, i: number, es: Dict): string => {
  const label = name === 'workItems' ? '' : es.title || es.company || es.name
  return label ? slug(label) : `item-${pad2(i + 1)}`
}

export function buildSeed(content: Localized<LangContent>, links: Links, cv: CvFiles): Seed {
  const docs: Dict = {}
  const sections: Dict = {}
  for (const [id, spec] of entries(SECTION_SPECS)) {
    const es = dict(target(content.es, spec))
    const en = dict(target(content.en, spec))
    sections[id] = Object.fromEntries(
      sectionKeys(spec, es).map((k) => [k, { es: clone(es[k]), en: clone(en[k]) }]),
    )
  }
  sections.links = { ...links, cv: { ...cv } }
  docs.content = sections

  const srcEs = listSources(content.es)
  const srcEn = listSources(content.en)
  for (const [name, spec] of entries(LIST_SPECS)) {
    docs[name] = srcEs[name].map((es, i) => {
      const en = srcEn[name][i]
      const data: Dict = { order: i, visible: true }
      for (const k of spec.localized) if (es[k] !== undefined) data[k] = { es: clone(es[k]), en: clone(en[k]) }
      for (const k of spec.shared) if (es[k] !== undefined) data[k] = clone(es[k])
      return { id: itemId(name, i, es), data }
    })
  }
  // El armado es dinámico (guiado por SECTION_SPECS/LIST_SPECS); la forma resultante es la de `Seed`.
  // Doble cast inevitable: `docs` se arma dinámicamente (por SECTION_SPECS/LIST_SPECS) como diccionario.
  return docs as unknown as Seed
}

// ---------- documentos  ->  content ----------
const sorted = <T extends { order?: number; visible?: boolean }>(list: readonly T[] = []): T[] =>
  [...list].filter((d) => d.visible !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

const localizedItem = (d: object, spec: ListSpec, lang: Lang): Dict => {
  const src = dict(d)
  const o: Dict = {}
  for (const k of spec.localized) if (src[k] !== undefined) o[k] = pickLang(src[k], lang)
  for (const k of spec.shared) if (src[k] !== undefined) o[k] = src[k]
  return o
}

const ensure = (o: Dict, k: string): Dict => {
  const v = o[k]
  if (isDict(v)) return v
  const fresh: Dict = {}
  o[k] = fresh
  return fresh
}

interface Work {
  es: Dict
  en: Dict
  links: Dict
  cv: unknown
}

// raw = { content: {id: doc}, workItems: [...], jobs: [...], education: [...], skillGroups: [...], projects: [...] }
// base = contenido de respaldo ({es, en, links, cv}); lo que falte en la base de datos queda como en el respaldo.
export function assemble(raw: RawContent, base: ContentData): ContentData
export function assemble(raw: RawContent, base?: null): PartialContentData
export function assemble(raw: RawContent, base?: ContentData | null): ContentData | PartialContentData {
  // `clone` conserva la forma; se trabaja como diccionario porque el armado es dinámico.
  // Seguro: `Work` es un diccionario laxo de la misma forma que `base`; se afina al devolver (ver el return).
  const out = (base ? clone(base) : { es: {}, en: {}, links: {}, cv: {} }) as unknown as Work

  for (const lang of LANGS) {
    const c = out[lang]
    for (const [id, spec] of entries(SECTION_SPECS)) {
      const doc = raw.content?.[id]
      if (!doc) continue
      const tgt = spec.target ? ensure(c, spec.target) : c
      for (const k of Object.keys(doc)) if (!k.startsWith('_')) tgt[k] = pickLang(doc[k], lang)
    }

    const L = LIST_SPECS
    const works = sorted(raw.workItems)
    if (works.length) {
      ensure(c, 'work').items = works.map((d) => localizedItem(d, L.workItems, lang))
    }

    const experience = ensure(c, 'experience')
    const jobs = sorted(raw.jobs).map((d) => {
      const j = localizedItem(d, L.jobs, lang)
      if (Array.isArray(j.stats)) j.stats = pairsDecode(j.stats, ['n', 'l'])
      return j
    })
    if (jobs.length) {
      const { startDate, endDate, ...first } = jobs[0]
      Object.assign(experience, first)
      experience.startDate = startDate
      experience.endDate = endDate
      experience.jobs = jobs
    }
    const edu = sorted(raw.education)
    if (edu.length) experience.education = edu.map((d) => localizedItem(d, L.education, lang))

    const groups = sorted(raw.skillGroups)
    if (groups.length) {
      ensure(c, 'skills').groups = groups.map((d) => [pickLang(d.name, lang), pickLang(d.text, lang)])
    }

    const projects = sorted(raw.projects)
    if (projects.length) {
      ensure(c, 'projects').items = projects.map((d) => {
        const p = localizedItem(d, L.projects, lang)
        if (!p.demo) delete p.demo
        return p
      })
    }
  }

  const links = raw.content?.links
  if (links) {
    const { cv, ...rest } = links
    out.links = rest
    out.cv = cv
  }
  // Forma final: `ContentData` con respaldo, `PartialContentData` sin él (ver sobrecargas).
  // Seguro: las sobrecargas de `assemble` fijan cuál de los dos tipos corresponde según `base`.
  return out as unknown as ContentData | PartialContentData
}

// ¿`actual` contiene todo lo que tiene `esperado`? (permite campos extra en `actual`)
export function isSubset(esperado: unknown, actual: unknown, path = '', diffs: string[] = []): string[] {
  if (Array.isArray(esperado)) {
    if (!Array.isArray(actual) || actual.length !== esperado.length) diffs.push(`${path}: largo distinto`)
    else esperado.forEach((v, i) => isSubset(v, actual[i], `${path}[${i}]`, diffs))
  } else if (esperado && typeof esperado === 'object') {
    if (!actual || typeof actual !== 'object') diffs.push(`${path}: falta objeto`)
    else {
      const act = actual as Dict // objeto no nulo (verificado arriba)
      // Seguro: `esperado` es objeto no nulo (rama del else if); Object.keys no devuelve claves ajenas.
      for (const k of Object.keys(esperado)) isSubset((esperado as Dict)[k], act[k], `${path}.${k}`, diffs)
    }
  } else if (esperado !== actual) diffs.push(`${path}: "${String(esperado)}" != "${String(actual)}"`)
  return diffs
}
