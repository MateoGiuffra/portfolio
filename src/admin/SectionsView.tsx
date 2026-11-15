import { useState } from 'react'
import { Button, Group, Loader, Paper, SimpleGrid, Stack, Text, TextInput, Title, UnstyledButton } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { SECTION_SPECS } from '@/domain/schema'
import type { Lang, SectionDoc, SectionId } from '@/domain/types'
import { useSectionDoc } from '@/hooks/useSectionDoc'
import type { ContentId } from '@/hooks/useSectionDoc'
import { useReportDirty, useUnsaved } from '@/hooks/useUnsaved'
import { adminPath } from '@/lib/adminPaths'
import { ICON } from '@/lib/icons'
import { notifyError, notifyOk } from '@/lib/notify'
import LangSwitch from './LangSwitch'
import { Localized, Tree } from './Tree'
import type { Dict, Rule } from './shape'
import { copyAllFromEs, isLocalized, labelOf, missingCount, urlRule } from './shape'

interface SectionRef {
  id: ContentId
  label: string
}

const SECTIONS: readonly SectionRef[] = [
  // Object.keys pierde el tipo de las claves; son exactamente los SectionId de SECTION_SPECS.
  ...(Object.keys(SECTION_SPECS) as SectionId[]).map((id) => ({ id, label: SECTION_SPECS[id].label })),
  { id: 'links', label: 'Links y CV' },
]
// Claves de `links` que tienen que ser URL (el CV es una ruta de archivo, no una URL).
const URL_KEYS = ['github', 'linkedin', 'email']

interface SectionFormProps {
  id: ContentId
  label: string
  data: SectionDoc
  onSave: (values: SectionDoc) => Promise<void>
}

function SectionForm({ id, label, data, onSave }: SectionFormProps) {
  const [lang, setLang] = useState<Lang>('es')
  const navigate = useNavigate()
  const validate: Record<string, Rule> = {}
  for (const k of Object.keys(data)) if (id === 'links' && URL_KEYS.includes(k)) validate[k] = urlRule
  const form = useForm<Dict>({ mode: 'controlled', initialValues: data, validate })
  const dirty = form.isDirty()
  useReportDirty(dirty)
  const { guard } = useUnsaved()
  const keys = Object.keys(form.values)
  const loc: Dict = Object.fromEntries(keys.filter((k) => isLocalized(form.values[k])).map((k) => [k, form.values[k]]))
  const missing = { es: missingCount(loc, 'es'), en: missingCount(loc, 'en') }

  const back = () => guard(() => navigate(adminPath('textos')))
  const submit = form.onSubmit(
    async (values) => {
      try {
        // Los valores parten de un documento de Firestore y se editan sin cambiar su forma.
        await onSave(values as SectionDoc)
        form.resetDirty()
        notifyOk(`Guardado: ${label}`)
      } catch (e) {
        notifyError('No se pudo guardar', e)
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

function SectionLoader({ id, label }: SectionRef) {
  const { data, error, save } = useSectionDoc(id)
  if (error) return <Text c="negative">{error}</Text>
  if (!data) return <Loader size="sm" />
  return <SectionForm id={id} label={label} data={data} onSave={save} />
}

interface SectionsViewProps {
  sectionId?: string
}

export default function SectionsView({ sectionId }: SectionsViewProps) {
  const current = SECTIONS.find((s) => s.id === sectionId)
  if (current) return <SectionLoader key={current.id} id={current.id} label={current.label} />
  return (
    <Stack>
      <Title order={3}>Textos de la web</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xs">
        {SECTIONS.map(({ id, label }) => (
          <UnstyledButton key={id} component={Link} to={adminPath('textos', id)} className="bo-link-row">
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
