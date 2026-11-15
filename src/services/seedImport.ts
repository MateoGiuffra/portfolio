import type { ListName } from '@/domain/types'
import { buildSeed } from '@/domain/schema'
import { CV_FILES, LINKS, content } from '@/i18n/content'
import { saveItem } from './contentRepo'

/** Escribe en Firestore (en serie) los elementos de la lista que hoy están en el código (`i18n/content`). */
export async function importSeed(name: ListName): Promise<void> {
  const seed = buildSeed(content, LINKS, CV_FILES)
  for (const { id, data } of seed[name]) await saveItem(name, id, data)
}
