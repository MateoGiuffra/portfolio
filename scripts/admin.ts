// Conexión de administración (solo desde tu PC). La clave vive FUERA del repo.
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { initializeApp, cert } from 'firebase-admin/app'
import type { ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || `${homedir()}/.config/firebase/counter-a05c4-admin.json`
const serviceAccount: ServiceAccount = JSON.parse(readFileSync(keyPath, 'utf8'))
initializeApp({ credential: cert(serviceAccount) })
export const db = getFirestore()
