import { useEffect, useState } from 'react'
import {
  ActionIcon, Button, Drawer, Group, Loader, Modal, Paper, Stack, Switch, Text, Title,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router'
import { LIST_SPECS } from '@/domain/schema'
import type { ListDataMap, ListDoc, ListName } from '@/domain/types'
import { useDocList } from '@/hooks/useDocList'
import { useUnsaved } from '@/hooks/useUnsaved'
import { adminPath } from '@/lib/adminPaths'
import { ICON } from '@/lib/icons'
import { notifyError, notifyOk } from '@/lib/notify'
import { importSeed } from '@/services/seedImport'
import ItemEditor from './ItemEditor'
import { NEW_ITEM, summaryOf, titleOf } from './shape'
import type { EditableItem } from './shape'

type AnyDoc = ListDoc<ListName>

interface RowProps {
  item: AnyDoc
  title: string
  onToggle: (item: AnyDoc) => void
  onEdit: (item: AnyDoc) => void
  onDelete: (item: AnyDoc) => void
}

function Row({ item, title, onToggle, onEdit, onDelete }: RowProps) {
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

interface NewItemEditorProps {
  name: ListName
  count: number
  onSave: (id: string | null, data: ListDataMap[ListName]) => Promise<unknown>
  onCancel: () => void
}

// El elemento nuevo se arma una sola vez al abrir el Drawer (así sus campos no se pisan al cambiar la lista).
function NewItemEditor({ name, count, onSave, onCancel }: NewItemEditorProps) {
  const [item] = useState<EditableItem>(() => ({ ...NEW_ITEM[name](count), order: count, visible: true }))
  return <ItemEditor name={name} item={item} onSave={onSave} onCancel={onCancel} />
}

interface ListViewProps {
  name: ListName
  slug: string
  itemId?: string
}

export default function ListView({ name, slug, itemId }: ListViewProps) {
  const spec = LIST_SPECS[name]
  const { items, error, reload, save, remove, toggleVisible, reorder } = useDocList(name)
  const [deleting, setDeleting] = useState<AnyDoc | null>(null)
  const [busy, setBusy] = useState(false)
  const { guard } = useUnsaved()
  const navigate = useNavigate()
  const mobile = useMediaQuery('(max-width: 48em)')

  const listPath = adminPath(slug)
  // El elemento abierto en el Drawer sale de la URL: /<lista>/<id> edita, /<lista>/nuevo crea.
  const creating = itemId === 'nuevo' && items !== null
  const editing = itemId && itemId !== 'nuevo' ? (items?.find((x) => x.id === itemId) ?? null) : null
  // Una URL con un id que no existe vuelve a la lista.
  useEffect(() => {
    if (itemId && itemId !== 'nuevo' && items && !items.some((x) => x.id === itemId)) navigate(adminPath(slug), { replace: true })
  }, [itemId, items, slug, navigate])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over) void reorder(String(active.id), String(over.id))
  }

  const onSave = async (id: string | null, data: ListDataMap[ListName]) => {
    await save(id, data)
    notifyOk('Guardado')
    navigate(listPath, { replace: true })
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setBusy(true)
    if (await remove(deleting.id)) {
      notifyOk(`Borrado: ${titleOf(name, deleting)}`)
      setDeleting(null)
    }
    setBusy(false)
  }

  const importStatic = async () => {
    setBusy(true)
    try {
      await importSeed(name)
      reload()
      notifyOk('Importado')
    } catch (e) {
      notifyError('No se pudo importar', e)
    } finally {
      setBusy(false)
    }
  }

  const newItem = () => navigate(adminPath(slug, 'nuevo'))
  const requestClose = () => guard(() => navigate(listPath))

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
      {items && items.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <Stack gap="xs">
              {items.map((it) => (
                <Row
                  key={it.id} item={it} title={titleOf(name, it)} onToggle={toggleVisible}
                  onEdit={(x) => navigate(adminPath(slug, x.id))} onDelete={setDeleting}
                />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
      )}

      <Drawer
        opened={creating || !!editing} onClose={requestClose} position="right" size={mobile ? '100%' : 'xl'}
        title={`${editing ? 'Editar' : 'Nuevo'} · ${spec.label}`} closeOnClickOutside={false}
      >
        {creating && <NewItemEditor key={name} name={name} count={items.length} onSave={onSave} onCancel={requestClose} />}
        {editing && <ItemEditor key={editing.id} name={name} item={editing} onSave={onSave} onCancel={requestClose} />}
      </Drawer>

      <Modal opened={!!deleting} onClose={() => setDeleting(null)} title="Borrar" centered>
        <Stack>
          <Text>¿Borrar &quot;{deleting && titleOf(name, deleting)}&quot;? No se puede deshacer.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleting(null)}>Cancelar</Button>
            <Button color="negative" loading={busy} onClick={confirmDelete}>Borrar</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
