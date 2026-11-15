// Utilidades puras para armar formularios desde la forma del dato (sin React).
import { defaultCard } from '@/config/cardPalette'
import type { Json, Lang, ListDataMap, ListDoc, ListName, Localized, StatRow } from '@/domain/types'

export type Dict = Record<string, unknown>
/** Valor `{es, en}` de un campo localizado (cualquiera de los dos puede faltar). */
export interface LocalizedValue {
  es?: unknown
  en?: unknown
}
/** Elemento de lista en edición: un documento existente (con `id`) o uno nuevo (sin `id`). */
export type EditableItem = ListDataMap[ListName] & { id?: string }
export type FieldKind = 'tags' | 'photos' | 'month' | 'number' | 'url'
/** Regla de validación de un campo: devuelve el mensaje de error o `null`. */
export type Rule = (v: unknown) => string | null

// Etiquetas legibles para las claves conocidas; si no hay, se muestra la clave tal cual.
export const LABELS: Record<string, string> = {
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
export const labelOf = (k: string): string => LABELS[k] || k

// Campo principal de cada lista (obligatorio en ES).
export const PRIMARY: Record<ListName, string> = {
  workItems: 'title', jobs: 'company', education: 'name', skillGroups: 'name', projects: 'title',
}

// Cómo se editan los campos compartidos (no localizados). Lo que no esté acá se infiere de la forma del dato.
export const FIELD_META: Partial<Record<string, { kind: FieldKind }>> = {
  stack: { kind: 'tags' },
  photos: { kind: 'photos' },
  startDate: { kind: 'month' },
  endDate: { kind: 'month' },
  progress: { kind: 'number' },
  code: { kind: 'url' }, demo: { kind: 'url' }, github: { kind: 'url' }, linkedin: { kind: 'url' }, siteUrl: { kind: 'url' },
}

// Listas de objetos con forma conocida aunque estén vacías.
export const PROTOS: Partial<Record<string, Dict>> = { stats: { n: '', l: '' } }
// Listas de textos que se editan una por línea (frases largas con comas).
export const LINES: ReadonlySet<string> = new Set(['bullets'])

export const isDict = (v: unknown): v is Dict => typeof v === 'object' && v !== null && !Array.isArray(v)
export const isList = (v: unknown): v is unknown[] => Array.isArray(v)
/** Copia superficial a un diccionario (los tipos de entidad son interfaces, sin firma de índice). */
export const toDict = (o: object): Dict => ({ ...o })

export const isLocalized = (v: unknown): v is LocalizedValue => isDict(v) && ('es' in v || 'en' in v)

export const isEmpty = (v: unknown): boolean => {
  if (v === undefined || v === null || v === '') return true
  if (Array.isArray(v)) return v.every(isEmpty)
  if (typeof v === 'object') return Object.values(v).every(isEmpty)
  return false
}

/** Objeto vacío con las mismas claves que `o` (sirve de prototipo de un elemento nuevo). */
export const blankDict = (o: Dict): Dict =>
  Object.fromEntries(Object.entries(o).map(([k, x]) => [k, blankLike(x)]))

export const blankLike = (v: unknown): Json => {
  if (Array.isArray(v)) return []
  if (isDict(v)) return blankDict(v) as { [key: string]: Json } // blankLike solo devuelve Json
  return typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : ''
}

// ¿Falta traducir `lang`? Vacío en ese idioma y con contenido en el otro.
export const isMissing = (v: unknown, lang: Lang): boolean => {
  if (!isLocalized(v)) return false
  const other = lang === 'es' ? 'en' : 'es'
  return isEmpty(v[lang]) && !isEmpty(v[other])
}
export const missingCount = (values: Dict, lang: Lang): number =>
  Object.values(values).filter((v) => isMissing(v, lang)).length

// Copia ES -> EN en los campos localizados cuyo EN está vacío.
export const copyAllFromEs = (values: Dict): Dict =>
  Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, isLocalized(v) && isMissing(v, 'en') ? { ...v, en: structuredClone(v.es) } : v]),
  )

export const isUrl = (s: unknown): boolean => {
  try {
    return ['http:', 'https:', 'mailto:'].includes(new URL(String(s).trim()).protocol)
  } catch {
    return false
  }
}
export const urlRule: Rule = (v) => (!v || isUrl(v) ? null : 'URL inválida (ej: https://…)')
export const photosRule: Rule = (v) => (Array.isArray(v) && v.some((u) => !isUrl(u)) ? 'Hay URLs inválidas' : null)
export const requiredEs: Rule = (v) => (String(isLocalized(v) ? v.es ?? '' : v ?? '').trim() ? null : 'Obligatorio en ES')

// Elemento nuevo de cada lista (los campos {es,en} arrancan vacíos).
const L = (v = ''): Localized<string> => ({ es: v, en: v })
const LS = (): Localized<string[]> => ({ es: [], en: [] })
const LStats = (): Localized<StatRow[]> => ({ es: [], en: [] })
export const NEW_ITEM: { [N in ListName]: (n: number) => ListDataMap[N] } = {
  workItems: () => ({ title: L(), text: L() }),
  jobs: () => ({
    company: L(), role: L(), period: L(), start: L(), end: L(), tagline: L(), badge: L(), site: L(),
    bullets: LS(), stats: LStats(), siteUrl: '', startDate: '', endDate: '',
  }),
  education: () => ({ name: L(), where: L(), period: L(), kind: L(), progressLabel: L(), tags: LS(), mark: '', progress: 0 }),
  skillGroups: () => ({ name: L(), text: L() }),
  projects: (n) => ({
    title: L(), text: L(), stack: [], code: '', demo: '', github: '', linkedin: '',
    startDate: '', endDate: '', photos: [], card: defaultCard(n),
  }),
}

const es = (v: unknown): unknown => (isLocalized(v) ? v.es : v)
export const titleOf = (name: ListName, it: ListDoc<ListName>): string => {
  const v = es(toDict(it)[PRIMARY[name]])
  return typeof v === 'string' && v ? v : it.id
}
// Resumen de una fila: fechas, stack u otro texto corto.
export const summaryOf = (it: ListDoc<ListName>): string => {
  const d = toDict(it)
  const start = typeof d.startDate === 'string' ? d.startDate : ''
  const end = typeof d.endDate === 'string' ? d.endDate : ''
  const dates = start ? `${start} → ${end || 'actual'}` : ''
  const stack = isList(d.stack) && d.stack.length ? d.stack.join(', ') : ''
  const alt = ['role', 'where', 'period', 'text']
    .map((k) => es(d[k]))
    .find((v): v is string => typeof v === 'string' && v !== '') ?? ''
  return [dates, stack || alt].filter(Boolean).join(' · ')
}
