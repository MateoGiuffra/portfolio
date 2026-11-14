import { useCallback, useEffect, useState } from 'react'
import { useContent } from '../services/useContent'

const STORAGE_KEY = 'portfolio-lang'

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'es' || saved === 'en') return saved
  } catch {
    // sin storage: se usa el idioma del navegador
  }
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function useLang() {
  const content = useContent()
  const [lang, setLang] = useState(initialLang)

  useEffect(() => {
    document.documentElement.lang = content[lang].htmlLang
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignorar
    }
  }, [lang, content])

  const toggle = useCallback(() => setLang((l) => (l === 'es' ? 'en' : 'es')), [])

  return { lang, t: content[lang], toggle }
}
