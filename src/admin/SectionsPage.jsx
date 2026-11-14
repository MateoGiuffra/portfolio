import { useEffect, useState } from 'react'
import { Button, Group, Loader, Paper, Stack, Text, TextInput, Title, UnstyledButton } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { saveDoc } from '../services/firestoreApi'
import { SECTION_SPECS } from '../services/schema'
import LangSwitch from './LangSwitch'
import { Localized, Tree } from './Tree'
import { copyAllFromEs, isLocalized, labelOf, missingCount, urlRule } from './shape'

const SECTIONS = [...Object.entries(SECTION_SPECS).map(([id, s]) => [id, s.label]), ['links', 'Links y CV']]
// Claves de `links` que tienen que ser URL (el CV es una ruta de archivo, no una URL).
const URL_KEYS = ['github', 'linkedin', 'email']

function SectionForm({ id, label, data, onBack }) {
  const [lang, setLang] = useState('es')
  const validate = {}
  for (const k of Object.keys(data)) if (id === 'links' && URL_KEYS.includes(k)) validate[k] = urlRule
  const form = useForm({ mode: 'controlled', initialValues: data, validate })
  const dirty = form.isDirty()
  const keys = Object.keys(form.values)
  const loc = Object.fromEntries(keys.filter((k) => isLocalized(form.values[k])).map((k) => [k, form.values[k]]))
  const missing = { es: missingCount(loc, 'es'), en: missingCount(loc, 'en') }

  const back = () => {
    if (dirty && !window.confirm('Tenés cambios sin guardar. ¿Descartarlos?')) return
    onBack()
  }
  const submit = form.onSubmit(
    async (values) => {
      try {
        await saveDoc('content', id, values)
        form.resetDirty()
        notifications.show({ color: 'green', message: `Guardado: ${label}` })
      } catch (e) {
        notifications.show({ color: 'red', title: 'No se pudo guardar', message: e.message })
      }
    },
    () => notifications.show({ color: 'yellow', title: 'Revisá el formulario', message: 'Hay campos con errores.' }),
  )

  return (
    <form onSubmit={submit}>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <Button variant="subtle" size="compact-sm" onClick={back}>← Volver</Button>
            <Title order={3}>{label}</Title>
          </Group>
        </Group>
        <LangSwitch lang={lang} onChange={setLang} missing={missing} onCopyAll={() => form.setValues(copyAllFromEs(loc))} />
        {keys.map((k) => {
          const v = form.values[k]
          if (isLocalized(v)) {
            return <Localized key={k} name={k} lang={lang} value={v} onChange={(nv) => form.setFieldValue(k, nv)} />
          }
          if (typeof v === 'string' && validate[k]) {
            return (
              <TextInput
                key={k} label={labelOf(k)} value={v} error={form.errors[k]} onChange={(e) => form.setFieldValue(k, e.target.value)}
              />
            )
          }
          return <Tree key={k} name={k} value={v} error={form.errors[k]} onChange={(nv) => form.setFieldValue(k, nv)} />
        })}
        <Group justify="flex-end" gap="xs" className="bo-sticky-foot">
          {dirty && <span className="bo-dirty">Cambios sin guardar</span>}
          <Button type="submit" disabled={!dirty} loading={form.submitting}>Guardar</Button>
        </Group>
      </Stack>
    </form>
  )
}

function SectionLoader({ id, label, onBack }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    getDoc(doc(db, 'content', id))
      .then((s) => {
        // `_updatedAt` lo agrega saveDoc; no se edita.
        const raw = s.exists() ? s.data() : {}
        setData(Object.fromEntries(Object.entries(raw).filter(([k]) => !k.startsWith('_'))))
      })
      .catch((e) => setError(e.message))
  }, [id])
  if (error) return <Text c="red">{error}</Text>
  if (!data) return <Loader size="sm" />
  return <SectionForm id={id} label={label} data={data} onBack={onBack} />
}

export default function SectionsPage() {
  const [open, setOpen] = useState(null)
  const current = SECTIONS.find(([id]) => id === open)
  if (current) return <SectionLoader key={open} id={current[0]} label={current[1]} onBack={() => setOpen(null)} />
  return (
    <Stack>
      <Title order={3}>Textos de la web</Title>
      <Stack gap="xs">
        {SECTIONS.map(([id, label]) => (
          <UnstyledButton key={id} onClick={() => setOpen(id)}>
            <Paper withBorder p="sm">
              <Group justify="space-between">
                <Text fw={600}>{label}</Text>
                <Text c="dimmed">✎</Text>
              </Group>
            </Paper>
          </UnstyledButton>
        ))}
      </Stack>
    </Stack>
  )
}
