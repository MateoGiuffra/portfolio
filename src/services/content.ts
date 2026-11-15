import type { ContentData } from '@/domain/types'
import { assemble } from '@/domain/schema'
import { content as staticContent, LINKS, CV_FILES } from '@/i18n/content'
import { readJson, writeJson } from './storage'

const CACHE_KEY = 'portfolio-content-v1'

// Respaldo: el contenido que viene en el código.
export const FALLBACK: ContentData = { es: staticContent.es, en: staticContent.en, links: LINKS, cv: CV_FILES }

export function readCache(): ContentData | null {
  return readJson<ContentData>(CACHE_KEY)
}

// Trae el contenido de Firestore (carga Firebase recién acá, así no pesa en el primer render).
export async function loadRemoteContent(): Promise<ContentData> {
  const { fetchAll } = await import('./contentRepo')
  const value = assemble(await fetchAll(), FALLBACK)
  writeJson(CACHE_KEY, value)
  return value
}
