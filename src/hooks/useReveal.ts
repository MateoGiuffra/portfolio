import { useEffect } from 'react'
import { prefersReducedMotion } from '@/lib/motion'
import { SEL } from '@/lib/selectors'

// Revela [data-reveal] al entrar en pantalla. Progressive enhancement: los elementos son
// visibles por defecto y solo se ocultan (is-pending) si empiezan fuera de la vista.
export function useReveal(dep: unknown): void {
  useEffect(() => {
    if (prefersReducedMotion()) return
    if (!('IntersectionObserver' in window)) return
    const vh = window.innerHeight
    const els = [...document.querySelectorAll<HTMLElement>(SEL.reveal)].filter(
      (el) => el.getBoundingClientRect().top > vh * 0.9
    )
    els.forEach((el) => el.classList.add('is-pending'))
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.remove('is-pending')
          io.unobserve(e.target)
        }
      }),
      { threshold: 0.08 }
    )
    els.forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      els.forEach((el) => el.classList.remove('is-pending'))
    }
  }, [dep])
}
