import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import './index.css'
// Estilos globales de la web (incluye reglas de html/h3 que el backoffice también hereda): van en el chunk principal.
import './App.css'
import ContentProvider from '@/app/ContentProvider'
import { createAppRouter } from '@/app/router'
import { migrateHashRoute } from '@/lib/legacyHash'

// Los links viejos con #/bo se convierten a path antes de crear el router.
migrateHashRoute()
const router = createAppRouter()

const root = document.getElementById('root')
if (!root) throw new Error('Falta #root en index.html')

createRoot(root).render(
  <StrictMode>
    <ContentProvider>
      <RouterProvider router={router} />
    </ContentProvider>
  </StrictMode>,
)
