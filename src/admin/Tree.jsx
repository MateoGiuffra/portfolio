// Editor genérico: arma el campo a partir de la forma del dato (texto, número, lista, objeto).
// `Localized` edita SOLO el idioma activo de un valor {es, en}.
import { useState } from 'react'
import {
  ActionIcon, Button, Group, NumberInput, Paper, Stack, Switch, TagsInput, Text, TextInput, Textarea,
} from '@mantine/core'
import { Plus, X } from 'lucide-react'
import { LINES, PROTOS, blankLike, isEmpty, isLocalized, labelOf } from './shape'

const ICON = { size: 16, strokeWidth: 1.5, 'aria-hidden': true }

// Una frase por línea. El texto crudo vive en estado local (si no, Enter se "come" las líneas vacías).
// Para forzar el reinicio desde afuera (p. ej. "copiar desde ES") se cambia la `key`.
function LinesInput({ value, onChange, label, description, error }) {
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

function ListField({ name, label, description, error, value, reference, onChange }) {
  const items = Array.isArray(value) ? value : []
  const ref = Array.isArray(reference) ? reference : []
  const objects = !!PROTOS[name] || [...items, ...ref].some((x) => x && typeof x === 'object')

  if (!objects) {
    const long = LINES.has(name) || [...items, ...ref].some((s) => String(s).length > 45)
    if (long) return <LinesInput value={items} onChange={onChange} label={label} description={description} error={error} />
    return (
      <TagsInput
        label={label} description={description} error={error} value={items} onChange={onChange}
        placeholder="Escribí y apretá Enter" clearable
      />
    )
  }

  const proto = PROTOS[name] || blankLike(items[0] ?? ref[0] ?? {})
  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>{label}</Text>
      {items.map((item, i) => (
        <Paper key={i} withBorder p="xs">
          <Group gap="xs" align="flex-start" wrap="nowrap">
            <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
              {Object.keys(proto).map((k) => (
                <TextInput
                  key={k} size="xs" placeholder={labelOf(k)} aria-label={labelOf(k)} value={item?.[k] ?? ''}
                  onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)))}
                />
              ))}
            </Stack>
            <ActionIcon
              color="gray" variant="subtle" aria-label="Quitar" title="Quitar"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            ><X {...ICON} /></ActionIcon>
          </Group>
        </Paper>
      ))}
      <Button
        variant="default" size="xs" style={{ alignSelf: 'flex-start' }} leftSection={<Plus size={14} strokeWidth={1.5} aria-hidden />}
        onClick={() => onChange([...items, structuredClone(proto)])}
      >
        Agregar
      </Button>
    </Stack>
  )
}

// `reference` = valor de ES: sirve para decidir la forma cuando el valor actual está vacío.
export function Tree({ name, label, description, error, value, reference, onChange }) {
  const lbl = label ?? labelOf(name)
  const probe = !isEmpty(value) ? value : reference !== undefined && !isEmpty(reference) ? reference : value

  if (Array.isArray(probe) || PROTOS[name]) {
    return <ListField {...{ name, description, error, value, reference, onChange }} label={lbl} />
  }
  if (probe && typeof probe === 'object') {
    const base = value && typeof value === 'object' && !Array.isArray(value) ? value : blankLike(probe)
    return (
      <Stack gap="xs">
        <Text size="sm" fw={500}>{lbl}</Text>
        <Stack gap="xs" pl="sm" style={{ borderLeft: '2px solid var(--mantine-color-dark-4)' }}>
          {Object.keys(probe).map((k) => (
            <Tree
              key={k} name={k} value={base[k]} reference={reference?.[k]}
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
        label={lbl} description={description} error={error} value={value ?? 0}
        onChange={(v) => onChange(v === '' ? 0 : Number(v))}
      />
    )
  }
  if (typeof probe === 'boolean') {
    return <Switch label={lbl} checked={!!value} onChange={(e) => onChange(e.currentTarget.checked)} />
  }
  const text = typeof value === 'string' ? value : ''
  const long = text.length > 70 || text.includes('\n') || (typeof probe === 'string' && (probe.length > 70 || probe.includes('\n')))
  const Input = long ? Textarea : TextInput
  return (
    <Input
      label={lbl} description={description} error={error} value={text}
      onChange={(e) => onChange(e.target.value)}
      {...(long ? { autosize: true, minRows: 2, maxRows: 10 } : {})}
    />
  )
}

const short = (s) => (s.length > 90 ? `${s.slice(0, 90)}…` : s)

// Campo localizado: edita solo `lang`. Si EN está vacío y ES no, ofrece "Copiar desde ES".
export function Localized({ name, label, value, lang, onChange, error }) {
  const [nonce, setNonce] = useState(0)
  const v = isLocalized(value) ? value : { es: value ?? '', en: undefined }
  const canCopy = lang === 'en' && isEmpty(v.en) && !isEmpty(v.es)
  const set = (nv) => onChange({ es: v.es ?? blankLike(nv), en: v.en ?? blankLike(nv), [lang]: nv })
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
