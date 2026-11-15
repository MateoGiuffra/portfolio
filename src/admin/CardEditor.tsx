import { ColorInput, Group, Select, SimpleGrid, Stack, Text, UnstyledButton } from '@mantine/core'
import ProjectCardArt from '@/components/ProjectCardArt'
import { CARD_VARIANTS, PALETTE, cardOf } from '@/config/cardPalette'
import type { Card, CardVariant, ProjectData } from '@/domain/types'
import { vars } from '@/lib/cssVars'

const SWATCHES = [...new Set(PALETTE.flat())]
const COLORS: readonly (readonly [key: 'bg' | 'fg' | 'accent', label: string])[] = [
  ['bg', 'Fondo'], ['fg', 'Texto'], ['accent', 'Acento'],
]

interface CardEditorProps {
  item: Partial<ProjectData>
  onChange: (card: Card) => void
}

// Look & feel de la tarjeta del proyecto: variante, colores y vista previa en vivo.
// Usa las clases globales .fcard-image--<variante> (App.css, ya cargado por la app).
export default function CardEditor({ item, onChange }: CardEditorProps) {
  const idx = Number(item.order) || 0
  const card = cardOf(item, idx)
  const set = (patch: Partial<Card>) => onChange({ ...card, ...patch })
  const photos = item.photos || []
  const variants = [
    ...CARD_VARIANTS.map((v) => ({ value: v.id, label: v.label })),
    ...(photos.length ? [{ value: 'photo', label: 'Foto (usa la primera)' }] : []),
  ]
  const preview = { title: item.title?.es || 'Proyecto', text: '', stack: item.stack || [], code: '', photos, card }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      <div style={vars({ '--card-bg': card.bg, '--card-fg': card.fg, '--card-accent': card.accent, pointerEvents: 'none' })}>
        <div className={`fcard-image fcard-image--${card.variant}`}>
          <ProjectCardArt item={preview} idx={idx} />
        </div>
      </div>
      <Stack gap="xs">
        <Select
          label="Tipo de tarjeta" data={variants} value={variants.some((v) => v.value === card.variant) ? card.variant : 'mark'}
          allowDeselect={false}
          // Select entrega string; los valores salen de `variants` (CardVariant).
          onChange={(v) => v && set({ variant: v as CardVariant })}
        />
        {COLORS.map(([k, label]) => (
          <ColorInput
            key={k} label={label} format="hex" swatches={SWATCHES} swatchesPerRow={7}
            value={card[k]} onChange={(v) => set({ [k]: v })}
          />
        ))}
        <Text size="sm" fw={500}>Paletas</Text>
        <Group gap="xs">
          {PALETTE.map(([bg, fg, accent]) => (
            <UnstyledButton
              key={bg + accent} title={`${bg} / ${accent}`} aria-label={`Paleta ${bg} ${accent}`}
              onClick={() => set({ bg, fg, accent })}
              className="bo-swatch"
              style={{ background: `linear-gradient(135deg, ${accent} 50%, ${bg} 50%)` }}
            />
          ))}
        </Group>
      </Stack>
    </SimpleGrid>
  )
}
