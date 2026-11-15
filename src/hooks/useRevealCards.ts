import { useEffect, type RefObject } from 'react'
import { SEL } from '@/lib/selectors'

// Reveal al entrar en viewport. Las tarjetas son visibles por defecto: solo se ocultan
// (clase "will-reveal") las que están fuera de pantalla, así nunca quedan invisibles.
export function useRevealCards(listRef: RefObject<HTMLElement | null>, dep: unknown): void {
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const cards = [...list.querySelectorAll<HTMLElement>(SEL.featuredCard)]
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) return
    const vh = window.innerHeight
    const pending = cards.filter((c) => c.getBoundingClientRect().top > vh * 0.9)
    pending.forEach((c) => c.classList.add('will-reveal'))
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      }),
      { threshold: 0.05 }
    )
    pending.forEach((c) => io.observe(c))
    return () => {
      io.disconnect()
      pending.forEach((c) => c.classList.remove('will-reveal', 'is-in'))
    }
  }, [listRef, dep])
}
