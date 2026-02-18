/// <reference types="@figma/plugin-typings" />
/**
 * SlideForge Slide Generator
 * Orchestrates DeckSpec → Figma frames with chunked processing for large decks
 */
import type { DeckSpec, SlideSpec } from '../types/slide-spec'
import { buildNode, setTokens } from './node-builder'
import { applyTransitions, applySequentialTransitions, EASING_PRESETS } from './transitions'
import { loadAllFonts } from '../utils/fonts'

// ─── Constants ────────────────────────────────────────────────────────────────

/** Default slide dimensions: 1920×1080 (16:9) */
const DEFAULT_WIDTH = 1920
const DEFAULT_HEIGHT = 1080

/** Chunk size for large decks — prevents memory saturation */
const SLIDE_CHUNK_SIZE = 5

/** Material Expressive 2026 default duration in seconds */
const DEFAULT_DURATION = 0.45

// ─── Progress Reporter ─────────────────────────────────────────────────────────

export interface GenerationProgress {
  stage: 'fonts' | 'slides' | 'transitions' | 'done'
  current: number
  total: number
  message: string
}

export type ProgressCallback = (progress: GenerationProgress) => void

// ─── Slide Builder ─────────────────────────────────────────────────────────────

async function buildSlide(
  spec: SlideSpec,
  parent: PageNode | FrameNode,
  slideWidth: number,
  slideHeight: number
): Promise<FrameNode> {
  const frame = figma.createFrame()
  parent.appendChild(frame)

  frame.name = spec.name
  frame.resize(spec.width ?? slideWidth, spec.height ?? slideHeight)
  frame.clipsContent = true
  frame.layoutMode = 'NONE'

  // Apply background
  if (spec.background) {
    frame.fills = [spec.background] as readonly Paint[]
  } else {
    // Default: dark navy
    frame.fills = [{ type: 'SOLID', color: { r: 0.043, g: 0.059, b: 0.110 } }]
  }

  // Build child nodes
  if (spec.children) {
    for (const child of spec.children) {
      await buildNode(child, frame)
    }
  }

  return frame
}

// ─── Chunk Processor ──────────────────────────────────────────────────────────

async function processChunk(
  slides: SlideSpec[],
  page: PageNode,
  slideWidth: number,
  slideHeight: number,
  startIndex: number,
  onProgress?: ProgressCallback,
  totalSlides?: number
): Promise<Map<string, FrameNode>> {
  const frameMap = new Map<string, FrameNode>()

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]!
    const globalIndex = startIndex + i

    const frame = await buildSlide(slide, page, slideWidth, slideHeight)

    // Position slides horizontally with gap
    frame.x = globalIndex * (slideWidth + 100)
    frame.y = 0

    frameMap.set(slide.id, frame)

    onProgress?.({
      stage: 'slides',
      current: globalIndex + 1,
      total: totalSlides ?? slides.length,
      message: `Building slide ${globalIndex + 1}/${totalSlides ?? slides.length}: ${slide.name}`,
    })
  }

  return frameMap
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export interface GenerationResult {
  frames: FrameNode[]
  frameMap: Map<string, FrameNode>
  transitionCount: number
  slideCount: number
  duration: number
}

export async function generateDeck(
  spec: DeckSpec,
  onProgress?: ProgressCallback
): Promise<GenerationResult> {
  const startTime = Date.now()

  // 1. Set design tokens
  if (spec.tokens) {
    setTokens(spec.tokens)
  }

  // 2. Load fonts
  onProgress?.({ stage: 'fonts', current: 0, total: 1, message: 'Loading fonts…' })
  await loadAllFonts()
  onProgress?.({ stage: 'fonts', current: 1, total: 1, message: 'Fonts loaded' })

  // 3. Get or create page
  const page = figma.currentPage
  const slideWidth = spec.defaultSlideSize?.width ?? DEFAULT_WIDTH
  const slideHeight = spec.defaultSlideSize?.height ?? DEFAULT_HEIGHT

  // 4. Process slides in chunks
  const slides = spec.slides
  const totalSlides = slides.length
  const allFrameMap = new Map<string, FrameNode>()
  const allFrames: FrameNode[] = []

  const chunkCount = Math.ceil(totalSlides / SLIDE_CHUNK_SIZE)

  for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
    const start = chunkIndex * SLIDE_CHUNK_SIZE
    const end = Math.min(start + SLIDE_CHUNK_SIZE, totalSlides)
    const chunk = slides.slice(start, end)

    figma.notify(
      `SlideForge: chunk ${chunkIndex + 1}/${chunkCount} (slides ${start + 1}–${end})`,
      { timeout: 1500 }
    )

    const chunkMap = await processChunk(
      chunk, page, slideWidth, slideHeight,
      start, onProgress, totalSlides
    )

    for (const [id, frame] of chunkMap) {
      allFrameMap.set(id, frame)
      allFrames.push(frame)
    }
  }

  // 5. Apply transitions
  let transitionCount = 0

  onProgress?.({
    stage: 'transitions',
    current: 0,
    total: 1,
    message: 'Wiring transitions…',
  })

  if (spec.transitions && spec.transitions.length > 0) {
    transitionCount = await applyTransitions(spec.transitions, allFrameMap)
  } else {
    // Auto-chain with Material Expressive defaults (ease-in-out 450ms)
    transitionCount = await applySequentialTransitions(allFrames, {
      type: 'SMART_ANIMATE',
      easing: EASING_PRESETS.STANDARD,
      duration: DEFAULT_DURATION,
    })
  }

  onProgress?.({
    stage: 'done',
    current: totalSlides,
    total: totalSlides,
    message: `Done! ${totalSlides} slides, ${transitionCount} transitions`,
  })

  const duration = (Date.now() - startTime) / 1000

  figma.notify(
    `✓ SlideForge: ${totalSlides} slides generated in ${duration.toFixed(1)}s`,
    { timeout: 4000 }
  )

  return {
    frames: allFrames,
    frameMap: allFrameMap,
    transitionCount,
    slideCount: totalSlides,
    duration,
  }
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

/**
 * Remove all SlideForge frames from the current page
 */
export function clearSlides(prefix = 'Slide'): number {
  const page = figma.currentPage
  const toRemove = page.children.filter(
    (n) => n.type === 'FRAME' && n.name.startsWith(prefix)
  )
  toRemove.forEach((n) => n.remove())
  return toRemove.length
}

/**
 * Estimate generation time for a deck (ms)
 */
export function estimateTime(slideCount: number, avgLayersPerSlide = 15): number {
  // ~50ms per layer, 200ms per transition wiring
  return slideCount * avgLayersPerSlide * 50 + slideCount * 200
}
