import { Badge, Button, Group, SegmentedControl } from '@mantine/core'

// Selector del idioma que se está editando. El badge amarillo cuenta los campos que faltan traducir en ese idioma.
export default function LangSwitch({ lang, onChange, missing, onCopyAll }) {
  const opt = (l) => ({
    value: l,
    label: (
      <Group gap={6} justify="center" wrap="nowrap">
        <span>{l.toUpperCase()}</span>
        {missing[l] > 0 && <Badge size="xs" circle color="yellow" title={`Faltan ${missing[l]} campo(s)`}>{missing[l]}</Badge>}
      </Group>
    ),
  })
  return (
    <Group justify="space-between" gap="xs">
      <SegmentedControl value={lang} onChange={onChange} data={[opt('es'), opt('en')]} aria-label="Idioma que se edita" />
      {lang === 'en' && missing.en > 0 && (
        <Button size="xs" variant="light" onClick={onCopyAll}>Copiar todo desde ES</Button>
      )}
    </Group>
  )
}
