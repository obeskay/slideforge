import * as esbuild from 'esbuild'
import * as fs from 'fs'

const watch = process.argv.includes('--watch')

// Build plugin code (runs in Figma sandbox — jsvm, no optional chaining)
const codeConfig: esbuild.BuildOptions = {
  entryPoints: ['src/code/index.ts'],
  bundle: true,
  outfile: 'dist/code.js',
  platform: 'browser',
  target: 'es2017',
  format: 'iife',
  minify: !watch,
  sourcemap: watch ? 'inline' : false,
  define: {
    'process.env.NODE_ENV': watch ? '"development"' : '"production"'
  }
}

// Build UI (HTML + inlined JS)
const uiConfig: esbuild.BuildOptions = {
  entryPoints: ['src/ui/index.ts'],
  bundle: true,
  outfile: 'dist/ui-bundle.js',
  platform: 'browser',
  target: 'es2020',
  format: 'iife',
  minify: !watch,
  sourcemap: watch ? 'inline' : false,
  // Inline after every build, watch rebuilds included, so dist/ui.html (the manifest's "ui") stays current
  plugins: [{ name: 'inline-ui', setup: (b) => b.onEnd((r) => { if (!r.errors.length) inlineUI() }) }],
}

function inlineUI(): void {
  // Read the UI HTML template and inline the bundle
  const htmlTemplate = fs.readFileSync('src/ui/index.html', 'utf-8')
  const jsBundle = fs.readFileSync('dist/ui-bundle.js', 'utf-8')

  // Replace the <script src="ui.js"></script> tag with inlined JS
  const finalHtml = htmlTemplate.replace(
    '<script src="ui.js"></script>',
    `<script>${jsBundle}</script>`
  )

  if (!fs.existsSync('dist')) fs.mkdirSync('dist', { recursive: true })
  fs.writeFileSync('dist/ui.html', finalHtml)
  console.log('✅ UI built → dist/ui.html')
}

async function build(): Promise<void> {
  if (!fs.existsSync('dist')) fs.mkdirSync('dist', { recursive: true })

  await Promise.all([
    esbuild.build(codeConfig).then(() => console.log('✅ Plugin code built → dist/code.js')),
    esbuild.build(uiConfig)
  ])

  console.log('🚀 SlideForge plugin built successfully!')
}

async function main(): Promise<void> {
  if (watch) {
    const codeCtx = await esbuild.context(codeConfig)
    const uiCtx = await esbuild.context(uiConfig)
    await Promise.all([codeCtx.watch(), uiCtx.watch()])
    // esbuild only watches the JS graph; the HTML template is inlined, so rebuild when it changes too
    fs.watch('src/ui', (_, file) => { if (file === 'index.html') uiCtx.rebuild().catch(() => {}) })
    console.log('👀 Watching for changes...')
  } else {
    await build()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
