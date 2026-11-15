// ============================================================
//  CONFIG DEL CURSOR  ·  tocá solo este archivo
// ============================================================
//
//  mode:
//    'figma'  → cursor estilo Figma (herramientas): flecha, dedo, mano, texto, etc.
//    'ghost'  → estela violeta WebGL + círculo "VER" sobre proyectos (el anterior)
//    'system' → el cursor normal del sistema, sin nada extra
//
//  figma.style:   'classic' | 'blue' | 'blueprint' | 'outline'
//  figma.showTag: true → muestra una etiqueta con el nombre de la herramienta
//  figma.smoothing: 0.1 (muy suave/lento) … 1 (pegado al mouse)
//
//  figma.rules: qué herramienta usa cada selector CSS. Se evalúan en orden:
//    gana la primera regla cuyo selector coincide con el elemento bajo el mouse.
//    Para sumar un caso nuevo, agregá una línea ['herramienta', 'selector'].
//    Herramientas disponibles: arrow, point, hand, grab, text, comment, zoom,
//                              resize, cross, pen, move
//    ('hand' se convierte solo en 'grab' mientras mantenés el click).
//
//  figma.hotkeys: true → teclas V H T C Z R X P M fijan una herramienta, Esc la suelta.
// ============================================================

export type CursorMode = 'figma' | 'ghost' | 'system'

export type FigmaStyleName = 'classic' | 'blue' | 'blueprint' | 'outline'

export type FigmaToolName =
  | 'arrow'
  | 'point'
  | 'hand'
  | 'grab'
  | 'text'
  | 'comment'
  | 'zoom'
  | 'resize'
  | 'cross'
  | 'pen'
  | 'move'

export type FigmaRule = readonly [tool: FigmaToolName, selector: string]

export interface FigmaCursorConfig {
  style: FigmaStyleName
  showTag: boolean
  smoothing: number
  hotkeys: boolean
  rules: readonly FigmaRule[]
  labels: Record<FigmaToolName, string>
}

export interface CursorConfig {
  mode: CursorMode
  figma: FigmaCursorConfig
}

const mode: CursorMode = 'figma'

export const cursorConfig = {
  mode,

  figma: {
    style: 'classic',
    showTag: false,
    smoothing: 0.55,
    hotkeys: false,

    rules: [
      ['hand', '.scroll-indicator'],
      ['point', '[data-cursor], .fcard-image, a, button, label, summary, select, [role="button"], .skill-row'],
      ['text', 'input, textarea, p, h1, h2, h3, h4, blockquote'],
    ],

    // Texto de la etiqueta (solo si showTag: true).
    labels: {
      arrow: 'Mateo',
      point: 'Abrir',
      hand: 'Arrastrar',
      grab: 'Arrastrando',
      text: 'Texto',
      comment: 'Comentar',
      zoom: 'Zoom',
      resize: 'Redimensionar',
      cross: 'Mira',
      pen: 'Pluma',
      move: 'Mover',
    },
  },
} satisfies CursorConfig
