import { initializeApp } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'

// Config web de Firebase. No es un secreto: la seguridad la dan las reglas de Firestore
// (firestore.rules) y el login de Google.
const firebaseConfig = {
  projectId: 'counter-a05c4',
  appId: '1:271904929951:web:fe54179e9fc5afc9fa4aaa',
  storageBucket: 'counter-a05c4.firebasestorage.app',
  apiKey: 'AIzaSyBXAWZ8R5p1d4Q0csLI6u0QxOEoxWI2MNk',
  authDomain: 'counter-a05c4.firebaseapp.com',
  messagingSenderId: '271904929951',
}

export const app: FirebaseApp = initializeApp(firebaseConfig)
export const db: Firestore = getFirestore(app)
