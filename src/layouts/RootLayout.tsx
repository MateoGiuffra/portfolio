import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'

const ADMIN_PATH = /^\/(?:bo|backoffice)(?:\/|$)/

// El CSS global de Mantine queda cargado una vez abierto el admin: al salir hacia la web pública
// recargamos para que no herede esos estilos.
export default function RootLayout() {
  const { pathname } = useLocation()
  const isAdmin = ADMIN_PATH.test(pathname)
  const wasAdmin = useRef(isAdmin)
  useEffect(() => {
    if (wasAdmin.current && !isAdmin) window.location.reload()
    wasAdmin.current = isAdmin
  }, [isAdmin])
  return <Outlet />
}
