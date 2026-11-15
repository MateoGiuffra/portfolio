// Tipos del dominio. Sin React ni SDK: los comparten web, backoffice y scripts.

export type Lang = 'es' | 'en'
export type Localized<T> = { es: T; en: T }

/** Valor JSON arbitrario (docs de Firestore). */
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

// ---------- Tarjeta de proyecto ----------
export type CardVariant = 'mark' | 'gradient' | 'pattern' | 'stack' | 'monogram' | 'solid'
export interface Card {
  variant: CardVariant
  bg: string
  fg: string
  accent: string
}

// ---------- Entidades ya resueltas por idioma (lo que consume la web) ----------
export interface WorkItem {
  title: string
  text: string
}

/** Par [número, etiqueta] de las métricas del trabajo (tupla solo en el contenido resuelto). */
export type StatPair = [n: string, l: string]
/** Par [nombre, texto] de un grupo de habilidades (tupla solo en el contenido resuelto). */
export type SkillGroupPair = [name: string, text: string]

export interface Job {
  company: string
  role: string
  period: string
  start: string
  end: string
  tagline: string
  badge: string
  site: string
  siteUrl: string
  bullets: string[]
  stats: StatPair[]
  startDate: string
  endDate: string
}

export interface Education {
  name: string
  where: string
  period: string
  kind: string
  mark: string
  progress?: number
  progressLabel?: string
  tags: string[]
}

export interface SkillGroup {
  name: string
  text: string
}

export interface Project {
  title: string
  text: string
  stack: string[]
  code: string
  demo?: string
  github?: string
  linkedin?: string
  startDate?: string
  endDate?: string
  photos?: string[]
  card?: Card
}

// ---------- Contenido resuelto por idioma ----------
export interface Nav {
  work: string
  experience: string
  projects: string
  skills: string
  contact: string
  menu: string
  close: string
  talk: string
}

export interface LangToggle {
  label: string
  short: string
}

export interface HeroSection {
  title: string
  text: string
  cv: string
  contact: string
  diagramLabel: string
  core: string
  adapters: string[]
  harness: string
}

export interface WorkSection {
  title: string
  items: WorkItem[]
}

export interface ExperienceSection {
  title: string
  company: string
  role: string
  period: string
  startLabel: string
  start: string
  endLabel: string
  end: string
  ongoing: string
  unit: [singular: string, plural: string]
  tagline: string
  badge: string
  site: string
  siteUrl: string
  stats: StatPair[]
  bullets: string[]
  educationTitle: string
  education: Education[]
  // los agrega `assemble` (no están en el respaldo estático)
  jobs?: Job[]
  startDate?: string
  endDate?: string
}

export interface ProjectsSection {
  title: string
  lead: string
  code: string
  view: string
  demo: string
  items: Project[]
}

export interface SkillsSection {
  title: string
  groups: SkillGroupPair[]
}

export interface ContactSection {
  title: string
  text: string
  name: string
  email: string
  message: string
  send: string
  sending: string
  sent: string
  error: string
  emailLink: string
}

/** Contenido completo en un idioma (lo que reciben los componentes como `t`). */
export interface LangContent {
  htmlLang: Lang
  skip: string
  nav: Nav
  langToggle: LangToggle
  hero: HeroSection
  work: WorkSection
  experience: ExperienceSection
  projects: ProjectsSection
  skills: SkillsSection
  contact: ContactSection
  footer: string
}

export interface Links {
  github: string
  linkedin: string
  email: string
}
export type CvFiles = Record<Lang, string>

/** Contenido de respaldo / ensamblado: los dos idiomas + links + CV. */
export interface ContentData {
  es: LangContent
  en: LangContent
  links: Links
  cv: CvFiles
}
/** Lo que devuelve `assemble(raw, null)`: sin respaldo, puede estar incompleto. */
export interface PartialContentData {
  es: Partial<LangContent>
  en: Partial<LangContent>
  links: Partial<Links>
  cv: Partial<CvFiles>
}

