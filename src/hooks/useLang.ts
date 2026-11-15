import { useCallback, useEffect, useState } from 'react'
import type { Lang, LangContent } from '@/domain/types'
import { readString, writeString } from '@/services/storage'
import { useContent } from './useContent'

const STORAGE_KEY = 'portfolio-lang'

function initialLang(): Lang {
  const saved = readString(STORAGE_KEY)
  if (saved === 'es' || saved === 'en') return saved
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export interface UseLang {
  lang: Lang
  t: LangContent
  toggle: () => void
}

export function useLang(): UseLang {
  const content = useContent()
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = content[lang].htmlLang
    writeString(STORAGE_KEY, lang)
  }, [lang, content])

  const toggle = useCallback(() => setLang((l) => (l === 'es' ? 'en' : 'es')), [])

  return { lang, t: content[lang], toggle }
}
