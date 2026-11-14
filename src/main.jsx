import { StrictMode, Suspense, lazy, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ContentProvider from './services/ContentProvider.jsx'

const Admin = lazy(() => import('./admin/Admin.jsx'))

// Backoffice: /bo o /backoffice (en GitHub Pages redirigen a #/bo).
const isAdminRoute = () => {
  const hash = window.location.hash.replace(/\/$/, '')
  const path = window.location.pathname.replace(/\/$/, '')
  return /^#\/(bo|backoffice)$/.test(hash) || /\/(bo|backoffice)$/.test(path)
}

function Root() {
  const [admin, setAdmin] = useState(isAdminRoute)
  useEffect(() => {
    const on = () => setAdmin(isAdminRoute())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
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
