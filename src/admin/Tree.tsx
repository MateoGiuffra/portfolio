// Editor genérico: arma el campo a partir de la forma del dato (texto, número, lista, objeto).
// `Localized` edita SOLO el idioma activo de un valor {es, en}.
import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  ActionIcon, Button, Group, NumberInput, Paper, Stack, Switch, TagsInput, Text, TextInput, Textarea,
} from '@mantine/core'
import { Plus, X } from 'lucide-react'
import { ICON } from '@/lib/icons'
import type { Lang } from '@/domain/types'
import type { Dict, LocalizedValue } from './shape'
import { LINES, PROTOS, blankDict, blankLike, isDict, isEmpty, isList, isLocalized, labelOf } from './shape'

interface FieldProps {
  label?: ReactNode
  description?: ReactNode
  error?: ReactNode
}

interface LinesInputProps extends FieldProps {
  value: string[]
  onChange: (value: string[]) => void
}

// Una frase por línea. El texto crudo vive en estado local (si no, Enter se "come" las líneas vacías).
// Para forzar el reinicio desde afuera (p. ej. "copiar desde ES") se cambia la `key`.
function LinesInput({ value, onChange, label, description, error }: LinesInputProps) {
  const [text, setText] = useState(value.join('\n'))
  return (
    <Textarea
      label={label} description={description} error={error} autosize minRows={2} maxRows={10}
      placeholder="Uno por línea" value={text}
      onChange={(e) => {
        setText(e.target.value)
        onChange(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))
      }}
    />
  )
}

interface ListFieldProps extends FieldProps {
  name: string
  value: unknown
  reference?: unknown
  onChange: (value: unknown[]) => void
}

function ListField({ name, label, description, error, value, reference, onChange }: ListFieldProps) {
  const items = isList(value) ? value : []
  const ref = isList(reference) ? reference : []
  const objects = !!PROTOS[name] || [...items, ...ref].some((x) => x && typeof x === 'object')

  if (!objects) {
    const strings = items.map(String)
    const long = LINES.has(name) || [...items, ...ref].some((s) => String(s).length > 45)
    if (long) return <LinesInput value={strings} onChange={onChange} label={label} description={description} error={error} />
    return (
      <TagsInput
        label={label} description={description} error={error} value={strings} onChange={onChange}
        placeholder="Escribí y apretá Enter" clearable
      />
    )
  }

  const sample = items[0] ?? ref[0]
  const proto: Dict = PROTOS[name] ?? (isDict(sample) ? blankDict(sample) : {})
  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>{label}</Text>
      {items.map((item, i) => {
        const row = isDict(item) ? item : {}
        return (
          // Los elementos no tienen id: el índice es su identidad (se editan y se quitan por posición).
          <Paper key={i} withBorder p="xs">
            <Group gap="xs" align="flex-start" wrap="nowrap">
              <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                {Object.keys(proto).map((k) => (
                  <TextInput
                    key={k} size="xs" placeholder={labelOf(k)} aria-label={labelOf(k)} value={String(row[k] ?? '')}
                    onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...row, [k]: e.target.value } : x)))}
                  />
                ))}
              </Stack>
              <ActionIcon
                color="gray" variant="subtle" aria-label="Quitar" title="Quitar"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
              ><X {...ICON} /></ActionIcon>
            </Group>
          </Paper>
        )
      })}
      <Button
        variant="default" size="xs" style={{ alignSelf: 'flex-start' }} leftSection={<Plus size={14} strokeWidth={1.5} aria-hidden />}
        onClick={() => onChange([...items, structuredClone(proto)])}
      >
        Agregar
      </Button>
    </Stack>
  )
}

interface TreeProps extends FieldProps {
  name: string
  value: unknown
  /** Valor de ES: sirve para decidir la forma cuando el valor actual está vacío. */
  reference?: unknown
  onChange: (value: unknown) => void
}

export function Tree({ name, label, description, error, value, reference, onChange }: TreeProps) {
  const lbl = label ?? labelOf(name)
  const probe = !isEmpty(value) ? value : reference !== undefined && !isEmpty(reference) ? reference : value

  if (isList(probe) || PROTOS[name]) {
    return <ListField {...{ name, description, error, value, reference, onChange }} label={lbl} />
  }
  if (isDict(probe)) {
    const base = isDict(value) ? value : blankDict(probe)
    const ref = isDict(reference) ? reference : {}
    return (
      <Stack gap="xs">
        <Text size="sm" fw={500}>{lbl}</Text>
        <Stack gap="xs" pl="sm" style={{ borderLeft: '2px solid var(--mantine-color-dark-4)' }}>
          {Object.keys(probe).map((k) => (
            <Tree
              key={k} name={k} value={base[k]} reference={ref[k]}
              onChange={(nv) => onChange({ ...base, [k]: nv })}
            />
          ))}
        </Stack>
      </Stack>
    )
  }
  if (typeof probe === 'number') {
    return (
      <NumberInput
        label={lbl} description={description} error={error}
        value={typeof value === 'number' || typeof value === 'string' ? value : 0}
        onChange={(v) => onChange(v === '' ? 0 : Number(v))}
      />
    )
  }
  if (typeof probe === 'boolean') {
    return <Switch label={lbl} checked={!!value} onChange={(e) => onChange(e.currentTarget.checked)} />
  }
  const text = typeof value === 'string' ? value : ''
  const long = text.length > 70 || text.includes('\n') || (typeof probe === 'string' && (probe.length > 70 || probe.includes('\n')))
  if (long) {
    return (
      <Textarea
        label={lbl} description={description} error={error} value={text}
        onChange={(e) => onChange(e.target.value)} autosize minRows={2} maxRows={10}
      />
    )
  }
  return (
    <TextInput
      label={lbl} description={description} error={error} value={text}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

const short = (s: string): string => (s.length > 90 ? `${s.slice(0, 90)}…` : s)

interface LocalizedProps {
  name: string
  label?: ReactNode
  value: unknown
  lang: Lang
  onChange: (value: LocalizedValue) => void
  error?: ReactNode
}

// Campo localizado: edita solo `lang`. Si EN está vacío y ES no, ofrece "Copiar desde ES".
export function Localized({ name, label, value, lang, onChange, error }: LocalizedProps) {
  const [nonce, setNonce] = useState(0)
  const v: LocalizedValue = isLocalized(value) ? value : { es: value ?? '', en: undefined }
  const canCopy = lang === 'en' && isEmpty(v.en) && !isEmpty(v.es)
  const set = (nv: unknown) => onChange({ es: v.es ?? blankLike(nv), en: v.en ?? blankLike(nv), [lang]: nv })
  const copy = () => {
    set(structuredClone(v.es))
    setNonce((n) => n + 1)
  }
  const text = label ?? labelOf(name)
  const lbl = (
    <Group gap="xs" component="span" display="inline-flex">
      {text}
      {canCopy && (
        <Button size="compact-xs" variant="default" onClick={copy}>Copiar desde ES</Button>
      )}
    </Group>
  )
  const hint = lang === 'en' && typeof v.es === 'string' && v.es ? `ES: ${short(v.es)}` : undefined
  return (
    <Tree
      key={`${lang}-${nonce}`} name={name} label={lbl} description={hint} error={error}
      value={v[lang]} reference={v.es} onChange={set}
    />
  )
}
