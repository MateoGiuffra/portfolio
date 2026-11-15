import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc,
} from 'firebase/firestore'
import type { DocumentData, QuerySnapshot } from 'firebase/firestore'
import type {
  ContentDocs, ListDataMap, ListDoc, ListName, RawContent, SectionDoc, SectionId,
} from '@/domain/types'
import { SECTION_SPECS } from '@/domain/schema'
import { db } from './firebase'

type ContentId = SectionId | 'links'

const isContentId = (id: string): id is ContentId => id === 'links' || id in SECTION_SPECS

const toList = <N extends ListName>(snap: QuerySnapshot): ListDoc<N>[] =>
  // Firestore devuelve DocumentData; la forma la garantiza el esquema (domain/schema.ts) al escribir.
  snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ListDoc<N>)

const toContent = (snap: QuerySnapshot): ContentDocs => {
  const docs: Record<string, DocumentData> = {}
  snap.forEach((d) => { if (isContentId(d.id)) docs[d.id] = d.data() })
  return docs as ContentDocs // claves validadas con isContentId
}

const stamp = <T extends object>(data: T): T & { _updatedAt: string } => ({
  ...data, _updatedAt: new Date().toISOString(),
})

// Lee todo el contenido en paralelo (8 + ~25 documentos por visita).
export async function fetchAll(): Promise<RawContent> {
  const [content, workItems, jobs, education, skillGroups, projects] = await Promise.all([
    getDocs(collection(db, 'content')),
    getDocs(collection(db, 'workItems')),
    getDocs(collection(db, 'jobs')),
    getDocs(collection(db, 'education')),
    getDocs(collection(db, 'skillGroups')),
    getDocs(collection(db, 'projects')),
  ])
  return {
    content: toContent(content),
    workItems: toList<'workItems'>(workItems),
    jobs: toList<'jobs'>(jobs),
    education: toList<'education'>(education),
    skillGroups: toList<'skillGroups'>(skillGroups),
    projects: toList<'projects'>(projects),
  }
}

export async function listItems<N extends ListName>(name: N): Promise<ListDoc<N>[]> {
  const snap = await getDocs(collection(db, name))
  return toList<N>(snap).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

/** Crea (id = null) o reemplaza un elemento. Devuelve su id. */
export async function saveItem<N extends ListName>(
  name: N, id: string | null, data: ListDataMap[N],
): Promise<string> {
  if (id) {
    await setDoc(doc(db, name, id), stamp(data))
    return id
  }
  return (await addDoc(collection(db, name), stamp(data))).id
}

export const removeItem = (name: ListName, id: string): Promise<void> => deleteDoc(doc(db, name, id))

/** `content/<id>` sin las claves internas (`_updatedAt`...). `{}` si no existe. */
export async function getSection(id: ContentId): Promise<SectionDoc> {
  const snap = await getDoc(doc(db, 'content', id))
  const raw: DocumentData = snap.exists() ? snap.data() : {}
  return Object.fromEntries(Object.entries(raw).filter(([k]) => !k.startsWith('_')))
}

export async function saveSection(id: ContentId, data: SectionDoc): Promise<void> {
  await setDoc(doc(db, 'content', id), stamp(data))
}
