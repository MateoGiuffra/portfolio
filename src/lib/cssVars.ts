import type { CSSProperties } from 'react'

// Custom properties CSS en `style` (React no las tipa): vars({ '--n': 1 }).
export type CssVars = CSSProperties & { [K in `--${string}`]?: string | number }

export const vars = (v: CssVars): CSSProperties => v
