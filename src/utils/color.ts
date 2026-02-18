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

/** Preset brand colors */
export const COLORS = {
  // WOOW / Coppel brand
  BRAND_BLUE: hexToRGBA('#0099D8'),
  BRAND_YELLOW: hexToRGBA('#F5C200'),
  DARK_BG: hexToRGBA('#0B0F1C'),
  SUCCESS_GREEN: hexToRGBA('#22C55E'),
  WHITE: hexToRGBA('#FFFFFF'),
  BLACK: hexToRGBA('#000000'),
  TRANSPARENT: hexToRGBA('#000000', 0),

  // Walmart
  WALMART_BLUE: hexToRGBA('#0071CE'),
  WALMART_YELLOW: hexToRGBA('#FFC220'),

  // Neutrals
  GRAY_100: hexToRGBA('#F5F5F5'),
  GRAY_200: hexToRGBA('#E5E7EB'),
  GRAY_400: hexToRGBA('#9CA3AF'),
  GRAY_600: hexToRGBA('#4B5563'),
  GRAY_800: hexToRGBA('#1F2937'),
  GRAY_900: hexToRGBA('#111827'),
} as const

/** Interpolate between two colors */
export function lerpColor(a: RGBA, b: RGBA, t: number): RGBA {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
    a: a.a + (b.a - a.a) * t,
  }
}
