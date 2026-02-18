/// <reference types="@figma/plugin-typings" />
/**
 * SlideForge Transition Engine
 * Wires SmartAnimate and all Figma transition types via setReactionsAsync
 */
import type {
  SlideTransition, EasingSpec, TransitionType, TransitionDirection
} from '../types/slide-spec'

// ─── Easing Builders ─────────────────────────────────────────────────────────

function buildEasing(spec?: EasingSpec): Easing {
  if (!spec) return { type: 'EASE_IN_AND_OUT' }

  switch (spec.type) {
    case 'LINEAR':
      return { type: 'LINEAR' }
    case 'EASE_IN':
      return { type: 'EASE_IN' }
    case 'EASE_OUT':
      return { type: 'EASE_OUT' }
    case 'EASE_IN_AND_OUT':
      return { type: 'EASE_IN_AND_OUT' }
    case 'EASE_IN_BACK':
      return { type: 'EASE_IN_BACK' }
    case 'EASE_OUT_BACK':
      return { type: 'EASE_OUT_BACK' }
    case 'EASE_IN_AND_OUT_BACK':
      return { type: 'EASE_IN_AND_OUT_BACK' }
    case 'SPRING':
    case 'CUSTOM_SPRING':
      return {
        type: 'CUSTOM_SPRING',
        easingFunctionSpring: {
          mass: spec.spring?.mass ?? 1,
          stiffness: spec.spring?.stiffness ?? 100,
          damping: spec.spring?.damping ?? 10,
          initialVelocity: 0,
        },
      }
    case 'CUSTOM_BEZIER':
      return {
        type: 'CUSTOM_CUBIC_BEZIER',
        easingFunctionCubicBezier: {
          x1: spec.bezier?.x1 ?? 0.4,
          y1: spec.bezier?.y1 ?? 0,
          x2: spec.bezier?.x2 ?? 0.2,
          y2: spec.bezier?.y2 ?? 1,
        },
      }
    default:
      return { type: 'EASE_IN_AND_OUT' }
  }
}

// ─── Transition Builders ──────────────────────────────────────────────────────

function buildTransition(
  type: TransitionType,
  easing: EasingSpec | undefined,
  duration: number,
  direction?: TransitionDirection
): Transition | null {
  const easingObj = buildEasing(easing)
  const dur = duration

  switch (type) {
    case 'SMART_ANIMATE':
      return { type: 'SMART_ANIMATE', easing: easingObj, duration: dur }

    case 'DISSOLVE':
      return { type: 'DISSOLVE', easing: easingObj, duration: dur }

    case 'SLIDE_IN':
      return {
        type: 'SLIDE_IN',
        easing: easingObj,
        duration: dur,
        direction: direction ?? 'LEFT',
        matchLayers: false,
      }

    case 'SLIDE_OUT':
      return {
        type: 'SLIDE_OUT',
        easing: easingObj,
        duration: dur,
        direction: direction ?? 'LEFT',
        matchLayers: false,
      }

    case 'PUSH':
      return {
        type: 'PUSH',
        easing: easingObj,
        duration: dur,
        direction: direction ?? 'LEFT',
        matchLayers: false,
      }

    case 'MOVE_IN':
      return {
        type: 'MOVE_IN',
        easing: easingObj,
        duration: dur,
        direction: direction ?? 'LEFT',
        matchLayers: false,
      }

    case 'MOVE_OUT':
      return {
        type: 'MOVE_OUT',
        easing: easingObj,
        duration: dur,
        direction: direction ?? 'LEFT',
        matchLayers: false,
      }

    case 'SCROLL_ANIMATE':
      return { type: 'SCROLL_ANIMATE', easing: easingObj, duration: dur }

    default:
      return { type: 'SMART_ANIMATE', easing: easingObj, duration: dur }
  }
}

// ─── Main API ─────────────────────────────────────────────────────────────────

/**
 * Apply a set of transitions to a map of slide id → FrameNode
 */
export async function applyTransitions(
  transitions: SlideTransition[],
  frameMap: Map<string, FrameNode>
): Promise<number> {
  let count = 0

  for (const spec of transitions) {
    const fromFrame = frameMap.get(spec.from)
    const toFrame = frameMap.get(spec.to)

    if (!fromFrame || !toFrame) {
      console.warn(`[SlideForge] Transition skipped: frames not found (${spec.from} → ${spec.to})`)
      continue
    }

    const duration = spec.duration ?? 0.3
    const transition = buildTransition(spec.type, spec.easing, duration, spec.direction)
    if (!transition) continue

    const reaction: Reaction = {
      trigger: { type: 'ON_CLICK' },
      actions: [{
        type: 'NODE',
        destinationId: toFrame.id,
        navigation: 'NAVIGATE',
        transition,
        preserveScrollPosition: false,
      }],
    }

    try {
      const existing = fromFrame.reactions ?? []
      await fromFrame.setReactionsAsync([...existing, reaction])
      count++
    } catch (err) {
      console.error(`[SlideForge] Failed to set reaction on "${fromFrame.name}":`, err)
    }
  }

  return count
}

/**
 * Build a sequential auto-chain: each slide navigates to the next
 */
export async function applySequentialTransitions(
  frames: FrameNode[],
  defaultSpec: Partial<SlideTransition> = {}
): Promise<number> {
  const transitions: SlideTransition[] = []
  const frameMap = new Map<string, FrameNode>()

  for (let i = 0; i < frames.length - 1; i++) {
    const from = frames[i]!
    const to = frames[i + 1]!
    frameMap.set(from.id, from)
    frameMap.set(to.id, to)

    transitions.push({
      from: from.id,
      to: to.id,
      type: defaultSpec.type ?? 'SMART_ANIMATE',
      easing: defaultSpec.easing,
      duration: defaultSpec.duration ?? 0.3,
      direction: defaultSpec.direction,
    })
  }

  return applyTransitions(transitions, frameMap)
}

/**
 * Pre-built easing presets for motion graphics
 */
export const EASING_PRESETS = {
  /** Cinematic — slow in, fast out */
  CINEMATIC: { type: 'CUSTOM_BEZIER', bezier: { x1: 0.76, y1: 0, x2: 0.24, y2: 1 } } as EasingSpec,
  /** Spring bounce */
  SPRING_BOUNCE: { type: 'CUSTOM_SPRING', spring: { mass: 1, stiffness: 180, damping: 12 } } as EasingSpec,
  /** Quick snap */
  SNAP: { type: 'CUSTOM_BEZIER', bezier: { x1: 0.2, y1: 0, x2: 0, y2: 1 } } as EasingSpec,
  /** Smooth decelerate */
  DECELERATE: { type: 'EASE_OUT' } as EasingSpec,
  /** Smooth accelerate */
  ACCELERATE: { type: 'EASE_IN' } as EasingSpec,
  /** Standard material */
  STANDARD: { type: 'EASE_IN_AND_OUT' } as EasingSpec,
  /** Overshoot back */
  OVERSHOOT: { type: 'EASE_OUT_BACK' } as EasingSpec,
} as const
