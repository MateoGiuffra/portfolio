import { useEffect } from 'react'

// La estela del cursor solo se ve sobre el fondo: se apaga al pasar por tarjetas, links, botones y menús.
const BLOCKERS = [
  '.fcard', '.work-card', '.exp-card', '.exp-list li', '.edu-card', '.skill-row',
  '.site-header', '.menu-panel', '.contact-form', '.scroll-indicator',
  'a', 'button', 'input', 'textarea',
].join(',')

export const useGhostOnBackground = () => {
  useEffect(() => {
    const layer = document.querySelector('.ghost-layer')
    if (!layer) return
    const onMove = (e) => {
      const el = e.target instanceof Element ? e.target : null
      layer.classList.toggle('is-suppressed', !!(el && el.closest(BLOCKERS)))
    }
    const onLeave = () => layer.classList.remove('is-suppressed')
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      layer.classList.remove('is-suppressed')
    }
  }, [])
}
