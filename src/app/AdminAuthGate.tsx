import { Center, Loader } from '@mantine/core'
import { Navigate, Outlet, useLocation, useMatch } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { ADMIN_LOGIN, ADMIN_ROOT, DEFAULT_ADMIN_PAGE, adminPath } from '@/lib/adminPaths'

interface LoginState {
  from?: string
}

// Origen guardado al mandar al login; solo se acepta una ruta del BO que no sea el login.
function originOf(state: unknown): string {
  // `state` es unknown (location.state); se estrecha a LoginState y `from` se revalida con typeof abajo.
  const from = (state as LoginState | null)?.from
  return typeof from === 'string' && from.startsWith(`${ADMIN_ROOT}/`) && from !== ADMIN_LOGIN ? from : ''
}

// Sin sesión se va a /bo/login guardando de dónde venía; con sesión en /bo/login se vuelve a ese origen.
export default function AdminAuthGate() {
  const auth = useAuth()
  const location = useLocation()
  const onLogin = useMatch(ADMIN_LOGIN) !== null

  if (auth.user === undefined) return <Center mih="100vh"><Loader /></Center>
  if (!auth.user && !onLogin) {
    return <Navigate to={ADMIN_LOGIN} replace state={{ from: location.pathname + location.search } satisfies LoginState} />
  }
  if (auth.user && onLogin) {
    return <Navigate to={originOf(location.state) || adminPath(DEFAULT_ADMIN_PAGE)} replace />
  }
  return <Outlet context={auth} />
}
