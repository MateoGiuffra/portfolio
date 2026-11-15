import { useEffect, type RefObject } from 'react'
import { clamp } from '@/lib/math'
import { prefersReducedMotion } from '@/lib/motion'

export interface SmoothScrollRefs {
  track: RefObject<HTMLDivElement | null>
  bar: RefObject<HTMLDivElement | null>
}

// Salto inmediato compatible con todos los navegadores: anula el scroll-behavior: smooth
// del CSS solo durante la llamada (el valor 'instant' de scrollTo no existe en todos lados).
const jump = (y: number): void => {
  const root = document.documentElement
  const prev = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  window.scrollTo(0, y)
  root.style.scrollBehavior = prev
}

const maxScroll = (): number => document.documentElement.scrollHeight - window.innerHeight

interface Inertia {
  onWheel: (e: WheelEvent) => void
  sync: () => void
  snapTo: (y: number) => void
  // Va a `y` con la misma inercia; ignora la rueda residual un instante (touchpad).
  glideTo: (y: number) => void
  dispose: () => void
}

// Tras un salto a un ancla se ignora la rueda este tiempo: la inercia residual del touchpad
// cancelaba el scroll nativo hacia el ancla y lo dejaba a mitad de camino.
const ANCHOR_WHEEL_LOCK_MS = 700
// ...y este tiempo extra una vez que el desplazamiento al ancla terminó.
const ANCHOR_WHEEL_TAIL_MS = 400

// Rueda con inercia (lerp hacia el destino).
const createInertia = (): Inertia => {
  let target = window.scrollY
  let current = window.scrollY
  let raf = 0
  let running = false
  let wheelLockUntil = 0
  let gliding = false // yendo a un ancla: la rueda no lo interrumpe

  const start = (): void => {
    if (running) return
    running = true
    raf = requestAnimationFrame(tick)
  }

  const tick = (): void => {
    current += (target - current) * 0.1
    if (Math.abs(target - current) < 0.5) {
      current = target
      running = false
      if (gliding) {
        gliding = false
        wheelLockUntil = Math.max(wheelLockUntil, performance.now() + ANCHOR_WHEEL_TAIL_MS)
      }
    }
    jump(current)
    if (running) raf = requestAnimationFrame(tick)
  }

  return {
    onWheel(e) {
      if (e.ctrlKey || e.defaultPrevented) return
      e.preventDefault()
      if (gliding || performance.now() < wheelLockUntil) return
      if (!running) current = window.scrollY
      target = clamp(target + e.deltaY, 0, maxScroll())
      start()
    },
    glideTo(y) {
      gliding = true
      wheelLockUntil = performance.now() + ANCHOR_WHEEL_LOCK_MS
      if (!running) current = window.scrollY
      target = clamp(y, 0, maxScroll())
      start()
    },
    // Si se scrollea por otro medio (teclado, anclas, arrastre), resincronizar.
    sync() {
      if (!running) {
        target = window.scrollY
        current = window.scrollY
      }
    },
    // Salto directo (arrastre de la barra): corta la inercia en curso.
    snapTo(y) {
      gliding = false
      running = false
      cancelAnimationFrame(raf)
      target = current = y
      jump(target)
    },
    dispose() {
      cancelAnimationFrame(raf)
    },
  }
}

// Indicador custom a la derecha: alto y posición del pulgar según el scroll.
const createIndicator = (track: HTMLElement, bar: HTMLElement) => (): void => {
  const m = maxScroll()
  const ratio = window.innerHeight / document.documentElement.scrollHeight
  const h = Math.max(track.clientHeight * ratio, 24)
  const y = m > 0 ? (window.scrollY / m) * (track.clientHeight - h) : 0
  bar.style.height = `${h}px`
  bar.style.transform = `translateY(${y}px)`
  track.style.opacity = m > 0 ? '1' : '0'
}

