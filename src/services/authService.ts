import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import type { Auth } from 'firebase/auth'
import { ADMIN_EMAILS } from '@/config/admins'
import { app } from './firebase'

export interface AdminUser {
  email: string
  displayName: string | null
}
export interface AuthState {
  user: AdminUser | null
  error: string
}

// Perezoso: Auth no se inicializa hasta que el backoffice lo necesita.
let auth: Auth | undefined
const getAuthInstance = (): Auth => (auth ??= getAuth(app))

/** Escucha la sesión. Un mail fuera de ADMIN_EMAILS se desloguea y el error queda hasta el próximo login. */
export function subscribeAuth(cb: (s: AuthState) => void): () => void {
  const instance = getAuthInstance()
  let rejected = ''
  return onAuthStateChanged(instance, (u) => {
    if (!u) {
      cb({ user: null, error: rejected })
      return
    }
    const email = u.email ?? ''
    if (!ADMIN_EMAILS.includes(email)) {
      rejected = `${email} no tiene permiso.`
      void signOut(instance) // dispara otro evento con u = null
      cb({ user: null, error: rejected })
      return
    }
    rejected = ''
    cb({ user: { email, displayName: u.displayName }, error: '' })
  })
}

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(getAuthInstance(), new GoogleAuthProvider())
}

export async function signOutUser(): Promise<void> {
  await signOut(getAuthInstance())
}
