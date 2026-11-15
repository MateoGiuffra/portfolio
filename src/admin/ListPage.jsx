import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActionIcon, Button, Drawer, Group, Loader, Modal, Paper, Stack, Switch, Text, Title,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { notifications } from '@mantine/notifications'
import {
  DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { listDocs, removeDoc, saveDoc } from '../services/firestoreApi'
import { LIST_SPECS, buildSeed } from '../services/schema'
import { content, LINKS, CV_FILES } from '../i18n/content'
import ItemEditor from './ItemEditor'
import { navigate } from './router'
import { useUnsaved } from './Unsaved'
import { NEW_ITEM, stripMeta, summaryOf, titleOf } from './shape'

const ICON = { size: 16, strokeWidth: 1.5, 'aria-hidden': true }

const fail = (title, e) => notifications.show({ color: 'negative', title, message: e?.message || String(e) })

function Row({ item, title, onToggle, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const hidden = item.visible === false
  return (
    <Paper
      ref={setNodeRef} withBorder p="xs" shadow={isDragging ? 'md' : undefined}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 5 : undefined, position: 'relative' }}
    >
      <Group wrap="nowrap" gap="xs">
        <ActionIcon
          ref={setActivatorNodeRef} variant="subtle" color="gray" aria-label="Arrastrar para reordenar" title="Arrastrar para reordenar"
          style={{ cursor: 'grab', touchAction: 'none' }} {...attributes} {...listeners}
        ><GripVertical {...ICON} /></ActionIcon>
        <div style={{ flex: 1, minWidth: 0, opacity: hidden ? 0.5 : 1 }}>
          <Group gap="xs" wrap="nowrap">
            <Text fw={500} truncate>{title}</Text>
            {hidden && <span className="bo-meta">Oculto</span>}
          </Group>
          <Text size="xs" c="dimmed" truncate>{summaryOf(item)}</Text>
        </div>
        <Switch checked={!hidden} onChange={() => onToggle(item)} aria-label="Visible en la web" title="Visible en la web" />
        <ActionIcon variant="subtle" color="gray" aria-label="Editar" title="Editar" onClick={() => onEdit(item)}><Pencil {...ICON} /></ActionIcon>
        <ActionIcon variant="subtle" color="negative" aria-label="Borrar" title="Borrar" onClick={() => onDelete(item)}><Trash2 {...ICON} /></ActionIcon>
      </Group>
    </Paper>
  )
}

export default function ListPage({ name, slug, itemId }) {
  const spec = LIST_SPECS[name]
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const { guard } = useUnsaved()
  const mobile = useMediaQuery('(max-width: 48em)')

  const listUrl = `/${slug}`
  // El elemento abierto en el Drawer sale de la URL: /<lista>/<id> edita, /<lista>/nuevo crea.
  const draft = useMemo(
    () => (itemId === 'nuevo' && items ? { ...NEW_ITEM[name](items.length), order: items.length, visible: true } : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemId, name, items === null],
  )
  const editing = itemId === 'nuevo' ? draft : (items?.find((x) => x.id === itemId) ?? null)
  // Una URL con un id que no existe vuelve a la lista.
  useEffect(() => {
    if (itemId && itemId !== 'nuevo' && items && !items.some((x) => x.id === itemId)) navigate(listUrl, { replace: true })
  }, [itemId, items, listUrl])

  const load = useCallback(() => listDocs(name).then(setItems).catch((e) => setError(e.message)), [name])
  useEffect(() => { load() }, [load])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Reordenar: actualización optimista; se persiste `order` solo de los que cambiaron de lugar.
  const onDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return
    const prev = items
    const next = arrayMove(prev, prev.findIndex((i) => i.id === active.id), prev.findIndex((i) => i.id === over.id))
      .map((it, i) => ({ ...it, order: i }))
    setItems(next)
    const oldOrder = new Map(prev.map((p) => [p.id, p.order]))
    try {
      await Promise.all(next.filter((it) => oldOrder.get(it.id) !== it.order).map((it) => saveDoc(name, it.id, stripMeta(it))))
    } catch (e) {
      setItems(prev) // rollback
      fail('No se pudo guardar el orden', e)
      load() // por si alguno llegó a escribirse
    }
  }

  const toggle = async (it) => {
    const visible = it.visible === false
    setItems((list) => list.map((x) => (x.id === it.id ? { ...x, visible } : x)))
    try {
      await saveDoc(name, it.id, { ...stripMeta(it), visible })
    } catch (e) {
      setItems((list) => list.map((x) => (x.id === it.id ? it : x)))
      fail('No se pudo cambiar la visibilidad', e)
    }
  }

  const save = async (id, data) => {
    const savedId = await saveDoc(name, id, data)
    setItems((list) => (id ? list.map((x) => (x.id === id ? { id, ...data } : x)) : [...list, { id: savedId, ...data }]))
    notifications.show({ color: 'positive', message: 'Guardado' })
    navigate(listUrl, { replace: true })
  }

  const remove = async () => {
    const it = deleting
    setBusy(true)
    try {
      await removeDoc(name, it.id)
      setItems((list) => list.filter((x) => x.id !== it.id))
      notifications.show({ color: 'positive', message: `Borrado: ${titleOf(name, it)}` })
      setDeleting(null)
    } catch (e) {
      fail('No se pudo borrar', e)
    } finally {
      setBusy(false)
    }
  }

  const importStatic = async () => {
    setBusy(true)
    try {
      for (const { id, data } of buildSeed(content, LINKS, CV_FILES)[name]) await saveDoc(name, id, data)
      await load()
      notifications.show({ color: 'positive', message: 'Importado' })
    } catch (e) {
      fail('No se pudo importar', e)
    } finally {
      setBusy(false)
    }
  }

  const newItem = () => navigate(`${listUrl}/nuevo`)
  const requestClose = () => guard(() => navigate(listUrl))

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>{spec.label}</Title>
        <Button onClick={newItem} disabled={items === null} leftSection={<Plus {...ICON} />}>Nuevo</Button>
      </Group>

      {error && <Text c="negative">{error}</Text>}
      {items === null && !error && <Loader size="sm" />}
      {items?.length === 0 && (
        <Paper withBorder p="xl">
          <Stack align="flex-start">
            <Text c="dimmed">Todavía no hay nada acá</Text>
            <Button variant="default" loading={busy} onClick={importStatic}>Importar lo que hoy está en el código</Button>
          </Stack>
        </Paper>
      )}
      {items?.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <Stack gap="xs">
              {items.map((it) => (
                <Row key={it.id} item={it} title={titleOf(name, it)} onToggle={toggle} onEdit={(it) => navigate(`${listUrl}/${it.id}`)} onDelete={setDeleting} />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
      )}

      <Drawer
        opened={!!editing} onClose={requestClose} position="right" size={mobile ? '100%' : 'xl'}
        title={`${editing?.id ? 'Editar' : 'Nuevo'} · ${spec.label}`} closeOnClickOutside={false}
      >
        {editing && (
          <ItemEditor
            key={editing.id || 'new'} name={name} item={editing} onSave={save} onCancel={requestClose}
          />
        )}
      </Drawer>

      <Modal opened={!!deleting} onClose={() => setDeleting(null)} title="Borrar" centered>
        <Stack>
          <Text>¿Borrar &quot;{deleting && titleOf(name, deleting)}&quot;? No se puede deshacer.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleting(null)}>Cancelar</Button>
            <Button color="negative" loading={busy} onClick={remove}>Borrar</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
