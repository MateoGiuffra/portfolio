// Utilidades puras para armar formularios desde la forma del dato (sin React).
import { defaultCard } from '../config/cardPalette'

// Etiquetas legibles para las claves conocidas; si no hay, se muestra la clave tal cual.
export const LABELS = {
  title: 'Título', text: 'Texto', name: 'Nombre', company: 'Empresa', role: 'Rol', period: 'Período',
  start: 'Etiqueta de inicio', end: 'Etiqueta de fin', startDate: 'Inicio', endDate: 'Fin (vacío = actual)',
  tagline: 'Bajada', badge: 'Insignia', site: 'Sitio (texto)', siteUrl: 'URL del sitio',
  bullets: 'Puntos (uno por línea)', stats: 'Métricas', where: 'Dónde', kind: 'Tipo',
  progressLabel: 'Etiqueta de progreso', tags: 'Etiquetas', mark: 'Marca', progress: 'Progreso (%)',
  stack: 'Stack / tecnologías', code: 'URL del código', demo: 'URL de la demo', github: 'GitHub',
  linkedin: 'LinkedIn', email: 'Email', cv: 'Archivo del CV', photos: 'Fotos (URLs)', card: 'Tarjeta',
  n: 'Número', l: 'Etiqueta', htmlLang: 'Idioma del HTML', skip: 'Saltar al contenido', nav: 'Menú',
  langToggle: 'Botón de idioma', footer: 'Pie de página', hero: 'Portada', lead: 'Bajada', view: 'Texto "ver"',
  contact: 'Contacto', message: 'Mensaje', send: 'Enviar', sending: 'Enviando', sent: 'Enviado',
  error: 'Error', emailLink: 'Link de email', label: 'Etiqueta', short: 'Abreviatura', menu: 'Menú',
  close: 'Cerrar', talk: 'Hablemos', work: 'Cómo trabajo', experience: 'Experiencia', projects: 'Proyectos',
  skills: 'Habilidades', startLabel: 'Etiqueta de inicio', endLabel: 'Etiqueta de fin', ongoing: 'En curso',
  unit: 'Unidades', educationTitle: 'Título de estudios', diagramLabel: 'Etiqueta del diagrama',
  core: 'Núcleo', adapters: 'Adaptadores', harness: 'Arnés', visible: 'Visible en la web',
}
export const labelOf = (k) => LABELS[k] || k

// Campo principal de cada lista (obligatorio en ES).
export const PRIMARY = { workItems: 'title', jobs: 'company', education: 'name', skillGroups: 'name', projects: 'title' }

// Cómo se editan los campos compartidos (no localizados). Lo que no esté acá se infiere de la forma del dato.
export const FIELD_META = {
  stack: { kind: 'tags' },
  photos: { kind: 'photos' },
  startDate: { kind: 'month' },
  endDate: { kind: 'month' },
  progress: { kind: 'number' },
  code: { kind: 'url' }, demo: { kind: 'url' }, github: { kind: 'url' }, linkedin: { kind: 'url' }, siteUrl: { kind: 'url' },
}

// Listas de objetos con forma conocida aunque estén vacías.
export const PROTOS = { stats: { n: '', l: '' } }
// Listas de textos que se editan una por línea (frases largas con comas).
export const LINES = new Set(['bullets'])

export const isLocalized = (v) => !!v && typeof v === 'object' && !Array.isArray(v) && ('es' in v || 'en' in v)

export const isEmpty = (v) => {
  if (v === undefined || v === null || v === '') return true
  if (Array.isArray(v)) return v.every(isEmpty)
  if (typeof v === 'object') return Object.values(v).every(isEmpty)
  return false
}

export const blankLike = (v) =>
  Array.isArray(v) ? [] : v && typeof v === 'object'
    ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blankLike(x)]))
    : typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : ''

// ¿Falta traducir `lang`? Vacío en ese idioma y con contenido en el otro.
export const isMissing = (v, lang) => {
  if (!isLocalized(v)) return false
  const other = lang === 'es' ? 'en' : 'es'
  return isEmpty(v[lang]) && !isEmpty(v[other])
}
export const missingCount = (values, lang) => Object.values(values).filter((v) => isMissing(v, lang)).length

// Copia ES -> EN en los campos localizados cuyo EN está vacío.
export const copyAllFromEs = (values) =>
  Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, isMissing(v, 'en') ? { ...v, en: structuredClone(v.es) } : v]),
  )

export const isUrl = (s) => {
  try {
    return ['http:', 'https:', 'mailto:'].includes(new URL(String(s).trim()).protocol)
  } catch {
    return false
  }
}
export const urlRule = (v) => (!v || isUrl(v) ? null : 'URL inválida (ej: https://…)')
export const photosRule = (v) => (Array.isArray(v) && v.some((u) => !isUrl(u)) ? 'Hay URLs inválidas' : null)
export const requiredEs = (v) => (String(isLocalized(v) ? v.es ?? '' : v ?? '').trim() ? null : 'Obligatorio en ES')

// Elemento nuevo de cada lista (los campos {es,en} arrancan vacíos).
const L = (v = '') => ({ es: v, en: typeof v === 'object' ? structuredClone(v) : v })
export const NEW_ITEM = {
  workItems: () => ({ title: L(), text: L() }),
  jobs: () => ({
    company: L(), role: L(), period: L(), start: L(), end: L(), tagline: L(), badge: L(), site: L(),
    bullets: L([]), stats: L([]), siteUrl: '', startDate: '', endDate: '',
  }),
  education: () => ({ name: L(), where: L(), period: L(), kind: L(), progressLabel: L(), tags: L([]), mark: '', progress: 0 }),
  skillGroups: () => ({ name: L(), text: L() }),
  projects: (n) => ({
    title: L(), text: L(), stack: [], code: '', demo: '', github: '', linkedin: '',
    startDate: '', endDate: '', photos: [], card: defaultCard(n),
  }),
}

const es = (v) => (isLocalized(v) ? v.es : v)
export const titleOf = (name, it) => {
  const v = es(it[PRIMARY[name]])
  return (typeof v === 'string' && v) || it.id
}
// Resumen de una fila: fechas, stack u otro texto corto.
export const summaryOf = (it) => {
  const dates = [it.startDate, it.startDate && (it.endDate || 'actual')].filter(Boolean).join(' → ')
  const stack = Array.isArray(it.stack) && it.stack.length ? it.stack.join(', ') : ''
  const alt = ['role', 'where', 'period', 'text'].map((k) => es(it[k])).find((v) => typeof v === 'string' && v) || ''
  return [dates, stack || alt].filter(Boolean).join(' · ')
}

export const stripMeta = (item) => {
  const rest = { ...item }
  delete rest.id
  delete rest._updatedAt
  return rest
}
