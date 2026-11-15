import { useOutletContext } from 'react-router'
import type { UseAuth } from '@/hooks/useAuth'

// Sesión del backoffice: la provee AdminAuthGate a las rutas hijas (login y layout).
export const useAdminAuth = (): UseAuth => useOutletContext<UseAuth>()
