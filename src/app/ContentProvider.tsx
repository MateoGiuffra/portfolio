import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ContentContext } from '@/hooks/useContent'
import type { ContentState } from '@/hooks/useContent'
import { FALLBACK, loadRemoteContent, readCache } from '@/services/content'

interface ContentProviderProps {
  children: ReactNode
}

function initialState(): ContentState {
  const cached = readCache()
  return cached ? { content: cached, status: 'cache' } : { content: FALLBACK, status: 'loading' }
}

// Arranca con la caché (o el respaldo) y reemplaza por lo que haya en la base de datos.
// Si la base falla, `status` pasa a 'error' pero se sigue mostrando la caché/respaldo.
export default function ContentProvider({ children }: ContentProviderProps) {
  const [state, setState] = useState<ContentState>(initialState)

  useEffect(() => {
    let alive = true
    loadRemoteContent()
      .then((content) => { if (alive) setState({ content, status: 'ready' }) })
      .catch((error: unknown) => {
        console.error('No se pudo cargar el contenido remoto:', error)
        if (alive) setState((prev) => ({ ...prev, status: 'error' }))
      })
    return () => { alive = false }
  }, [])

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>
}
