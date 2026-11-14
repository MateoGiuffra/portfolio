import { useEffect, useRef } from 'react'

// Réplica del scroll de lusion.co: rueda con inercia (lerp) + indicador custom a la derecha.
// Salto inmediato compatible con todos los navegadores: anula el scroll-behavior: smooth
// del CSS solo durante la llamada (el valor 'instant' de scrollTo no existe en todos lados).
const jump = (y) => {
  const root = document.documentElement
  const prev = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  window.scrollTo(0, y)
  root.style.scrollBehavior = prev
}

const SmoothScroll = () => {
  const bar = useRef(null)
  const track = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(pointer: fine)').matches
    let target = window.scrollY
    let current = window.scrollY
    let raf = 0
    let running = false
    const max = () => document.documentElement.scrollHeight - window.innerHeight

    const paint = () => {
      const t = track.current
      const b = bar.current
      if (!t || !b) return
      const m = max()
      const ratio = window.innerHeight / document.documentElement.scrollHeight
      const h = Math.max(t.clientHeight * ratio, 24)
      const y = m > 0 ? (window.scrollY / m) * (t.clientHeight - h) : 0
      b.style.height = `${h}px`
      b.style.transform = `translateY(${y}px)`
      t.style.opacity = m > 0 ? '1' : '0'
    }

    const tick = () => {
      current += (target - current) * 0.1
      if (Math.abs(target - current) < 0.5) {
        current = target
        running = false
      }
      jump(current)
      if (running) raf = requestAnimationFrame(tick)
    }

    const onWheel = (e) => {
      if (e.ctrlKey || e.defaultPrevented) return
      e.preventDefault()
      if (!running) current = window.scrollY
      target = Math.min(Math.max(target + e.deltaY, 0), max())
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }

    // Si se scrollea por otro medio (teclado, anclas, arrastre), resincronizar.
    const onScroll = () => {
      if (!running) {
        target = window.scrollY
        current = window.scrollY
      }
      paint()
    }

    // Click / arrastre sobre la barra. Se escucha en window durante el arrastre para que
    // siga funcionando aunque el puntero se salga de la barra (o de la ventana).
    const t = track.current
    let dragging = false
    let grab = 0 // desplazamiento del agarre dentro de la barra, en px
    const toScroll = (clientY) => {
      const r = t.getBoundingClientRect()
      const h = bar.current.offsetHeight
      const ratio = Math.min(Math.max((clientY - r.top - grab) / (r.height - h), 0), 1)
      running = false
      cancelAnimationFrame(raf)
      target = current = ratio * max()
      jump(target)
    }
    const onMoveDrag = (e) => {
      if (!dragging) return
      e.preventDefault()
      toScroll(e.clientY)
    }
    const stopDrag = () => {
      if (!dragging) return
      dragging = false
      t.classList.remove('is-dragging')
      document.documentElement.classList.remove('is-scrollbar-dragging')
      window.removeEventListener('pointermove', onMoveDrag)
      window.removeEventListener('pointerup', stopDrag)
      window.removeEventListener('pointercancel', stopDrag)
      window.removeEventListener('blur', stopDrag)
    }
    const onDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return
      e.preventDefault()
      const bb = bar.current.getBoundingClientRect()
      const onThumb = e.clientY >= bb.top && e.clientY <= bb.bottom
      grab = onThumb ? e.clientY - bb.top : bb.height / 2
      dragging = true
      t.classList.add('is-dragging')
      document.documentElement.classList.add('is-scrollbar-dragging')
      window.addEventListener('pointermove', onMoveDrag, { passive: false })
      window.addEventListener('pointerup', stopDrag)
      window.addEventListener('pointercancel', stopDrag)
      window.addEventListener('blur', stopDrag)
      toScroll(e.clientY)
    }
    t.addEventListener('pointerdown', onDown)

    if (!reduce && fine) window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', paint)
    const ro = new ResizeObserver(paint)
    ro.observe(document.body)
    paint()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('wheel', onWheel)
      t.removeEventListener('pointerdown', onDown)
      stopDrag()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', paint)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="scroll-indicator" ref={track} aria-hidden="true">
      <div className="scroll-indicator-bar" ref={bar} />
    </div>
  )
}

export default SmoothScroll
