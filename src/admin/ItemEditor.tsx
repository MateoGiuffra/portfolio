import { useState } from 'react'
import { Button, Group, NumberInput, Stack, Switch, TagsInput, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { UseFormReturnType } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { LIST_SPECS } from '@/domain/schema'
import type { Lang, ListDataMap, ListName, ProjectData } from '@/domain/types'
import { useReportDirty } from '@/hooks/useUnsaved'
import { notifyError } from '@/lib/notify'
import { stripMeta } from '@/lib/stripMeta'
import CardEditor from './CardEditor'
import LangSwitch from './LangSwitch'
import { Localized, Tree } from './Tree'
import type { Dict, EditableItem, FieldKind, Rule } from './shape'
import {
  FIELD_META, PRIMARY, copyAllFromEs, labelOf, missingCount, photosRule, requiredEs, toDict, urlRule,
} from './shape'

const RULES: Partial<Record<FieldKind, Rule>> = { url: urlRule, photos: photosRule }

type ItemForm = UseFormReturnType<Dict>

// Campo compartido (no localizado): componente según FIELD_META o, si no hay, según la forma del dato.
function Shared({ name, form }: { name: string; form: ItemForm }) {
  const kind = FIELD_META[name]?.kind
  const value = form.values[name]
  const set = (v: unknown) => form.setFieldValue(name, v)
  const error = form.errors[name]
  const label = labelOf(name)
  const text = typeof value === 'string' ? value : ''
  if (kind === 'month') {
    return <TextInput type="month" label={label} value={text} error={error} onChange={(e) => set(e.target.value)} />
  }
  if (kind === 'url') {
    return <TextInput label={label} placeholder="https://…" value={text} error={error} onChange={(e) => set(e.target.value)} />
  }
  if (kind === 'number') {
    return (
      <NumberInput
        label={label} value={typeof value === 'number' || typeof value === 'string' ? value : 0} error={error} min={0}
        onChange={(v) => set(v === '' ? 0 : Number(v))}
      />
    )
  }
  const list = Array.isArray(value) ? value.map(String) : []
  if (kind === 'photos') {
    // TODO(cloudinary): reemplazar por subida de archivos (upload widget) y guardar las URLs resultantes acá.
    return (
      <TagsInput
        label={label} description="URLs de imágenes (la subida con Cloudinary viene después)"
        placeholder="Pegá una URL y apretá Enter" splitChars={[' ']} clearable value={list} error={error} onChange={set}
      />
    )
  }
  if (kind === 'tags') {
    return <TagsInput label={label} placeholder="Escribí y apretá Enter" clearable value={list} error={error} onChange={set} />
  }
  return <Tree name={name} value={value ?? ''} error={error} onChange={set} />
}

interface ItemEditorProps {
  name: ListName
  item: EditableItem
  onSave: (id: string | null, data: ListDataMap[ListName]) => Promise<unknown>
  onCancel: () => void
}

// Formulario de un elemento de lista (un solo formulario; el idioma activo se elige arriba).
export default function ItemEditor({ name, item, onSave, onCancel }: ItemEditorProps) {
  const spec = LIST_SPECS[name]
  const id = item.id ?? null
  const [lang, setLang] = useState<Lang>('es')

  const validate: Record<string, Rule> = { [PRIMARY[name]]: requiredEs }
  for (const k of spec.shared) {
    const kind = FIELD_META[k]?.kind
    const rule = kind ? RULES[kind] : undefined
    if (rule) validate[k] = rule
  }
  const form = useForm<Dict>({ mode: 'controlled', initialValues: toDict(stripMeta<ListName>(item)), validate })
  const dirty = form.isDirty()
  useReportDirty(dirty)

  const pick = (): Dict => Object.fromEntries(spec.localized.map((k) => [k, form.values[k]]))
  const missing = { es: missingCount(pick(), 'es'), en: missingCount(pick(), 'en') }

  const submit = form.onSubmit(
    async (values) => {
      try {
        // Los valores salen del formulario armado desde `spec`: tienen la forma de los datos de la lista.
        const data = { ...values, order: Number(values.order) || 0, visible: values.visible !== false } as unknown as ListDataMap[ListName]
        await onSave(id, data)
        form.resetDirty()
      } catch (e) {
        notifyError('No se pudo guardar', e)
      }
    },
    () => {
      setLang('es') // el error de "obligatorio" está en ES
      notifications.show({ color: 'amber', title: 'Revisá el formulario', message: 'Hay campos con errores' })
    },
  )

  return (
    <form onSubmit={submit}>
      <Stack gap="md">
        <LangSwitch
          lang={lang} onChange={setLang} missing={missing}
          onCopyAll={() => form.setValues(copyAllFromEs(pick()))}
        />
        {name === 'projects' && (
          // Para 'projects' los valores del formulario son los datos del proyecto.
          <CardEditor item={form.values as Partial<ProjectData>} onChange={(card) => form.setFieldValue('card', card)} />
        )}
        {spec.localized.map((k) => (
          <Localized
            key={k} name={k} lang={lang} value={form.values[k]} error={form.errors[k]}
            onChange={(v) => form.setFieldValue(k, v)}
          />
        ))}
        {spec.shared.filter((k) => k !== 'card').map((k) => <Shared key={k} name={k} form={form} />)}
        <Switch
          label="Visible en la web" checked={form.values.visible !== false}
          onChange={(e) => form.setFieldValue('visible', e.currentTarget.checked)}
        />
        <Group justify="flex-end" gap="xs" className="bo-sticky-foot">
          {dirty && <span className="bo-dirty">Cambios sin guardar</span>}
          <Button variant="default" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={!dirty} loading={form.submitting}>Guardar</Button>
        </Group>
      </Stack>
    </form>
  )
}
