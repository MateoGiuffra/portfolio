import { useEffect, useRef } from 'react'
import { STYLES, TOOLS, HOTKEYS } from './figmaCursorIcons'

// Cursor estilo Figma (herramientas). Toda la config vive en src/config/cursor.js.
const FigmaCursor = ({ style = 'classic', showTag = false, smoothing = 0.55, hotkeys = false, rules = [], labels = {} }) => {
  const root = useRef(null)
  const icon = useRef(null)
  const tag = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = root.current
    const st = STYLES[style] || STYLES.classic
    const html = document.documentElement
    html.classList.add('has-figma-cursor')

    let tool = ''
    let forced = null
    let down = false
    let overEl = null
    let x = -100
    let y = -100
    let cx = -100
    let cy = -100
    let raf = 0
    let seen = false

    tag.current.style.background = st.tagBg
    tag.current.style.color = st.tagFg

    const paint = (k) => {
      if (k === tool) return
      tool = k
      icon.current.innerHTML = TOOLS[k].svg(st)
      tag.current.textContent = labels[k] || k
    }

    const resolve = (target) => {
      if (forced) return forced
      let k = 'arrow'
      if (target instanceof Element) {
        for (const [name, selector] of rules) {
          if (target.closest(selector)) { k = name; break }
        }
      }
      if (k === 'hand' && down) k = 'grab'
      return k
    }

    const loop = () => {
      cx += (x - cx) * smoothing
      cy += (y - cy) * smoothing
      const [hx, hy] = TOOLS[tool || 'arrow'].hot
      el.style.transform = `translate3d(${cx - hx}px, ${cy - hy}px, 0)`
      raf = Math.hypot(x - cx, y - cy) > 0.1 ? requestAnimationFrame(loop) : 0
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop) }

    const onMove = (e) => {
      x = e.clientX
      y = e.clientY
      overEl = e.target
      if (!seen) { seen = true; cx = x; cy = y; el.style.opacity = '1' }
      paint(resolve(overEl))
      kick()
    }
    const onDown = (e) => { down = true; el.classList.add('is-down'); paint(resolve(e.target)); kick() }
    const onUp = () => { down = false; el.classList.remove('is-down'); paint(resolve(overEl)); kick() }
    const onLeave = () => { el.style.opacity = '0'; seen = false }

    const setForced = (k) => { forced = k === 'arrow' ? null : k; paint(resolve(overEl)); kick() }
    const onKey = (e) => {
      const t = e.target
      if (t instanceof Element && t.closest('input, textarea, [contenteditable]')) return
      if (e.key === 'Escape') { setForced('arrow'); return }
      const k = HOTKEYS[e.key.toLowerCase()]
      if (k && !e.ctrlKey && !e.metaKey && !e.altKey) setForced(k)
    }

    paint('arrow')
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    window.addEventListener('blur', onUp)
    document.documentElement.addEventListener('mouseleave', onLeave)
    if (hotkeys) window.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(raf)
      html.classList.remove('has-figma-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('blur', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('keydown', onKey)
    }
  }, [style, smoothing, hotkeys, rules, labels])

  return (
    <div className={`figma-cursor${showTag ? ' has-tag' : ''}`} ref={root} aria-hidden="true">
      <span className="figma-cursor-icon" ref={icon} />
      <span className="figma-cursor-tag" ref={tag} />
    </div>
  )
}

export default FigmaCursor
