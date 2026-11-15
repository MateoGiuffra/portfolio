import { Button, Group, SegmentedControl } from '@mantine/core'
import type { Lang } from '@/domain/types'

interface LangSwitchProps {
  lang: Lang
  onChange: (lang: Lang) => void
  missing: Record<Lang, number>
  onCopyAll: () => void
}

const isLang = (v: string): v is Lang => v === 'es' || v === 'en'

// Selector del idioma que se está editando. Un punto con número marca los campos que faltan traducir en ese idioma.
export default function LangSwitch({ lang, onChange, missing, onCopyAll }: LangSwitchProps) {
  const opt = (l: Lang) => ({
    value: l,
    label: (
      <span className="bo-lang">
        <span>{l.toUpperCase()}</span>
        {missing[l] > 0 && <span className="bo-lang-miss" title={`Faltan ${missing[l]} campo(s)`}>{missing[l]}</span>}
      </span>
    ),
  })
  return (
    <Group justify="space-between" gap="xs">
      <SegmentedControl
        value={lang} onChange={(v) => { if (isLang(v)) onChange(v) }}
        data={[opt('es'), opt('en')]} aria-label="Idioma que se edita"
      />
      {lang === 'en' && missing.en > 0 && (
        <Button size="xs" variant="default" onClick={onCopyAll}>Copiar todo desde ES</Button>
      )}
    </Group>
  )
}
