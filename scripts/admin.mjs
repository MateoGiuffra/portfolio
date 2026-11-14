// Conexión de administración (solo desde tu PC). La clave vive FUERA del repo.
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || `${homedir()}/.config/firebase/counter-a05c4-admin.json`
initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) })
export const db = getFirestore()
