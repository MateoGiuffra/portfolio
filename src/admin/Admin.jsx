import { useCallback, useEffect, useState } from 'react'
import {
  GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { app, ADMIN_EMAILS, db } from '../services/firebase'
import { listDocs, removeDoc, saveDoc } from '../services/firestoreApi'
import { LIST_SPECS, SECTION_SPECS, buildSeed } from '../services/schema'
import { content, LINKS, CV_FILES } from '../i18n/content'
import { defaultCard } from '../config/cardPalette'
import { Localized, Tree } from './Tree'
import CardEditor from './CardEditor'
import './admin.css'

const auth = getAuth(app)

// Elemento nuevo de cada lista (los campos {es,en} arrancan vacíos).
const L = (v = '') => ({ es: v, en: v })
const NEW_ITEM = {
  workItems: () => ({ title: L(), text: L() }),
  jobs: () => ({
    company: L(), role: L(), period: L(), start: L(), end: L(), tagline: L(), badge: L(), site: L(),
    bullets: L([]), stats: L([]), siteUrl: '', startDate: '', endDate: '',
  }),
  education: () => ({ name: L(), where: L(), period: L(), kind: L(), progressLabel: L(), tags: L([]), mark: '', progress: 0 }),
  skillGroups: () => ({ name: L(), text: L() }),
  projects: (n) => ({
    title: L(), text: L(), stack: [], code: '', demo: '', github: '', linkedin: '',
    startDate: '', endDate: '', photos: [], card: defaultCard(n),
  }),
}

const Field = ({ label, children }) => (
  <label className="bo-field"><span>{label}</span>{children}</label>
)

// ---------- Secciones (documentos `content/*`) ----------
function SectionEditor({ id, onClose }) {
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('')
  useEffect(() => {
    getDoc(doc(db, 'content', id)).then((s) => setData(s.exists() ? s.data() : {})).catch((e) => setMsg(e.message))
  }, [id])

  const save = async () => {
    setMsg('Guardando…')
    try {
      const { _updatedAt, ...rest } = data
      await saveDoc('content', id, rest)
      setMsg('Guardado ✓')
    } catch (e) {
      setMsg(e.message)
    }
  }
  if (!data) return <p className="bo-muted">{msg || 'Cargando…'}</p>
  const keys = Object.keys(data).filter((k) => !k.startsWith('_'))
  return (
    <div className="bo-form">
      <h2>{id === 'links' ? 'Links y CV' : SECTION_SPECS[id].label}</h2>
      {id === 'links' ? (
        <Tree value={Object.fromEntries(keys.map((k) => [k, data[k]]))} onChange={(v) => setData({ ...data, ...v })} />
      ) : (
        keys.map((k) => (
          <Field key={k} label={k}>
            <Localized name={k} value={data[k]} onChange={(v) => setData({ ...data, [k]: v })} />
          </Field>
        ))
      )}
      <div className="bo-actions">
        <button onClick={save}>Guardar</button>
        <button className="ghost" onClick={onClose}>Volver</button>
        <span className="bo-muted">{msg}</span>
      </div>
    </div>
  )
}

function Sections() {
  const [open, setOpen] = useState(null)
  if (open) return <SectionEditor id={open} onClose={() => setOpen(null)} />
  return (
    <div>
      <h2>Textos de la web</h2>
      <ul className="bo-list">
        {[...Object.entries(SECTION_SPECS).map(([id, s]) => [id, s.label]), ['links', 'Links y CV']].map(([id, label]) => (
          <li key={id}>
            <strong>{label}</strong>
            <button className="ghost" onClick={() => setOpen(id)}>Editar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------- Listas (proyectos, trabajos, estudios...) ----------
function ItemEditor({ name, initial, onSave, onCancel }) {
  const spec = LIST_SPECS[name]
  const [d, setD] = useState(initial)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { id, _updatedAt, ...data } = d
      await onSave(id, { ...data, order: Number(data.order) || 0, visible: data.visible !== false })
    } finally {
      setBusy(false)
    }
  }
  const text = (v) => (v && typeof v === 'object' ? v.es : v)

  return (
    <form className="bo-form" onSubmit={submit}>
      <h2>{d.id ? 'Editar' : 'Nuevo'} · {spec.label}</h2>
      {name === 'projects' && <CardEditor item={d} onChange={(card) => set('card', card)} />}
      {spec.localized.map((k) => (
        <Field key={k} label={k}>
          <Localized name={k} value={d[k]} onChange={(v) => set(k, v)} />
        </Field>
      ))}
      {spec.shared.filter((k) => k !== 'card').map((k) => (
        <Field key={k} label={k + (k === 'photos' ? ' (URLs; la subida de archivos viene después)' : '')}>
          <Tree name={k} value={d[k] ?? ''} onChange={(v) => set(k, v)} />
        </Field>
      ))}
      <div className="bo-row">
        <Field label="Orden"><input type="number" value={d.order ?? 0} onChange={(e) => set('order', e.target.value)} /></Field>
        <Field label="Visible en la web">
          <input type="checkbox" checked={d.visible !== false} onChange={(e) => set('visible', e.target.checked)} />
        </Field>
      </div>
      <div className="bo-actions">
        <button type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" className="ghost" onClick={onCancel}>Cancelar</button>
        <span className="bo-muted">{text(d.title) || text(d.name) || text(d.company)}</span>
      </div>
    </form>
  )
}

function ListManager({ name }) {
  const spec = LIST_SPECS[name]
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    listDocs(name).then(setItems).catch((e) => setError(e.message))
  }, [name])
  useEffect(() => { load() }, [load])

  const save = async (id, data) => {
    await saveDoc(name, id, data)
    setEditing(null)
    load()
  }
  const remove = async (it) => {
    if (!window.confirm(`¿Borrar "${label(it)}"? No se puede deshacer.`)) return
    await removeDoc(name, it.id)
    load()
  }
  const move = async (i, dir) => {
    const a = items[i], b = items[i + dir]
    if (!b) return
    const { id: ia, ...da } = a
    const { id: ib, ...db_ } = b
    await Promise.all([saveDoc(name, ia, { ...da, order: i + dir }), saveDoc(name, ib, { ...db_, order: i })])
    load()
  }
  const toggle = async (it) => {
    const { id, ...data } = it
    await saveDoc(name, id, { ...data, visible: it.visible === false })
    load()
  }
  const importStatic = async () => {
    for (const { id, data } of buildSeed(content, LINKS, CV_FILES)[name]) await saveDoc(name, id, data)
    load()
  }
  const label = (it) => {
    const v = it.title || it.name || it.company
    return v && typeof v === 'object' ? v.es : v || it.id
  }

  if (editing) return <ItemEditor name={name} initial={editing} onSave={save} onCancel={() => setEditing(null)} />
  return (
    <div>
      <div className="bo-bar">
        <h2>{spec.label}</h2>
        <button onClick={() => setEditing({ ...NEW_ITEM[name](items?.length || 0), order: items?.length || 0, visible: true })}>
          + Nuevo
        </button>
      </div>
      {error && <p className="bo-error">{error}</p>}
      {items === null && !error && <p className="bo-muted">Cargando…</p>}
      {items?.length === 0 && (
        <div className="bo-empty">
          <p className="bo-muted">Todavía no hay nada acá.</p>
          <button className="ghost" onClick={importStatic}>Importar lo que hoy está en el código</button>
        </div>
      )}
      <ul className="bo-list">
        {items?.map((it, i) => (
          <li key={it.id} className={it.visible === false ? 'is-hidden' : ''}>
            <div>
              <strong>{label(it)}</strong>
              <small>
                {[it.startDate, it.startDate && (it.endDate || 'actual')].filter(Boolean).join(' → ')}
                {Array.isArray(it.stack) && it.stack.length ? ` · ${it.stack.join(', ')}` : ''}
                {it.visible === false ? ' · oculto' : ''}
              </small>
            </div>
            <div className="bo-actions">
              <button className="ghost" disabled={i === 0} onClick={() => move(i, -1)}>▲</button>
              <button className="ghost" disabled={i === items.length - 1} onClick={() => move(i, 1)}>▼</button>
              <button className="ghost" onClick={() => toggle(it)}>{it.visible === false ? 'Mostrar' : 'Ocultar'}</button>
              <button className="ghost" onClick={() => setEditing(it)}>Editar</button>
              <button className="ghost danger" onClick={() => remove(it)}>Borrar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const TABS = [
  ['sections', 'Textos'],
  ['projects', 'Proyectos'],
  ['jobs', 'Trabajos'],
  ['education', 'Estudios'],
  ['skillGroups', 'Habilidades'],
  ['workItems', 'Cómo trabajo'],
]

export default function Admin() {
  const [user, setUser] = useState(undefined)
  const [tab, setTab] = useState('projects')
  const [error, setError] = useState('')

  useEffect(() => onAuthStateChanged(auth, (u) => {
    if (u && !ADMIN_EMAILS.includes(u.email)) {
      setError(`${u.email} no tiene permiso.`)
      signOut(auth)
      setUser(null)
    } else {
      setUser(u)
    }
  }), [])

  const login = async () => {
    setError('')
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (e) {
      setError(e.message)
    }
  }
  const back = (e) => {
    e.preventDefault()
    window.location.assign(window.location.pathname.replace(/\/(bo|backoffice)\/?$/, '/') + window.location.search)
  }

  if (user === undefined) return <main className="bo"><p className="bo-muted">Cargando…</p></main>

  if (!user) {
    return (
      <main className="bo bo-login">
        <h1>Backoffice</h1>
        <button onClick={login}>Entrar con Google</button>
        {error && <p className="bo-error">{error}</p>}
        <a href="./" onClick={back}>← Volver al portfolio</a>
      </main>
    )
  }

  return (
    <main className="bo">
      <header className="bo-head">
        <h1>Backoffice</h1>
        <nav>
          {TABS.map(([k, label]) => (
            <button key={k} className={tab === k ? 'on' : 'ghost'} onClick={() => setTab(k)}>{label}</button>
          ))}
        </nav>
        <span className="bo-muted">{user.email}</span>
        <button className="ghost" onClick={() => signOut(auth)}>Salir</button>
      </header>
      {tab === 'sections' ? <Sections /> : <ListManager key={tab} name={tab} />}
    </main>
  )
}
