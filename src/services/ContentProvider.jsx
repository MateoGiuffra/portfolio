import { useEffect, useState } from 'react'
import { ContentContext } from './ContentContext'
import { FALLBACK, loadRemoteContent, readCache } from './content'

// Arranca con la caché (o el respaldo) y reemplaza por lo que haya en la base de datos.
export default function ContentProvider({ children }) {
  const [value, setValue] = useState(() => readCache() || FALLBACK)
  useEffect(() => {
    let alive = true
    loadRemoteContent()
      .then((v) => alive && setValue(v))
      .catch(() => {})
    return () => { alive = false }
  }, [])
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}
