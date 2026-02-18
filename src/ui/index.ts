/**
 * SlideForge UI Logic — runs in browser iframe inside Figma
 */
import type { PluginMessage, UIMessage } from '../types/slide-spec'

// ─── Templates ────────────────────────────────────────────────────────────────

interface TemplatePreset {
  id: string
  name: string
  desc: string
  icon: string
  spec: object
}

// SVG icons for templates (no emojis)
const ICONS = {
  heroDark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 0 0 0 20z"/></svg>',
  stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>',
  split: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>',
  cta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
}

// SVG icons for status banners
const STATUS_ICONS = {
  success: '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5 6.5-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  error: '<svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
}

const TEMPLATES: TemplatePreset[] = [
  {
    id: 'hero-dark',
    name: 'Hero Dark',
    desc: 'Bold title + subtitle',
    icon: ICONS.heroDark,
    spec: {
      name: 'Hero Dark',
      slides: [{
        id: 'slide-1', name: 'Hero',
        background: { type: 'SOLID', color: { r: 0.043, g: 0.059, b: 0.110, a: 1 } },
        children: [
          { type: 'TEXT', name: 'title', x: 120, y: 300, width: 1680, height: 120,
            content: 'Your Title Here',
            style: { fontName: { family: 'Montserrat', style: 'Bold' }, fontSize: 96,
              fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }], textAlignHorizontal: 'CENTER' } },
          { type: 'TEXT', name: 'subtitle', x: 120, y: 440, width: 1680, height: 60,
            content: 'Subtitle goes here',
            style: { fontName: { family: 'Inter', style: 'Regular' }, fontSize: 36,
              fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 0.6 } }], textAlignHorizontal: 'CENTER' } },
        ],
      }],
    },
  },
  {
    id: 'stats',
    name: 'Stats',
    desc: '3-column metrics',
    icon: ICONS.stats,
    spec: {
      name: 'Stats Slide',
      slides: [{
        id: 'slide-1', name: 'Stats',
        background: { type: 'SOLID', color: { r: 0.043, g: 0.059, b: 0.110, a: 1 } },
        children: [
          { type: 'TEXT', name: 'stat-1', x: 160, y: 380, width: 480, height: 160,
            content: '87%', style: { fontName: { family: 'Montserrat', style: 'Bold' }, fontSize: 120,
              fills: [{ type: 'SOLID', color: { r: 0, g: 0.6, b: 0.847, a: 1 } }], textAlignHorizontal: 'CENTER' } },
          { type: 'TEXT', name: 'stat-2', x: 720, y: 380, width: 480, height: 160,
            content: '2.4M', style: { fontName: { family: 'Montserrat', style: 'Bold' }, fontSize: 120,
              fills: [{ type: 'SOLID', color: { r: 0.961, g: 0.757, b: 0, a: 1 } }], textAlignHorizontal: 'CENTER' } },
          { type: 'TEXT', name: 'stat-3', x: 1280, y: 380, width: 480, height: 160,
            content: '3×', style: { fontName: { family: 'Montserrat', style: 'Bold' }, fontSize: 120,
              fills: [{ type: 'SOLID', color: { r: 0.133, g: 0.773, b: 0.369, a: 1 } }], textAlignHorizontal: 'CENTER' } },
        ],
      }],
    },
  },
  {
    id: 'split',
    name: 'Split',
    desc: 'Left text, right visual',
    icon: ICONS.split,
    spec: {
      name: 'Split Layout',
      slides: [{
        id: 'slide-1', name: 'Split',
        background: { type: 'SOLID', color: { r: 0.043, g: 0.059, b: 0.110, a: 1 } },
        children: [
          { type: 'RECTANGLE', name: 'divider', x: 840, y: 0, width: 2, height: 1080,
            fills: [{ type: 'SOLID', color: { r: 0, g: 0.6, b: 0.847, a: 0.4 } }] },
          { type: 'TEXT', name: 'left-title', x: 80, y: 380, width: 680, height: 120,
            content: 'Left Panel', style: { fontName: { family: 'Montserrat', style: 'Bold' }, fontSize: 72,
              fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }] } },
          { type: 'TEXT', name: 'right-content', x: 960, y: 420, width: 880, height: 240,
            content: 'Right panel content', style: { fontName: { family: 'Inter', style: 'Regular' }, fontSize: 28,
              fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 0.7 } }] } },
        ],
      }],
    },
  },
  {
    id: 'cta',
    name: 'CTA',
    desc: 'Call-to-action closer',
    icon: ICONS.cta,
    spec: {
      name: 'CTA Slide',
      slides: [{
        id: 'slide-1', name: 'CTA',
        background: {
          type: 'GRADIENT_LINEAR',
          gradientStops: [
            { position: 0, color: { r: 0, g: 0.6, b: 0.847, a: 1 } },
            { position: 1, color: { r: 0.043, g: 0.059, b: 0.110, a: 1 } },
          ],
          gradientTransform: [[1, 0, 0], [0, 1, 0]],
        },
        children: [
          { type: 'TEXT', name: 'cta-headline', x: 160, y: 380, width: 1600, height: 160,
            content: 'Ready to get started?',
            style: { fontName: { family: 'Montserrat', style: 'ExtraBold' }, fontSize: 96,
              fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }], textAlignHorizontal: 'CENTER' } },
        ],
      }],
    },
  },
]

