import { content as staticContent, LINKS, CV_FILES } from '../i18n/content'
import { assemble } from './schema'

const CACHE_KEY = 'portfolio-content-v1'

// Respaldo: el contenido que viene en el código.
export const FALLBACK = { es: staticContent.es, en: staticContent.en, links: LINKS, cv: CV_FILES }

export function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCache(value) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value))
  } catch {
    // sin storage: se ignora
  }
}

// Trae el contenido de Firestore (carga Firebase recién acá, así no pesa en el primer render).
export async function loadRemoteContent() {
  const { fetchRaw } = await import('./firestoreApi')
  const raw = await fetchRaw()
  const value = assemble(raw, FALLBACK)
  writeCache(value)
  return value
}
