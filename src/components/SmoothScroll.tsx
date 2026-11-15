import { useRef } from 'react'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

const SmoothScroll = () => {
  const bar = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  useSmoothScroll({ track, bar })

  return (
    <div className="scroll-indicator" ref={track} aria-hidden="true">
      <div className="scroll-indicator-bar" ref={bar} />
    </div>
  )
}

export default SmoothScroll
