import { clamp } from '@/lib/math'

// Color CSS (#hex o rgb()) -> canales RGB 0..1. Respaldo: violeta del cursor.
export const parseColor = (value: string | undefined): number[] => {
  const text = String(value || '').trim()
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text)
  if (hex) {
    const full = hex[1].length === 3 ? hex[1].replace(/./g, (digit) => digit + digit) : hex[1]
    return [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16) / 255)
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text)
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map((channel) => clamp(parseFloat(channel) / 255, 0, 1))
  return [0.706, 0.592, 0.812]
}

const toLinear = (value: number): number => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)

// sRGB 0..1 -> OKLab.
export const toLab = ([r, g, b]: number[]): [number, number, number] => {
  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}
