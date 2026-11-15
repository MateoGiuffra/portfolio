import { useEffect, type RefObject } from 'react'
import { SEL } from '@/lib/selectors'

// Columna vertebral: la línea se llena hasta el centro de la pantalla, los nodos ya pasados
// se encienden y la tarjeta más cercana al centro queda resaltada (las demás se atenúan, no se ocultan).
export function useSpine(listRef: RefObject<HTMLElement | null>, dep: unknown): void {
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const cards = [...list.querySelectorAll<HTMLElement>(SEL.featuredCard)]
    let raf = 0
    const update = (): void => {
      raf = 0
      const mid = window.innerHeight * 0.5
      const lr = list.getBoundingClientRect()
      const inView = lr.top < mid && lr.bottom > mid
      // Lecturas primero, escrituras después: evita layout thrashing.
      const rects = cards.map((c) => c.getBoundingClientRect())
      let bestIdx = -1
      let bestDist = Infinity
      rects.forEach((r, i) => {
        const d = Math.abs(r.top + Math.min(r.height, 360) / 2 - mid)
        if (d < bestDist) { bestDist = d; bestIdx = i }
      })
      list.style.setProperty('--spine', `${Math.max(0, Math.min(lr.height, mid - lr.top))}px`)
      list.classList.toggle('has-active', inView)
      cards.forEach((c, i) => {
        c.classList.toggle('is-passed', rects[i].top + 30 < mid)
        c.classList.toggle('is-active', inView && i === bestIdx)
        c.classList.toggle('is-dim', inView && i !== bestIdx)
      })
    }
    const onScroll = (): void => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cards.forEach((c) => c.classList.remove('is-passed', 'is-active', 'is-dim'))
    }
  }, [listRef, dep])
}
