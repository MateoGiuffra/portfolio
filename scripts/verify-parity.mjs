// Lee la base y comprueba que el contenido armado es idéntico a content.js.
import { content, LINKS, CV_FILES } from '../src/i18n/content.js'
import { assemble, isSubset, COLLECTIONS } from '../src/services/schema.js'
import { db } from './admin.mjs'

const raw = { content: {} }
for (const col of COLLECTIONS) {
  const snap = await db.collection(col).get()
  if (col === 'content') snap.forEach((d) => (raw.content[d.id] = d.data()))
  else raw[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
const built = assemble(raw, null) // sin respaldo: si falta algo en la base, se nota
const diffs = [
  ...isSubset(content.es, built.es, 'es'), ...isSubset(content.en, built.en, 'en'),
  ...isSubset(LINKS, built.links, 'links'), ...isSubset(CV_FILES, built.cv, 'cv'),
]
console.log(diffs.length ? `DIFERENCIAS:\n${diffs.join('\n')}` : 'OK: la base reproduce content.js sin diferencias')
process.exit(diffs.length ? 1 : 0)