// ---------- Documentos de Firestore ----------
export type SectionId =
  | 'general'
  | 'hero'
  | 'workSection'
  | 'experienceSection'
  | 'projectsSection'
  | 'skillsSection'
  | 'contact'
export type ListName = 'workItems' | 'jobs' | 'education' | 'skillGroups' | 'projects'
export type SectionTarget = '' | 'hero' | 'work' | 'experience' | 'projects' | 'skills' | 'contact'

/** `content/<seccion>`: cada clave es `{es, en}`. */
export type SectionDoc = { [key: string]: Json }
/** `content/links`: links + CV (no localizados). */
export interface LinksDoc extends Links {
  cv: CvFiles
  _updatedAt?: string
}
/** Documentos de la colección `content`. */
export type ContentDocs = { [K in SectionId]?: SectionDoc } & { links?: LinksDoc }

/** Fila `{n, l}` de las métricas tal como se guarda en Firestore (sin arrays anidados). */
export interface StatRow {
  n: string
  l: string
}
/** Fila `{name, text}`; en Firestore los grupos son objetos, no pares. */
export type SkillGroupRow = SkillGroup

/** Campos comunes de los documentos de las listas. */
export interface ListMeta {
  order?: number
  visible?: boolean
  _updatedAt?: string
}

// Datos almacenados (sin `id`): campos localizados `{es,en}`, el resto compartido.
export interface WorkItemData extends ListMeta {
  title: Localized<string>
  text: Localized<string>
}
export interface JobData extends ListMeta {
  company: Localized<string>
  role: Localized<string>
  period: Localized<string>
  start: Localized<string>
  end: Localized<string>
  tagline: Localized<string>
  badge: Localized<string>
  site: Localized<string>
  bullets: Localized<string[]>
  stats: Localized<StatRow[]>
  siteUrl: string
  startDate: string
  endDate: string
}
export interface EducationData extends ListMeta {
  name: Localized<string>
  where: Localized<string>
  period: Localized<string>
  kind: Localized<string>
  progressLabel?: Localized<string>
  tags: Localized<string[]>
  mark: string
  progress?: number
}
export interface SkillGroupData extends ListMeta {
  name: Localized<string>
  text: Localized<string>
}
export interface ProjectData extends ListMeta {
  title: Localized<string>
  text: Localized<string>
  stack: string[]
  code: string
  demo?: string
  github: string
  linkedin: string
  startDate: string
  endDate: string
  photos: string[]
  card: Card
}

export interface ListDataMap {
  workItems: WorkItemData
  jobs: JobData
  education: EducationData
  skillGroups: SkillGroupData
  projects: ProjectData
}
/** Documento leído de Firestore: `{ id, ...data }`. */
export type ListDoc<N extends ListName> = ListDataMap[N] & { id: string }
export type WorkItemDoc = ListDoc<'workItems'>
export type JobDoc = ListDoc<'jobs'>
export type EducationDoc = ListDoc<'education'>
export type SkillGroupDoc = ListDoc<'skillGroups'>
export type ProjectDoc = ListDoc<'projects'>

/** Lo que devuelve `fetchRaw`: la base de datos tal cual. */
export type RawContent = { content?: ContentDocs } & { [N in ListName]?: ListDoc<N>[] }

/** Resultado de `buildSeed`: lo que se escribe en Firestore. */
export interface SeedItem<D> {
  id: string
  data: D
}
export type Seed = { content: Required<ContentDocs> } & { [N in ListName]: SeedItem<ListDataMap[N]>[] }

// ---------- Especificaciones del esquema ----------
export interface SectionSpec {
  label: string
  target: SectionTarget
  keys?: readonly string[]
  exclude?: readonly string[]
}
export interface ListSpec {
  label: string
  localized: readonly string[]
  shared: readonly string[]
}
