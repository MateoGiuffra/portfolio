import { useCallback, useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type { ListDataMap, ListDoc, ListName } from '@/domain/types'
import { errorMessage, notifyError } from '@/lib/notify'
import { stripMeta } from '@/lib/stripMeta'
import { listItems, removeItem, saveItem } from '@/services/contentRepo'

export interface DocListState<N extends ListName> {
  /** `null` mientras carga. */
  items: ListDoc<N>[] | null
  error: string
  reload: () => void
  /** Crea (id = null) o reemplaza. Devuelve el id; si falla, propaga el error (lo muestra el formulario). */
  save: (id: string | null, data: ListDataMap[N]) => Promise<string>
  /** Borra; avisa si falla. Devuelve `true` si se borró. */
  remove: (id: string) => Promise<boolean>
  toggleVisible: (item: ListDoc<N>) => Promise<void>
  /** Mueve `activeId` a la posición de `overId` (optimista, con rollback). */
  reorder: (activeId: string, overId: string) => Promise<void>
}

interface Loaded<N extends ListName> {
  name: N
  items: ListDoc<N>[]
}

// Una lista de Firestore para el backoffice, con actualización optimista y rollback.
export function useDocList<N extends ListName>(name: N): DocListState<N> {
  const [loaded, setLoaded] = useState<Loaded<N> | null>(null)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)
  // Si cambia `name`, lo cargado de la lista anterior no se muestra.
  const items = loaded?.name === name ? loaded.items : null

  useEffect(() => {
    let live = true
    listItems(name)
      .then((list) => { if (live) setLoaded({ name, items: list }) })
      .catch((e: unknown) => { if (live) setError(errorMessage(e)) })
    return () => { live = false }
  }, [name, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])

  const patch = useCallback((fn: (list: ListDoc<N>[]) => ListDoc<N>[]) => {
    setLoaded((cur) => (cur?.name === name ? { name, items: fn(cur.items) } : cur))
  }, [name])

  // Reordenar: se persiste `order` solo de los que cambiaron de lugar.
  const reorder = async (activeId: string, overId: string): Promise<void> => {
    if (!items || activeId === overId) return
    const prev = items
    const next = arrayMove(prev, prev.findIndex((i) => i.id === activeId), prev.findIndex((i) => i.id === overId))
      .map((it, i) => ({ ...it, order: i }))
    patch(() => next)
    const oldOrder = new Map(prev.map((p) => [p.id, p.order]))
    try {
      await Promise.all(next.filter((it) => oldOrder.get(it.id) !== it.order).map((it) => saveItem(name, it.id, stripMeta<N>(it))))
    } catch (e) {
      patch(() => prev) // rollback
      notifyError('No se pudo guardar el orden', e)
      reload() // por si alguno llegó a escribirse
    }
  }

  const toggleVisible = async (it: ListDoc<N>): Promise<void> => {
    const visible = it.visible === false
    patch((list) => list.map((x) => (x.id === it.id ? { ...x, visible } : x)))
    try {
      await saveItem(name, it.id, { ...stripMeta<N>(it), visible })
    } catch (e) {
      patch((list) => list.map((x) => (x.id === it.id ? it : x)))
      notifyError('No se pudo cambiar la visibilidad', e)
    }
  }

  const save = async (id: string | null, data: ListDataMap[N]): Promise<string> => {
    const savedId = await saveItem(name, id, data)
    patch((list) => (id
      ? list.map((x) => (x.id === id ? { id, ...data } : x))
      : [...list, { id: savedId, ...data }]))
    return savedId
  }

  const remove = async (id: string): Promise<boolean> => {
    try {
      await removeItem(name, id)
      patch((list) => list.filter((x) => x.id !== id))
      return true
    } catch (e) {
      notifyError('No se pudo borrar', e)
      return false
    }
  }

  return { items, error, reload, save, remove, toggleVisible, reorder }
}
