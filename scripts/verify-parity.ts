// Lee la base y comprueba que el contenido armado es idéntico a content.ts.
import { content, LINKS, CV_FILES } from '../src/i18n/content'
import { assemble, isSubset, COLLECTIONS } from '../src/domain/schema'
import type { ContentDocs, RawContent } from '../src/domain/types'
import { db } from './admin'

const docs: ContentDocs = {}
const lists: Record<string, unknown[]> = {}
for (const col of COLLECTIONS) {
  const snap = await db.collection(col).get()
  if (col === 'content') snap.forEach((d) => Object.assign(docs, { [d.id]: d.data() }))
  else lists[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
const raw = { content: docs, ...lists } as RawContent // los documentos de Firestore siguen el esquema
const built = assemble(raw, null) // sin respaldo: si falta algo en la base, se nota
const diffs = [
  ...isSubset(content.es, built.es, 'es'), ...isSubset(content.en, built.en, 'en'),
  ...isSubset(LINKS, built.links, 'links'), ...isSubset(CV_FILES, built.cv, 'cv'),
]
console.log(diffs.length ? `DIFERENCIAS:\n${diffs.join('\n')}` : 'OK: la base reproduce content.ts sin diferencias')
process.exit(diffs.length ? 1 : 0)
