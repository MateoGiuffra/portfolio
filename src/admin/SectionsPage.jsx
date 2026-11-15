import { useEffect, useState } from 'react'
import { Button, Group, Loader, Paper, SimpleGrid, Stack, Text, TextInput, Title, UnstyledButton } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { saveDoc } from '../services/firestoreApi'
import { SECTION_SPECS } from '../services/schema'
import LangSwitch from './LangSwitch'
import { hrefFor, navigate } from './router'
import { useReportDirty, useUnsaved } from './Unsaved'
import { Localized, Tree } from './Tree'
import { copyAllFromEs, isLocalized, labelOf, missingCount, urlRule } from './shape'

const ICON = { size: 16, strokeWidth: 1.5, 'aria-hidden': true }

const SECTIONS = [...Object.entries(SECTION_SPECS).map(([id, s]) => [id, s.label]), ['links', 'Links y CV']]
// Claves de `links` que tienen que ser URL (el CV es una ruta de archivo, no una URL).
const URL_KEYS = ['github', 'linkedin', 'email']

function SectionForm({ id, label, data }) {
  const [lang, setLang] = useState('es')
  const validate = {}
  for (const k of Object.keys(data)) if (id === 'links' && URL_KEYS.includes(k)) validate[k] = urlRule
  const form = useForm({ mode: 'controlled', initialValues: data, validate })
  const dirty = form.isDirty()
  useReportDirty(dirty)
  const { guard } = useUnsaved()
  const keys = Object.keys(form.values)
  const loc = Object.fromEntries(keys.filter((k) => isLocalized(form.values[k])).map((k) => [k, form.values[k]]))
  const missing = { es: missingCount(loc, 'es'), en: missingCount(loc, 'en') }

  const back = () => guard(() => navigate('/textos'))
  const submit = form.onSubmit(
    async (values) => {
      try {
        await saveDoc('content', id, values)
        form.resetDirty()
        notifications.show({ color: 'positive', message: `Guardado: ${label}` })
      } catch (e) {
        notifications.show({ color: 'negative', title: 'No se pudo guardar', message: e.message })
      }
    },
    () => notifications.show({ color: 'amber', title: 'Revisá el formulario', message: 'Hay campos con errores' }),
  )

  return (
    <form onSubmit={submit} style={{ maxWidth: 880, marginInline: 'auto' }}>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <Button variant="subtle" color="gray" size="compact-sm" onClick={back} leftSection={<ArrowLeft {...ICON} />}>Volver</Button>
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

function SectionLoader({ id, label }) {
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
  if (error) return <Text c="negative">{error}</Text>
  if (!data) return <Loader size="sm" />
  return <SectionForm id={id} label={label} data={data} />
}

export default function SectionsPage({ sectionId }) {
  const current = SECTIONS.find(([id]) => id === sectionId)
  if (current) return <SectionLoader key={sectionId} id={current[0]} label={current[1]} />
  return (
    <Stack>
      <Title order={3}>Textos de la web</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xs">
        {SECTIONS.map(([id, label]) => (
          <UnstyledButton
            key={id} component="a" href={hrefFor(`/textos/${id}`)} className="bo-link-row"
            onClick={(e) => { e.preventDefault(); navigate(`/textos/${id}`) }}
          >
            <Paper withBorder p="sm">
              <Group justify="space-between">
                <Text fw={500}>{label}</Text>
                <ChevronRight {...ICON} color="var(--mantine-color-dark-3)" />
              </Group>
            </Paper>
          </UnstyledButton>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
