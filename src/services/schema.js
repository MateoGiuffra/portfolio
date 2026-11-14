// Esquema de contenido persistido en Firestore + conversión desde/hacia content.js.
// Módulo puro (sin React ni Firebase): lo comparten el script de migración, la web y el backoffice.
import { defaultCard } from '../config/cardPalette.js'

export const LANGS = ['es', 'en']

// Secciones: un documento `content/<id>` con cada clave como {es, en}.
export const SECTION_SPECS = {
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
export const LIST_SPECS = {
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

export const COLLECTIONS = ['content', ...Object.keys(LIST_SPECS)]

// ---------- utilidades ----------
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)))
const slug = (s) =>
  String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const pad = (n) => String(n).padStart(2, '0')

// Firestore no admite arrays anidados: [[a,b]] se guarda como [{a,b}].
const pairsEncode = (rows, keys) => rows.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i]])))
const pairsDecode = (rows, keys) => rows.map((r) => keys.map((k) => r[k]))

export const pickLang = (v, lang) => {
  if (v && typeof v === 'object' && !Array.isArray(v) && ('es' in v || 'en' in v)) {
    const x = v[lang]
    return x === undefined || x === null || x === '' ? v.es : x
  }
  return v
}

const sectionKeys = (spec, src) =>
  spec.keys || Object.keys(src).filter((k) => !(spec.exclude || []).includes(k))
const target = (c, spec) => (spec.target ? c[spec.target] : c)

// ---------- content.js  ->  documentos ----------
const JOB_DATES = { startDate: '2026-04', endDate: '' }

const listSources = (c) => ({
  workItems: c.work.items,
  jobs: [
    {
      company: c.experience.company, role: c.experience.role, period: c.experience.period,
      start: c.experience.start, end: c.experience.end, tagline: c.experience.tagline,
      badge: c.experience.badge, site: c.experience.site, siteUrl: c.experience.siteUrl,
      bullets: c.experience.bullets, stats: pairsEncode(c.experience.stats, ['n', 'l']),
      ...JOB_DATES,
    },
  ],
  education: c.experience.education,
  skillGroups: c.skills.groups.map(([name, text]) => ({ name, text })),
  projects: c.projects.items.map((it, i) => ({
    ...it, github: '', linkedin: '', startDate: '', endDate: '', photos: [], card: defaultCard(i),
  })),
})

const itemId = (name, it, i, es) => {
  const label = name === 'workItems' ? '' : es.title || es.company || es.name
  return label ? slug(label) : `item-${pad(i + 1)}`
}

export function buildSeed(content, links, cv) {
  const out = { content: {} }
  for (const [id, spec] of Object.entries(SECTION_SPECS)) {
    const es = target(content.es, spec)
    const en = target(content.en, spec)
    out.content[id] = Object.fromEntries(
      sectionKeys(spec, es).map((k) => [k, { es: clone(es[k]), en: clone(en[k]) }]),
    )
  }
  out.content.links = { ...links, cv: { ...cv } }

  const srcEs = listSources(content.es)
  const srcEn = listSources(content.en)
  for (const [name, spec] of Object.entries(LIST_SPECS)) {
    out[name] = srcEs[name].map((es, i) => {
      const en = srcEn[name][i]
      const data = { order: i, visible: true }
      for (const k of spec.localized) if (es[k] !== undefined) data[k] = { es: clone(es[k]), en: clone(en[k]) }
      for (const k of spec.shared) if (es[k] !== undefined) data[k] = clone(es[k])
      return { id: itemId(name, es, i, es), data }
    })
  }
  return out
}

// ---------- documentos  ->  content ----------
const sorted = (list = []) =>
  [...list].filter((d) => d.visible !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

const localizedItem = (d, spec, lang) => {
  const o = {}
  for (const k of spec.localized) if (d[k] !== undefined) o[k] = pickLang(d[k], lang)
  for (const k of spec.shared) if (d[k] !== undefined) o[k] = d[k]
  return o
}

// raw = { content: {id: doc}, workItems: [...], jobs: [...], education: [...], skillGroups: [...], projects: [...] }
// base = contenido de respaldo ({es, en, links, cv}); lo que falte en la base de datos queda como en el respaldo.
export function assemble(raw, base) {
  const out = base ? clone(base) : { es: {}, en: {}, links: {}, cv: {} }

  for (const lang of LANGS) {
    const c = out[lang]
    for (const [id, spec] of Object.entries(SECTION_SPECS)) {
      const doc = raw.content?.[id]
      if (!doc) continue
      let tgt = c
      if (spec.target) tgt = c[spec.target] = c[spec.target] || {}
      for (const k of Object.keys(doc)) if (!k.startsWith('_')) tgt[k] = pickLang(doc[k], lang)
    }

    const L = LIST_SPECS
    const works = sorted(raw.workItems)
    if (works.length) {
      c.work = c.work || {}
      c.work.items = works.map((d) => localizedItem(d, L.workItems, lang))
    }

    c.experience = c.experience || {}
    const jobs = sorted(raw.jobs).map((d) => {
      const j = localizedItem(d, L.jobs, lang)
      if (j.stats) j.stats = pairsDecode(j.stats, ['n', 'l'])
      return j
    })
    if (jobs.length) {
      const { startDate, endDate, ...first } = jobs[0]
      Object.assign(c.experience, first)
      c.experience.startDate = startDate
      c.experience.endDate = endDate
      c.experience.jobs = jobs
    }
    const edu = sorted(raw.education)
    if (edu.length) c.experience.education = edu.map((d) => localizedItem(d, L.education, lang))

    const groups = sorted(raw.skillGroups)
    if (groups.length) {
      c.skills = c.skills || {}
      c.skills.groups = groups.map((d) => [pickLang(d.name, lang), pickLang(d.text, lang)])
    }

    const projects = sorted(raw.projects)
    if (projects.length) {
      c.projects = c.projects || {}
      c.projects.items = projects.map((d) => {
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
  return out
}

// ¿`actual` contiene todo lo que tiene `esperado`? (permite campos extra en `actual`)
export function isSubset(esperado, actual, path = '', diffs = []) {
  if (Array.isArray(esperado)) {
    if (!Array.isArray(actual) || actual.length !== esperado.length) diffs.push(`${path}: largo distinto`)
    else esperado.forEach((v, i) => isSubset(v, actual[i], `${path}[${i}]`, diffs))
  } else if (esperado && typeof esperado === 'object') {
    if (!actual || typeof actual !== 'object') diffs.push(`${path}: falta objeto`)
    else for (const k of Object.keys(esperado)) isSubset(esperado[k], actual[k], `${path}.${k}`, diffs)
  } else if (esperado !== actual) diffs.push(`${path}: "${esperado}" != "${actual}"`)
  return diffs
}
