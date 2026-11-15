import { useCallback, useEffect, useState } from 'react'
import { signInWithGoogle, signOutUser, subscribeAuth } from '@/services/authService'
import type { AdminUser } from '@/services/authService'
import { errorMessage } from '@/lib/notify'

export interface UseAuth {
  /** undefined = todavía resolviendo la sesión; null = sin sesión. */
  user: AdminUser | null | undefined
  error: string
  login: () => Promise<void>
  logout: () => Promise<void>
}

export function useAuth(): UseAuth {
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined)
  const [error, setError] = useState('')

  useEffect(
    () =>
      subscribeAuth((s) => {
        setUser(s.user)
        setError(s.error)
      }),
    [],
  )

  const login = useCallback(async (): Promise<void> => {
    setError('')
    try {
      await signInWithGoogle()
    } catch (e: unknown) {
      setError(errorMessage(e))
    }
  }, [])

  const logout = useCallback((): Promise<void> => signOutUser(), [])

  return { user, error, login, logout }
}
