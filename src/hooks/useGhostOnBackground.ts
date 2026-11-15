import { useEffect } from 'react'
import { SEL } from '@/lib/selectors'

// La estela del cursor solo se ve sobre el fondo: se apaga al pasar por tarjetas, links, botones y menús.
export function useGhostOnBackground(enabled = true): void {
  useEffect(() => {
    if (!enabled) return
    const layer = document.querySelector(SEL.ghostLayer)
    if (!layer) return
    const onMove = (e: PointerEvent): void => {
      const el = e.target instanceof Element ? e.target : null
      layer.classList.toggle('is-suppressed', !!(el && el.closest(SEL.ghostBlockers)))
    }
    const onLeave = (): void => layer.classList.remove('is-suppressed')
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      layer.classList.remove('is-suppressed')
    }
  }, [enabled])
}
