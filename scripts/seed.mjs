// Migra content.js a Firestore. Seguro de repetir: NO pisa documentos que ya existen
// (para no borrar ediciones hechas desde el backoffice). Usá --force para pisar todo.
import { content, LINKS, CV_FILES } from '../src/i18n/content.js'
import { buildSeed } from '../src/services/schema.js'
import { db } from './admin.mjs'

const force = process.argv.includes('--force')
const seed = buildSeed(content, LINKS, CV_FILES)
let created = 0, skipped = 0

const write = async (col, id, data) => {
  const ref = db.collection(col).doc(id)
  if (!force && (await ref.get()).exists) return void skipped++
  await ref.set({ ...data, _updatedAt: new Date().toISOString() })
  created++
}

for (const [id, data] of Object.entries(seed.content)) await write('content', id, data)
for (const [col, docs] of Object.entries(seed)) {
  if (col === 'content') continue
  for (const { id, data } of docs) await write(col, id, data)
}
console.log(`Listo: ${created} documentos escritos, ${skipped} ya existían${force ? ' (modo --force)' : ''}.`)
