// Prueba sin base de datos: content.ts -> documentos -> content. Tiene que dar diferencia cero.
import { content, LINKS, CV_FILES } from '../src/i18n/content'
import { buildSeed, assemble, isSubset } from '../src/domain/schema'
import type { RawContent, SeedItem } from '../src/domain/types'

const seed = buildSeed(content, LINKS, CV_FILES)
const withIds = <D extends object>(docs: SeedItem<D>[]): (D & { id: string })[] =>
  docs.map((d) => ({ id: d.id, ...d.data }))
const raw: RawContent = {
  content: seed.content,
  workItems: withIds(seed.workItems),
  jobs: withIds(seed.jobs),
  education: withIds(seed.education),
  skillGroups: withIds(seed.skillGroups),
  projects: withIds(seed.projects),
}
const built = assemble(JSON.parse(JSON.stringify(raw)), null)
const diffs = [
  ...isSubset(content.es, built.es, 'es'), ...isSubset(content.en, built.en, 'en'),
  ...isSubset(LINKS, built.links, 'links'), ...isSubset(CV_FILES, built.cv, 'cv'),
]
console.log(diffs.length ? diffs.join('\n') : 'OK: idéntico a content.ts (0 diferencias)')
console.log('docs:', Object.entries(seed).map(([k, v]) => `${k}=${Array.isArray(v) ? v.length : Object.keys(v).length}`).join(' '))
process.exit(diffs.length ? 1 : 0)
