// Prueba sin base de datos: content.js -> documentos -> content. Tiene que dar diferencia cero.
import { content, LINKS, CV_FILES } from '../src/i18n/content.js'
import { buildSeed, assemble, isSubset } from '../src/services/schema.js'

const seed = buildSeed(content, LINKS, CV_FILES)
const raw = { content: seed.content }
for (const k of Object.keys(seed)) if (k !== 'content') raw[k] = seed[k].map((d) => ({ id: d.id, ...d.data }))
const built = assemble(JSON.parse(JSON.stringify(raw)), null)
const diffs = [
  ...isSubset(content.es, built.es, 'es'), ...isSubset(content.en, built.en, 'en'),
  ...isSubset(LINKS, built.links, 'links'), ...isSubset(CV_FILES, built.cv, 'cv'),
]
console.log(diffs.length ? diffs.join('\n') : 'OK: idéntico a content.js (0 diferencias)')
console.log('docs:', Object.entries(seed).map(([k, v]) => `${k}=${Array.isArray(v) ? v.length : Object.keys(v).length}`).join(' '))
process.exit(diffs.length ? 1 : 0)
