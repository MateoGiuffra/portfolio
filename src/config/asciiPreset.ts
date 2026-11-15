import type { GradientASCIIProps } from '@/components/GradientASCII'

// Props del <GradientASCII /> de la banda ascii de la home (antes literales en App.jsx).
export const asciiPreset = {
  colors: ['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8'],
  shape: 'horizon',
  characters: ' =+xX0S8#@',
  cellSize: 18,
  density: 0.8,
  glyphOpacity: 0.85,
  glow: 0.2,
  depthOfField: 0,
  flicker: 0.2,
  softness: 0.5,
  scale: 1,
  flow: 0.5,
  speed: 1,
  gradientOpacity: 0.9,
  grain: 0.08,
  variation: 0,
  mouseInteraction: false,
  intro: false,
  lightMode: false,
} satisfies GradientASCIIProps
