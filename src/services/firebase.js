import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Config web de Firebase en base64 (por comodidad). No es un secreto: la seguridad
// la dan las reglas de Firestore (firestore.rules) y el login de Google.
const CONFIG_B64 =
  'eyJwcm9qZWN0SWQiOiJjb3VudGVyLWEwNWM0IiwiYXBwSWQiOiIxOjI3MTkwNDkyOTk1MTp3ZWI6ZmU1NDE3OWU5ZmM1YWZjOWZhNGFhYSIsInN0b3JhZ2VCdWNrZXQiOiJjb3VudGVyLWEwNWM0LmZpcmViYXNlc3RvcmFnZS5hcHAiLCJhcGlLZXkiOiJBSXphU3lCWEFXWjhSNXAxZDRRMGNzTEk2dTBReE9Fb3hXSTJNTmsiLCJhdXRoRG9tYWluIjoiY291bnRlci1hMDVjNC5maXJlYmFzZWFwcC5jb20iLCJtZXNzYWdpbmdTZW5kZXJJZCI6IjI3MTkwNDkyOTk1MSJ9'

const app = initializeApp(JSON.parse(atob(CONFIG_B64)))
export const db = getFirestore(app)
export { app }

// Mails con permiso de escritura. Tienen que coincidir con firestore.rules.
export const ADMIN_EMAILS = ['matteogiuffrah40@gmail.com', 'mgiuffra@mobeats.io']
