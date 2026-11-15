import { createTheme } from '@mantine/core'
import type { MantineColorsTuple } from '@mantine/core'

// Rampa neutra (grafito) para superficies y texto. En el esquema oscuro de Mantine:
// 0-3 texto, 4-5 líneas finas, 6 superficie elevada, 7 fondo de página, 8-9 lo más profundo.
const dark: MantineColorsTuple = [
  '#ededed', '#c9c9cd', '#a1a1a6', '#85858b', '#2a2a2d',
  '#38383c', '#1b1b1d', '#141415', '#0f0f10', '#0a0a0b',
]

// Acento: el ámbar de la web. Se usa solo en la acción principal, la selección y el foco.
const amber: MantineColorsTuple = [
  '#fff8e1', '#ffecb3', '#ffe082', '#ffd24d', '#ffc61a',
  '#ffb400', '#ffb400', '#cc9000', '#a87600', '#7a5600',
]

// Semánticos apagados para que convivan con el grafito.
const positive: MantineColorsTuple = [
  '#e9f8f0', '#c9efdc', '#a3e3c4', '#7cd7ab', '#5ccb98',
  '#4cc38a', '#3aa874', '#2f8a5f', '#246c4a', '#1a4f36',
]
const negative: MantineColorsTuple = [
  '#fdecec', '#f9d0d1', '#f4a9ab', '#ee8286', '#e9686c',
  '#e5484d', '#cf3a3f', '#b02f33', '#8b2528', '#661b1d',
]

const MONO = "ui-monospace, 'Cascadia Mono', 'SF Mono', Consolas, monospace"

export const theme = createTheme({
  primaryColor: 'amber',
  primaryShade: { light: 6, dark: 5 },
  autoContrast: true,
  luminanceThreshold: 0.4,
  colors: { dark, amber, positive, negative },
  fontFamily: "Archivo, system-ui, -apple-system, 'Segoe UI', sans-serif",
  fontFamilyMonospace: MONO,
  headings: { fontFamily: "Archivo, system-ui, sans-serif", fontWeight: '500' },
  defaultRadius: 'md',
  // Todo en la grilla de 4px (los valores por defecto de Mantine usan 10 y 20).
  spacing: { xs: '8px', sm: '12px', md: '16px', lg: '24px', xl: '32px' },
  radius: { xs: '4px', sm: '6px', md: '8px', lg: '12px', xl: '16px' },
  fontSizes: { xs: '12px', sm: '14px', md: '14px', lg: '16px', xl: '18px' },
  other: { mono: MONO },
})