// ─── State ────────────────────────────────────────────────────────────────────

let isGenerating = false

// ─── DOM ─────────────────────────────────────────────────────────────────────

const jsonInput = document.getElementById('json-input') as HTMLTextAreaElement
const durationInput = document.getElementById('duration') as HTMLInputElement
const transitionSelect = document.getElementById('transition-type') as HTMLSelectElement
const btnGenerate = document.getElementById('btn-generate') as HTMLButtonElement
const btnGenerateLabel = document.getElementById('btn-generate-label') as HTMLElement
const btnClear = document.getElementById('btn-clear') as HTMLButtonElement
const progressSection = document.getElementById('progress-section') as HTMLElement
const progressLabel = document.getElementById('progress-label') as HTMLElement
const progressCount = document.getElementById('progress-count') as HTMLElement
const progressBar = document.getElementById('progress-bar') as HTMLElement
const progressMessage = document.getElementById('progress-message') as HTMLElement
const statusBanner = document.getElementById('status-banner') as HTMLElement
const statusIcon = document.getElementById('status-icon') as HTMLElement
const statusText = document.getElementById('status-text') as HTMLElement
const templateGrid = document.getElementById('template-grid') as HTMLElement

// ─── Tabs ─────────────────────────────────────────────────────────────────────

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = (tab as HTMLElement).dataset.tab!
    document.querySelectorAll('.tab').forEach((t) => {
      t.classList.remove('active')
      t.setAttribute('aria-selected', 'false')
    })
    document.querySelectorAll('.tab-panel').forEach((p) => {
      p.classList.remove('active')
      p.setAttribute('hidden', '')
    })
    tab.classList.add('active')
    tab.setAttribute('aria-selected', 'true')
    const panel = document.getElementById(`tab-${target}`)!
    panel.classList.add('active')
    panel.removeAttribute('hidden')
  })
})

// ─── Templates ────────────────────────────────────────────────────────────────

function renderTemplates(): void {
  templateGrid.innerHTML = TEMPLATES.map((t, i) => `
    <div class="template-card" data-id="${t.id}" role="radio" aria-checked="false" tabindex="${i === 0 ? 0 : -1}">
      <div class="template-thumb" aria-hidden="true">${t.icon}</div>
      <div class="template-name">${t.name}</div>
      <div class="template-desc">${t.desc}</div>
    </div>
  `).join('')

  templateGrid.querySelectorAll('.template-card').forEach((card) => {
    card.addEventListener('click', () => {
      templateGrid.querySelectorAll('.template-card').forEach((c) => {
        c.classList.remove('selected')
        c.setAttribute('aria-checked', 'false')
      })
      card.classList.add('selected')
      card.setAttribute('aria-checked', 'true')
      const id = (card as HTMLElement).dataset.id!
      const template = TEMPLATES.find((t) => t.id === id)
      if (template) {
        jsonInput.value = JSON.stringify(template.spec, null, 2)
        document.querySelector('[data-tab="json"]')!.dispatchEvent(new Event('click'))
      }
    })
  })
}

renderTemplates()

// ─── Progress ────────────────────────────────────────────────────────────────

function showProgress(label: string, current: number, total: number, message: string): void {
  progressSection.classList.add('visible')
  progressLabel.textContent = label
  progressCount.textContent = total > 0 ? `${current} / ${total}` : ''
  progressBar.style.width = total > 0 ? `${Math.round((current / total) * 100)}%` : '0%'
  progressMessage.textContent = message
}

function hideProgress(): void {
  progressSection.classList.remove('visible')
}

function showStatus(type: 'success' | 'error', text: string): void {
  statusBanner.className = `status-banner ${type}`
  statusIcon.innerHTML = type === 'success' ? STATUS_ICONS.success : STATUS_ICONS.error
  statusText.textContent = text
  setTimeout(() => { statusBanner.className = 'status-banner' }, 6000)
}

function setGenerating(generating: boolean): void {
  isGenerating = generating
  btnGenerate.disabled = generating
  btnGenerateLabel.innerHTML = generating
    ? '<span class="spinner"></span> Generating…'
    : 'Generate Slides'
}

// ─── Actions ─────────────────────────────────────────────────────────────────

btnGenerate.addEventListener('click', () => {
  if (isGenerating) return
  const raw = jsonInput.value.trim()
  if (!raw) { showStatus('error', 'Paste a DeckSpec JSON or pick a template'); return }
  let deck: object
  try { deck = JSON.parse(raw) } catch { showStatus('error', 'Invalid JSON'); return }

  const duration = parseInt(durationInput.value, 10) / 1000
  const type = transitionSelect.value
  const deckWithDefaults = { ...deck, _uiOverrides: { duration, transitionType: type } }

  setGenerating(true)
  statusBanner.className = 'status-banner'
  parent.postMessage({ pluginMessage: { type: 'GENERATE', deck: deckWithDefaults } as UIMessage }, '*')
})

btnClear.addEventListener('click', () => {
  if (isGenerating) return
  parent.postMessage({ pluginMessage: { type: 'CLEAR' } as UIMessage }, '*')
})

// ─── Messages ────────────────────────────────────────────────────────────────

window.onmessage = (event: MessageEvent) => {
  const msg = event.data.pluginMessage as PluginMessage
  if (!msg) return
  switch (msg.type) {
    case 'PONG': console.log('[SlideForge UI] Connected v', msg.version); break
    case 'GENERATION_START': showProgress('Initializing…', 0, 0, 'Loading fonts and tokens'); break
    case 'PROGRESS':
      showProgress(
        msg.stage === 'fonts' ? 'Loading fonts' : msg.stage === 'transitions' ? 'Wiring transitions' : 'Building slides',
        msg.current ?? 0, msg.total ?? 0, msg.message ?? ''
      ); break
    case 'GENERATION_COMPLETE':
      setGenerating(false); hideProgress()
      showStatus('success', `${msg.slideCount} slides · ${msg.transitionCount} transitions · ${msg.duration?.toFixed(1)}s`)
      break
    case 'ERROR':
      setGenerating(false); hideProgress()
      showStatus('error', msg.message ?? 'Unknown error')
      break
    case 'CLEARED': showStatus('success', `Cleared ${msg.count} frames`); break
    case 'CANCELLED': setGenerating(false); hideProgress(); break
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
parent.postMessage({ pluginMessage: { type: 'PING' } as UIMessage }, '*')
