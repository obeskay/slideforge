/// <reference types="@figma/plugin-typings" />
/**
 * SlideForge — Figma Plugin Entry Point
 * Runs in Figma sandbox. Communicates with UI via postMessage.
 */
import type { PluginMessage, UIMessage } from '../types/slide-spec'
import { generateDeck, clearSlides } from '../core/slide-generator'
import type { GenerationProgress } from '../core/slide-generator'

// ─── UI Setup ────────────────────────────────────────────────────────────────

figma.showUI(__html__, {
  width: 420,
  height: 580,
  title: 'SlideForge',
  themeColors: true,
})

// ─── Message Handler ─────────────────────────────────────────────────────────

let isGenerating = false

figma.ui.onmessage = async (msg: UIMessage) => {
  switch (msg.type) {
    case 'PING': {
      figma.ui.postMessage({ type: 'PONG', version: '1.0.0' } satisfies PluginMessage)
      break
    }

    case 'GENERATE': {
      if (isGenerating) {
        figma.notify('Already generating — please wait', { error: true })
        return
      }

      if (!msg.deck) {
        figma.notify('No deck spec provided', { error: true })
        figma.ui.postMessage({ type: 'ERROR', message: 'No deck spec provided' } satisfies PluginMessage)
        return
      }

      isGenerating = true
      figma.ui.postMessage({ type: 'GENERATION_START' } satisfies PluginMessage)

      try {
        const result = await generateDeck(msg.deck, (progress: GenerationProgress) => {
          figma.ui.postMessage({
            type: 'PROGRESS',
            stage: progress.stage,
            current: progress.current,
            total: progress.total,
            message: progress.message,
          } satisfies PluginMessage)
        })

        figma.ui.postMessage({
          type: 'GENERATION_COMPLETE',
          slideCount: result.slideCount,
          transitionCount: result.transitionCount,
          duration: result.duration,
        } satisfies PluginMessage)

        // Select all generated frames
        figma.currentPage.selection = result.frames
        figma.viewport.scrollAndZoomIntoView(result.frames)

      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('[SlideForge]', err)
        figma.notify(`Error: ${message}`, { error: true })
        figma.ui.postMessage({ type: 'ERROR', message } satisfies PluginMessage)
      } finally {
        isGenerating = false
      }
      break
    }

    case 'CLEAR': {
      const count = clearSlides()
      figma.notify(`Cleared ${count} slide frames`)
      figma.ui.postMessage({ type: 'CLEARED', count } satisfies PluginMessage)
      break
    }

    case 'CANCEL': {
      // Note: Figma plugin API doesn't support true cancellation mid-generation
      // This is a best-effort state reset
      isGenerating = false
      figma.ui.postMessage({ type: 'CANCELLED' } satisfies PluginMessage)
      break
    }

    default:
      console.warn('[SlideForge] Unknown message type:', (msg as { type: string }).type)
  }
}

// ─── Plugin Close ─────────────────────────────────────────────────────────────

figma.on('close', () => {
  console.log('[SlideForge] Plugin closed')
})
