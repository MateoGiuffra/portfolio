import { StrictMode, Suspense, lazy, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ContentProvider from './services/ContentProvider.jsx'
import { isAdminPath, migrateHashRoute } from './admin/router.js'

const Admin = lazy(() => import('./admin/Admin.jsx'))

// Backoffice: rutas por path bajo /bo (router en src/admin/router.js). Los links viejos con #/bo se convierten.
migrateHashRoute()
const isAdminRoute = () => isAdminPath()

function Root() {
  const [admin, setAdmin] = useState(isAdminRoute)
  const wasAdmin = useRef(admin)
  useEffect(() => {
    const on = () => {
      // El CSS global de Mantine queda cargado una vez abierto el admin: al salir recargamos
      // para que la web pública no herede esos estilos.
      const now = isAdminRoute()
      if (wasAdmin.current && !now) window.location.reload()
      wasAdmin.current = now
      setAdmin(now)
    }
    window.addEventListener('popstate', on)
    return () => window.removeEventListener('popstate', on)
  }, [])
  return admin ? (
    <Suspense fallback={null}>
      <Admin />
    </Suspense>
  ) : (
    <App />
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContentProvider>
      <Root />
    </ContentProvider>
  </StrictMode>,
)
