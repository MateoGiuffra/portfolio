import { useEffect, useRef } from 'react'

// Banda de texto gigante que corre sola y se acelera con la velocidad de scroll.
const Marquee = ({ items, reverse = false, outline = false }) => {
  const track = useRef(null)

  useEffect(() => {
    const el = track.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    let x = 0
    let raf = 0
    let visible = true
    let lastY = window.scrollY
    let boost = 0
    const dir = reverse ? 1 : -1
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(el)

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const y = window.scrollY
      boost += (Math.abs(y - lastY) - boost) * 0.1
      lastY = y
      if (!visible) return
      const half = el.scrollWidth / 2
      x += dir * (0.6 + Math.min(boost, 60) * 0.35)
      if (x <= -half) x += half
      if (x >= 0 && dir > 0) x -= half
      el.style.transform = `translate3d(${x}px, 0, 0)`
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [reverse])

  const row = items.map((it) => (
    <span className="marquee-item" key={it}>
      {it}
      <i aria-hidden="true">✦</i>
    </span>
  ))

  return (
    <div className={`marquee${outline ? ' marquee--outline' : ''}`} aria-hidden="true">
      <div className="marquee-track" ref={track}>
        <div className="marquee-set">{row}</div>
        <div className="marquee-set">{row}</div>
      </div>
    </div>
  )
}

export default Marquee
