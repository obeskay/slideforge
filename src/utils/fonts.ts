import type { FontName } from '../types/slide-spec'

/** All fonts used in SlideForge templates — must be loaded before use */
export const REQUIRED_FONTS: FontName[] = [
  { family: 'Montserrat', style: 'Regular' },
  { family: 'Montserrat', style: 'Medium' },
  { family: 'Montserrat', style: 'SemiBold' },
  { family: 'Montserrat', style: 'Bold' },
  { family: 'Montserrat', style: 'ExtraBold' },
  { family: 'Montserrat', style: 'Black' },
  { family: 'Inter', style: 'Regular' },
  { family: 'Inter', style: 'Medium' },
  { family: 'Inter', style: 'SemiBold' },
  { family: 'Inter', style: 'Bold' },
]

/** Fallback fonts if primary not available */
export const FALLBACK_FONTS: FontName[] = [
  { family: 'Roboto', style: 'Regular' },
  { family: 'Roboto', style: 'Bold' },
]

/** Load all fonts required by the plugin */
export async function loadAllFonts(fonts: FontName[] = REQUIRED_FONTS): Promise<FontName[]> {
  const loaded: FontName[] = []
  const failed: FontName[] = []

  await Promise.allSettled(
    fonts.map(async (font) => {
      try {
        await figma.loadFontAsync(font)
        loaded.push(font)
      } catch {
        failed.push(font)
      }
    })
  )

  // Try fallbacks for failed fonts
  if (failed.length > 0) {
    await Promise.allSettled(
      FALLBACK_FONTS.map((font) => figma.loadFontAsync(font))
    )
  }

  return loaded
}

/** Get the best available font from a list */
export function resolveFontName(preferred: FontName, available: FontName[]): FontName {
  const match = available.find(
    (f) => f.family === preferred.family && f.style === preferred.style
  )
  return match ?? (available[0] ?? { family: 'Inter', style: 'Regular' })
}
