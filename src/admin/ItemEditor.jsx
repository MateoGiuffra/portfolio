import { useEffect, useState } from 'react'
import { Button, Group, NumberInput, Stack, Switch, TagsInput, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { LIST_SPECS } from '../services/schema'
import CardEditor from './CardEditor'
import LangSwitch from './LangSwitch'
import { Localized, Tree } from './Tree'
import {
  FIELD_META, PRIMARY, copyAllFromEs, labelOf, missingCount, photosRule, requiredEs, stripMeta, urlRule,
} from './shape'

const RULES = { url: urlRule, photos: photosRule }

// Campo compartido (no localizado): componente según FIELD_META o, si no hay, según la forma del dato.
function Shared({ name, form }) {
  const kind = FIELD_META[name]?.kind
  const value = form.values[name]
  const set = (v) => form.setFieldValue(name, v)
  const error = form.errors[name]
  const label = labelOf(name)
  if (kind === 'month') {
    return <TextInput type="month" label={label} value={value ?? ''} error={error} onChange={(e) => set(e.target.value)} />
  }
  if (kind === 'url') {
    return <TextInput label={label} placeholder="https://…" value={value ?? ''} error={error} onChange={(e) => set(e.target.value)} />
  }
  if (kind === 'number') {
    return <NumberInput label={label} value={value ?? 0} error={error} min={0} onChange={(v) => set(v === '' ? 0 : Number(v))} />
  }
  if (kind === 'photos') {
    // TODO(cloudinary): reemplazar por subida de archivos (upload widget) y guardar las URLs resultantes acá.
    return (
      <TagsInput
        label={label} description="URLs de imágenes. La subida de archivos con Cloudinary viene después."
        placeholder="Pegá una URL y apretá Enter" splitChars={[' ']} clearable value={value ?? []} error={error} onChange={set}
      />
    )
  }
  if (kind === 'tags') {
    return <TagsInput label={label} placeholder="Escribí y apretá Enter" clearable value={value ?? []} error={error} onChange={set} />
  }
  return <Tree name={name} value={value ?? ''} error={error} onChange={set} />
}

// Formulario de un elemento de lista (un solo formulario; el idioma activo se elige arriba).
export default function ItemEditor({ name, item, onSave, onCancel, onDirty }) {
  const spec = LIST_SPECS[name]
  const { id } = item
  const [lang, setLang] = useState('es')

  const validate = { [PRIMARY[name]]: requiredEs }
  for (const k of spec.shared) {
    const rule = RULES[FIELD_META[k]?.kind]
    if (rule) validate[k] = rule
  }
  const form = useForm({ mode: 'controlled', initialValues: stripMeta(item), validate })
  const dirty = form.isDirty()
  useEffect(() => { onDirty(dirty) }, [dirty, onDirty])

  const localized = Object.fromEntries(spec.localized.map((k) => [k, form.values[k]]))
  const missing = { es: missingCount(localized, 'es'), en: missingCount(localized, 'en') }

  const submit = form.onSubmit(
    async (values) => {
      try {
        await onSave(id, { ...values, order: Number(values.order) || 0, visible: values.visible !== false })
        form.resetDirty()
      } catch (e) {
        notifications.show({ color: 'red', title: 'No se pudo guardar', message: e.message })
      }
    },
    () => {
      setLang('es') // el error de "obligatorio" está en ES
      notifications.show({ color: 'yellow', title: 'Revisá el formulario', message: 'Hay campos con errores.' })
    },
  )

  return (
    <form onSubmit={submit}>
      <Stack gap="md">
        <LangSwitch
          lang={lang} onChange={setLang} missing={missing}
          onCopyAll={() => form.setValues(copyAllFromEs(Object.fromEntries(spec.localized.map((k) => [k, form.values[k]]))))}
        />
        {name === 'projects' && (
          <CardEditor item={form.values} onChange={(card) => form.setFieldValue('card', card)} />
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