// Click / arrastre sobre la barra. Se escucha en window durante el arrastre para que
// siga funcionando aunque el puntero se salga de la barra (o de la ventana).
// Devuelve el cleanup (suelta el arrastre si estaba activo).
const attachDrag = (
  track: HTMLElement,
  bar: HTMLElement,
  snapTo: (y: number) => void
): (() => void) => {
  let dragging = false
  let grab = 0 // desplazamiento del agarre dentro de la barra, en px

  const toScroll = (clientY: number): void => {
    const r = track.getBoundingClientRect()
    const h = bar.offsetHeight
    const ratio = clamp((clientY - r.top - grab) / (r.height - h), 0, 1)
    snapTo(ratio * maxScroll())
  }
  const onMoveDrag = (e: PointerEvent): void => {
    if (!dragging) return
    e.preventDefault()
    toScroll(e.clientY)
  }
  const stopDrag = (): void => {
    if (!dragging) return
    dragging = false
    track.classList.remove('is-dragging')
    document.documentElement.classList.remove('is-scrollbar-dragging')
    window.removeEventListener('pointermove', onMoveDrag)
    window.removeEventListener('pointerup', stopDrag)
    window.removeEventListener('pointercancel', stopDrag)
    window.removeEventListener('blur', stopDrag)
  }
  const onDown = (e: PointerEvent): void => {
    if (e.button !== 0) return
    e.preventDefault()
    const bb = bar.getBoundingClientRect()
    const onThumb = e.clientY >= bb.top && e.clientY <= bb.bottom
    grab = onThumb ? e.clientY - bb.top : bb.height / 2
    dragging = true
    track.classList.add('is-dragging')
    document.documentElement.classList.add('is-scrollbar-dragging')
    window.addEventListener('pointermove', onMoveDrag, { passive: false })
    window.addEventListener('pointerup', stopDrag)
    window.addEventListener('pointercancel', stopDrag)
    window.addEventListener('blur', stopDrag)
    toScroll(e.clientY)
  }

  track.addEventListener('pointerdown', onDown)
  return () => {
    track.removeEventListener('pointerdown', onDown)
    stopDrag()
  }
}

// Links internos (#seccion): van al ancla con la inercia del scroll, respetando scroll-padding-top.
// Se enganchan en window (los links de la web son <a href="#id"> comunes).
const createAnchorClick = (glideTo: (y: number) => void) => (e: MouseEvent): void => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const link = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null
  const hash = link?.getAttribute('href')
  if (!hash || hash.length < 2) return
  const id = decodeURIComponent(hash.slice(1))
  const el = document.getElementById(id)
  if (!el) return
  e.preventDefault()
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  glideTo(el.getBoundingClientRect().top + window.scrollY - pad)
  // Igual que el ancla nativa: cambia el hash y suma una entrada al historial.
  if (window.location.hash !== hash) window.history.pushState(null, '', hash)
}

// Réplica del scroll de lusion.co: rueda con inercia + indicador custom a la derecha.
export function useSmoothScroll({ track, bar }: SmoothScrollRefs): void {
  useEffect(() => {
    const t = track.current
    const b = bar.current
    if (!t || !b) return
    const reduce = prefersReducedMotion()
    const fine = window.matchMedia('(pointer: fine)').matches

    const inertia = createInertia()
    const paint = createIndicator(t, b)
    const detachDrag = attachDrag(t, b, inertia.snapTo)
    const onScroll = (): void => {
      inertia.sync()
      paint()
    }

    const onAnchorClick = createAnchorClick(inertia.glideTo)
    if (!reduce && fine) {
      window.addEventListener('wheel', inertia.onWheel, { passive: false })
      document.addEventListener('click', onAnchorClick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', paint)
    const ro = new ResizeObserver(paint)
    ro.observe(document.body)
    paint()

    return () => {
      inertia.dispose()
      window.removeEventListener('wheel', inertia.onWheel)
      document.removeEventListener('click', onAnchorClick)
      detachDrag()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', paint)
      ro.disconnect()
    }
  }, [track, bar])
}
