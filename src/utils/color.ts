import type { RGBA, RGB } from '../types/slide-spec'

/** Parse hex string (#RRGGBB or #RRGGBBAA) to RGBA 0-1 */
export function hexToRGBA(hex: string, alpha = 1): RGBA {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  const a = clean.length === 8 ? parseInt(clean.slice(6, 8), 16) / 255 : alpha
  return { r, g, b, a }
}

/** Convert RGBA (0-1) to Figma RGB */
export function toFigmaRGB(color: RGBA): RGB & { a?: number } {
  return { r: color.r, g: color.g, b: color.b }
}

/** Interpolate between two colors */
export function lerpColor(a: RGBA, b: RGBA, t: number): RGBA {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
    a: a.a + (b.a - a.a) * t,
  }
}
