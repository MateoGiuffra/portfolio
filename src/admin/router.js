// Router mínimo por path para el backoffice (History API). Rutas: <base>/bo/<pagina>[/<id>].
// No depende de Mantine: lo usa también main.jsx antes de cargar el admin.
import { useSyncExternalStore } from 'react'

// En GitHub Pages la base es "/portfolio"; en dev y con build relativo es "".
const BASE = import.meta.env.BASE_URL.startsWith('/') ? import.meta.env.BASE_URL.replace(/\/$/, '') : ''
const ADMIN_RE = /^\/(?:bo|backoffice)(\/.*)?$/

export const siteHref = () => `${BASE}/`
export const hrefFor = (to) => `${BASE}/bo${to}`

const stripBase = (pathname) => (BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname)

export const isAdminPath = (pathname = window.location.pathname) => ADMIN_RE.test(stripBase(pathname).replace(/(.)\/$/, '$1'))

// Segmentos después de /bo: "/bo/proyectos/abc" -> ["proyectos", "abc"].
export const segmentsOf = (pathname) => {
  const m = stripBase(pathname).replace(/(.)\/$/, '$1').match(ADMIN_RE)
  return (m?.[1] || '').split('/').filter(Boolean).map(decodeURIComponent)
}

// Los links viejos (#/bo) y el 404.html de GitHub Pages llegan como hash: se pasan a path sin recargar.
export function migrateHashRoute() {
  const m = window.location.hash.match(/^#(\/(?:bo|backoffice)(?:\/.*)?)$/)
  if (!m) return
  const path = m[1].replace(/^\/backoffice/, '/bo').replace(/(.)\/$/, '$1')
  window.history.replaceState(null, '', `${BASE}${path}${window.location.search}`)
}

const listeners = new Set()
const emit = () => listeners.forEach((l) => l())
let blocker = null
let current = window.location.pathname + window.location.search

// El que tiene cambios sin guardar registra un bloqueador: devuelve true si se hizo cargo de la navegación.
export const setBlocker = (fn) => { blocker = fn }

window.addEventListener('popstate', () => {
  // Atrás/adelante con cambios sin guardar: se vuelve a la URL actual y se pregunta antes de salir.
  if (blocker?.(() => window.history.back())) {
    window.history.pushState(null, '', current)
    return
  }
  current = window.location.pathname + window.location.search
  emit()
})

// `to` es relativo a /bo: navigate('/proyectos/abc'). Con replace no suma una entrada al historial.
export function navigate(to, { replace = false } = {}) {
  const url = `${BASE}/bo${to === '/' ? '' : to}`
  window.history[replace ? 'replaceState' : 'pushState'](null, '', url)
  current = url
  window.scrollTo(0, 0)
  emit()
}

const subscribe = (cb) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
export const useAdminPath = () => segmentsOf(useSyncExternalStore(subscribe, () => window.location.pathname))
