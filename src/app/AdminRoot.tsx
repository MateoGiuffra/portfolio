// Raíz del backoffice: el CSS de Mantine se importa acá, así que solo se descarga con el chunk del admin.
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { Outlet } from 'react-router'
import { theme } from '@/admin/theme'
import UnsavedProvider from '@/admin/UnsavedProvider'
import ErrorBoundary from '@/app/ErrorBoundary'
import '@/admin/admin.css'

export default function AdminRoot() {
  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      <Notifications position="bottom-right" />
      <ErrorBoundary>
        <UnsavedProvider>
          <Outlet />
        </UnsavedProvider>
      </ErrorBoundary>
    </MantineProvider>
  )
}
