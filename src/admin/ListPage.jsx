import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActionIcon, Badge, Button, Drawer, Group, Loader, Modal, Paper, Stack, Switch, Text, Title,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
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
import { NEW_ITEM, stripMeta, summaryOf, titleOf } from './shape'

const fail = (title, e) => notifications.show({ color: 'red', title, message: e?.message || String(e) })

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
        >⠿</ActionIcon>
        <div style={{ flex: 1, minWidth: 0, opacity: hidden ? 0.5 : 1 }}>
          <Group gap="xs" wrap="nowrap">
            <Text fw={600} truncate>{title}</Text>
            {hidden && <Badge size="xs" color="gray">Oculto</Badge>}
          </Group>
          <Text size="xs" c="dimmed" truncate>{summaryOf(item)}</Text>
        </div>
        <Switch checked={!hidden} onChange={() => onToggle(item)} aria-label="Visible en la web" title="Visible en la web" />
        <ActionIcon variant="subtle" aria-label="Editar" title="Editar" onClick={() => onEdit(item)}>✎</ActionIcon>
        <ActionIcon variant="subtle" color="red" aria-label="Borrar" title="Borrar" onClick={() => onDelete(item)}>🗑</ActionIcon>
      </Group>
    </Paper>
  )
}

export default function ListPage({ name }) {
  const spec = LIST_SPECS[name]
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // elemento abierto en el Drawer (sin id = nuevo)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const dirtyRef = useRef(false)
  const mobile = useMediaQuery('(max-width: 48em)')

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
    notifications.show({ color: 'green', message: 'Guardado' })
    dirtyRef.current = false
    setEditing(null)
  }

  const remove = async () => {
    const it = deleting
    setBusy(true)
    try {
      await removeDoc(name, it.id)
      setItems((list) => list.filter((x) => x.id !== it.id))
      notifications.show({ color: 'green', message: `Borrado: ${titleOf(name, it)}` })
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
      notifications.show({ color: 'green', message: 'Importado' })
    } catch (e) {
      fail('No se pudo importar', e)
    } finally {
      setBusy(false)
    }
  }

  const newItem = () => setEditing({ ...NEW_ITEM[name](items?.length || 0), order: items?.length || 0, visible: true })
  const requestClose = () => {
    if (dirtyRef.current && !window.confirm('Tenés cambios sin guardar. ¿Descartarlos?')) return
    dirtyRef.current = false
    setEditing(null)
  }
  const onDirty = useCallback((d) => { dirtyRef.current = d }, [])

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>{spec.label}</Title>
        <Button onClick={newItem} disabled={items === null}>+ Nuevo</Button>
      </Group>

      {error && <Text c="red">{error}</Text>}
      {items === null && !error && <Loader size="sm" />}
      {items?.length === 0 && (
        <Paper withBorder p="xl">
          <Stack align="flex-start">
            <Text c="dimmed">Todavía no hay nada acá.</Text>
            <Button variant="default" loading={busy} onClick={importStatic}>Importar lo que hoy está en el código</Button>
          </Stack>
        </Paper>
      )}
      {items?.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <Stack gap="xs">
              {items.map((it) => (
                <Row key={it.id} item={it} title={titleOf(name, it)} onToggle={toggle} onEdit={setEditing} onDelete={setDeleting} />
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
            key={editing.id || 'new'} name={name} item={editing} onSave={save} onCancel={requestClose} onDirty={onDirty}
          />
        )}
      </Drawer>

      <Modal opened={!!deleting} onClose={() => setDeleting(null)} title="Borrar" centered>
        <Stack>
          <Text>¿Borrar &quot;{deleting && titleOf(name, deleting)}&quot;? No se puede deshacer.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleting(null)}>Cancelar</Button>
            <Button color="red" loading={busy} onClick={remove}>Borrar</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
