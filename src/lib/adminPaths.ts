// Rutas del backoffice (relativas al basename del router: en GitHub Pages "/portfolio").
export const ADMIN_ROOT = '/bo'
export const ADMIN_LOGIN = `${ADMIN_ROOT}/login`
export const DEFAULT_ADMIN_PAGE = 'proyectos'

// adminPath('proyectos', 'abc') -> '/bo/proyectos/abc'
export const adminPath = (...segments: string[]): string => [ADMIN_ROOT, ...segments].join('/')
