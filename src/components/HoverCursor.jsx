import { useEffect, useRef } from 'react'

// Círculo que sigue al mouse (con inercia) y crece al entrar a un elemento [data-cursor].
const HoverCursor = ({ label }) => {
  const dot = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const el = dot.current
    const pos = { x: -100, y: -100 }
    const cur = { x: -100, y: -100 }
    let scale = 0
    let goal = 0
    let raf = 0

    const onMove = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
      goal = e.target.closest?.('[data-cursor]') ? 1 : 0
    }
    const onLeave = () => { goal = 0 }

    const tick = () => {
      cur.x += (pos.x - cur.x) * 0.18
      cur.y += (pos.y - cur.y) * 0.18
      scale += (goal - scale) * 0.16
      el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) translate(-50%, -50%) scale(${scale})`
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div className="hover-cursor" ref={dot} aria-hidden="true">
      <span>{label}</span>
    </div>
  )
}

export default HoverCursor
