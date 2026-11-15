import { useEffect, useState } from 'react'
import { SEL } from '@/lib/selectors'

// Transparente y flotando sobre el hero; al salir del hero vuelve al fondo sólido.
export function useOverHero(): boolean {
  const [over, setOver] = useState(true)
  useEffect(() => {
    const check = (): void => {
      const hero = document.getElementById(SEL.hero)
      setOver(hero ? window.scrollY < hero.offsetHeight - 90 : false)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])
  return over
}
