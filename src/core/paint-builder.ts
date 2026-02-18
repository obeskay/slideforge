/// <reference types="@figma/plugin-typings" />
/**
 * Converts SlideForge Paint specs to Figma Paint objects
 */
import type { Paint, SolidPaint, GradientPaint } from '../types/slide-spec'

export function buildPaint(spec: Paint): Paint {
  return spec // Figma Paint types are compatible with our spec
}

export function buildPaints(specs: Paint[]): Paint[] {
  return specs.map(buildPaint)
}

/** Apply fills array to any Figma node that has fills */
export function applyFills(node: GeometryMixin, fills: Paint[]): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node.fills = fills as unknown as any
}

/** Apply strokes to a geometry node */
export function applyStrokes(
  node: GeometryMixin & MinimalStrokesMixin,
  specs: import('../types/slide-spec').StrokeSpec[]
): void {
  if (specs.length === 0) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node.strokes = specs.map((s) => s.paint) as unknown as any
  node.strokeWeight = specs[0]?.weight ?? 1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node.strokeAlign = (specs[0]?.align ?? 'INSIDE') as any
}

/** Apply effects to a node */
export function applyEffects(
  node: BlendMixin,
  effects: import('../types/slide-spec').Effect[]
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node.effects = effects as unknown as any
}

/** Apply blend mode and opacity */
export function applyBlend(
  node: BlendMixin,
  blendMode?: import('../types/slide-spec').BlendMode,
  opacity?: number
): void {
  if (blendMode) node.blendMode = blendMode as BlendMode
  if (opacity !== undefined) node.opacity = opacity
}

/** Build a solid fill from RGBA */
export function solidFill(
  color: import('../types/slide-spec').RGBA
): SolidPaint {
  return { type: 'SOLID', color }
}

/** Build a linear gradient */
export function linearGradient(
  stops: Array<{ position: number; color: import('../types/slide-spec').RGBA }>,
  angle = 135
): GradientPaint {
  const rad = (angle * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return {
    type: 'GRADIENT_LINEAR',
    gradientStops: stops,
    gradientTransform: [
      [cos, sin, 0.5 - 0.5 * cos - 0.5 * sin],
      [-sin, cos, 0.5 + 0.5 * sin - 0.5 * cos],
    ],
  }
}
