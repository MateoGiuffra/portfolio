import {
  addDoc, collection, deleteDoc, doc, getDocs, setDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import { COLLECTIONS } from './schema'

// Lee todo el contenido en paralelo (8 + ~25 documentos por visita).
export async function fetchRaw() {
  const snaps = await Promise.all(COLLECTIONS.map((c) => getDocs(collection(db, c))))
  const raw = { content: {} }
  COLLECTIONS.forEach((c, i) => {
    if (c === 'content') snaps[i].forEach((d) => { raw.content[d.id] = d.data() })
    else raw[c] = snaps[i].docs.map((d) => ({ id: d.id, ...d.data() }))
  })
  return raw
}

export async function listDocs(name) {
  const snap = await getDocs(collection(db, name))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

const stamp = (data) => ({ ...data, _updatedAt: new Date().toISOString() })

export async function saveDoc(name, id, data) {
  if (id) {
    await setDoc(doc(db, name, id), stamp(data))
    return id
  }
  return (await addDoc(collection(db, name), stamp(data))).id
}

export const removeDoc = (name, id) => deleteDoc(doc(db, name, id))
