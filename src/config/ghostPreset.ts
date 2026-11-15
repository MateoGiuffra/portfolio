import type { GhostCursorProps } from '@/components/GhostCursor'

// Props del <GhostCursor /> de la home (antes literales en App.jsx).
export const ghostPreset = {
  color: '#B497CF',
  size: 41,
  trailLength: 15,
  inertia: 0.32,
  turbulence: 1.15,
  drift: -0.6,
  bloomStrength: 0.35,
  grainIntensity: 0.09,
  detail: 0.35,
  brightness: 0.25,
  bloomRadius: 0.15,
  edgeIntensity: 0,
  fadeDelayMs: 500,
  fadeDurationMs: 400,
  clickPuff: true,
  intro: true,
} satisfies GhostCursorProps
