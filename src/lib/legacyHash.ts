import { BASE } from '@/lib/basePath'

// Los links viejos (#/bo) y el 404.html de GitHub Pages llegan como hash: se pasan a path sin recargar.
// Correr antes de crear el router.
export function migrateHashRoute(): void {
  const m = window.location.hash.match(/^#(\/(?:bo|backoffice)(?:\/.*)?)$/)
  if (!m) return
  const path = m[1].replace(/^\/backoffice/, '/bo').replace(/(.)\/$/, '$1')
  window.history.replaceState(null, '', `${BASE}${path}${window.location.search}`)
}
