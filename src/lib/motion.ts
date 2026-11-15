// ¿El usuario pidió menos movimiento? Lectura puntual (no es estado reactivo).
export const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches
