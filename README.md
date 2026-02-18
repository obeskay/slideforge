# SlideForge

**JSON to Figma Slides with SmartAnimate & motion graphics.**

A Figma plugin that converts structured JSON deck specifications into fully built Figma Slide frames, complete with transitions, easing presets, and chunked processing for large decks.

## Features

- **JSON-driven slide generation** — Define slides, layers, text, shapes, and vectors via a typed DeckSpec schema
- **SmartAnimate transitions** — Automatic transition wiring between slides with matched layer names
- **Rich easing presets** — Material Expressive (450ms ease-in-out default), Spring, Bounce, Gentle, Snap, custom cubic-bezier
- **Chunked processing** — Batches of 5 slides to prevent memory saturation on large decks
- **Full Figma node support** — Frame, Text, Rectangle, Ellipse, Line, Star, Polygon, Vector, Group
- **Auto Layout** — Full auto-layout spec support (mode, alignment, padding, spacing, wrap)
- **Paint system** — Solid, linear/radial/angular/diamond gradients, image fills
- **Effects** — Drop shadow, inner shadow, layer/background blur
- **Mixed text segments** — Per-range font, size, color, decoration, hyperlinks
- **Design tokens** — Token resolution for colors and typography
- **4 built-in templates** — Hero Dark, Stats, Split Layout, CTA
- **Accessible UI** — WCAG compliant: ARIA roles, keyboard navigation, `prefers-reduced-motion`, focus-visible rings
- **Premium dark glassmorphism UI** — No emojis, SVG icons throughout

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/obeskay/slideforge.git
cd slideforge
npm install
```

### 2. Build

```bash
npm run build
```

This generates `dist/code.js` and `dist/ui.html`.

### 3. Load in Figma

1. Open Figma Desktop
2. Go to **Plugins > Development > Import plugin from manifest...**
3. Select the `manifest.json` file in this repo
4. Open the plugin from **Plugins > Development > SlideForge**

### 4. Use

- **JSON tab**: Paste a DeckSpec JSON and hit **Generate Slides**
- **Templates tab**: Pick a preset template (Hero Dark, Stats, Split, CTA)
- Configure transition type and duration before generating

## DeckSpec Schema

```typescript
interface DeckSpec {
  name: string
  width?: number       // default 1920
  height?: number      // default 1080
  tokens?: DesignTokens
  slides: SlideSpec[]
  transitions?: TransitionSpec[]
}

interface SlideSpec {
  id: string
  name: string
  background?: Paint
  children: NodeSpec[]
}
```

See [`src/types/slide-spec.ts`](src/types/slide-spec.ts) for the complete typed schema.

## Project Structure

```
slideforge/
  manifest.json          # Figma plugin manifest
  build.ts               # esbuild bundler (code + UI inlining)
  package.json
  tsconfig.json
  src/
    code/index.ts        # Plugin sandbox entry (Figma API)
    core/
      slide-generator.ts # Main orchestrator (chunked processing)
      node-builder.ts    # NodeSpec -> Figma node converter
      paint-builder.ts   # Fill/stroke/effect applicator
      transitions.ts     # Easing presets + transition wiring
    types/
      slide-spec.ts      # Full TypeScript schema
    ui/
      index.html         # Plugin UI (dark glassmorphism)
      index.ts           # UI logic (tabs, templates, progress)
    utils/
      color.ts           # Color utilities
      fonts.ts           # Font loading helpers
  dist/                  # Build output (gitignored)
    code.js
    ui.html
```

## Development

```bash
# Watch mode (auto-rebuild on changes)
npm run watch

# Type checking only
npm run typecheck

# Production build
npm run build
```

## Transition Types

| Type | Description |
|------|-------------|
| `SMART_ANIMATE` | Morphs matched layers between frames |
| `DISSOLVE` | Cross-fade between slides |
| `PUSH` | Pushes current slide out |
| `SLIDE_IN` | New slide enters from edge |
| `MOVE_IN` | New slide moves over current |
| `MOVE_OUT` | Current slide moves away |

## Easing Presets

| Preset | Curve | Duration |
|--------|-------|----------|
| `STANDARD` | `cubic-bezier(0.4, 0, 0.2, 1)` | 450ms |
| `EMPHASIZED` | `cubic-bezier(0.2, 0, 0, 1)` | 500ms |
| `SPRING` | mass=1, stiffness=100, damping=15 | - |
| `BOUNCE` | mass=1, stiffness=200, damping=12 | - |
| `GENTLE` | mass=1, stiffness=80, damping=20 | - |
| `SNAP` | mass=1, stiffness=300, damping=25 | - |

## Tech Stack

- **TypeScript** — Strict mode
- **esbuild** — Fast bundling (IIFE format for Figma sandbox)
- **Figma Plugin API** — `@figma/plugin-typings`
- **No runtime dependencies** — Zero npm packages in production

## License

[MIT](LICENSE)
