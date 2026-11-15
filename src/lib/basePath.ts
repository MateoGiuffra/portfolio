// En GitHub Pages la base es "/portfolio"; en dev y con build relativo es "".
export const BASE: string = import.meta.env.BASE_URL.startsWith('/') ? import.meta.env.BASE_URL.replace(/\/$/, '') : ''

// URL absoluta (con base) de la web pública, para links y navegación completa.
export const siteHref = (): string => `${BASE}/`
// URL absoluta (con base) de una ruta del router, para el `href` de los <a>.
export const hrefFor = (path: string): string => `${BASE}${path}`
