/// <reference types="@figma/plugin-typings" />
/**
 * SlideForge Node Builder
 * Converts NodeSpec objects into Figma nodes with full property support
 */
import type {
  NodeSpec, FrameNodeSpec, TextNodeSpec, RectangleNodeSpec,
  EllipseNodeSpec, VectorNodeSpec, GroupNodeSpec, LineNodeSpec,
  StarNodeSpec, PolygonNodeSpec, BaseNodeSpec, AutoLayout,
  CornerRadius, Paint,
  DesignTokens
} from '../types/slide-spec'
import { applyFills, applyStrokes, applyEffects, applyBlend } from './paint-builder'

// ─── Token Resolution ─────────────────────────────────────────────────────────

let _tokens: DesignTokens = {}

export function setTokens(tokens: DesignTokens) {
  _tokens = tokens
}

// ─── Base Node Properties ─────────────────────────────────────────────────────

function applyBaseProps(node: SceneNode, spec: BaseNodeSpec): void {
  node.name = spec.name

  if ('x' in node && spec.x !== undefined) node.x = spec.x
  if ('y' in node && spec.y !== undefined) node.y = spec.y

  if ('resize' in node && spec.width !== undefined && spec.height !== undefined) {
    (node as FrameNode).resize(spec.width, spec.height)
  }

  if (spec.rotation !== undefined && 'rotation' in node) {
    (node as FrameNode).rotation = spec.rotation
  }

  if (spec.visible !== undefined) node.visible = spec.visible
  if (spec.locked !== undefined) node.locked = spec.locked

  if ('fills' in node && spec.fills) {
    applyFills(node as GeometryMixin, spec.fills)
  }

  if ('strokes' in node && spec.strokes) {
    applyStrokes(node as GeometryMixin & MinimalStrokesMixin, spec.strokes)
  }

  if ('effects' in node && spec.effects) {
    applyEffects(node as BlendMixin, spec.effects)
  }

  if ('blendMode' in node) {
    applyBlend(node as BlendMixin, spec.blendMode, spec.opacity)
  }

  if ('constraints' in node && spec.constraints) {
    (node as ConstraintMixin).constraints = spec.constraints
  }

  if ('layoutAlign' in node && spec.layoutAlign) {
    (node as ChildrenMixin & { layoutAlign: string }).layoutAlign = spec.layoutAlign
  }
  if ('layoutGrow' in node && spec.layoutGrow !== undefined) {
    (node as ChildrenMixin & { layoutGrow: number }).layoutGrow = spec.layoutGrow
  }
}

// ─── Auto Layout ──────────────────────────────────────────────────────────────

function applyAutoLayout(node: FrameNode, al: AutoLayout): void {
  node.layoutMode = al.mode
  if (al.mode === 'NONE') return

  if (al.primaryAxisAlignItems) node.primaryAxisAlignItems = al.primaryAxisAlignItems
  if (al.counterAxisAlignItems) node.counterAxisAlignItems = al.counterAxisAlignItems
  if (al.paddingTop !== undefined) node.paddingTop = al.paddingTop
  if (al.paddingBottom !== undefined) node.paddingBottom = al.paddingBottom
  if (al.paddingLeft !== undefined) node.paddingLeft = al.paddingLeft
  if (al.paddingRight !== undefined) node.paddingRight = al.paddingRight
  if (al.itemSpacing !== undefined) node.itemSpacing = al.itemSpacing
  if (al.counterAxisSpacing !== undefined) node.counterAxisSpacing = al.counterAxisSpacing
  if (al.layoutWrap) node.layoutWrap = al.layoutWrap
  if (al.strokesIncludedInLayout !== undefined) {
    node.strokesIncludedInLayout = al.strokesIncludedInLayout
  }
  if (al.clipsContent !== undefined) node.clipsContent = al.clipsContent
}

// ─── Corner Radius ────────────────────────────────────────────────────────────

function applyCornerRadius(node: FrameNode | RectangleNode | StarNode | PolygonNode, cr: CornerRadius): void {
  if (cr.all !== undefined) {
    node.cornerRadius = cr.all
  } else {
    if ('topLeftRadius' in node) {
      if (cr.topLeft !== undefined) (node as RectangleNode).topLeftRadius = cr.topLeft
      if (cr.topRight !== undefined) (node as RectangleNode).topRightRadius = cr.topRight
      if (cr.bottomLeft !== undefined) (node as RectangleNode).bottomLeftRadius = cr.bottomLeft
      if (cr.bottomRight !== undefined) (node as RectangleNode).bottomRightRadius = cr.bottomRight
    }
  }
  if (cr.smoothing !== undefined && 'cornerSmoothing' in node) {
    (node as FrameNode).cornerSmoothing = cr.smoothing
  }
}

// ─── Text Node ────────────────────────────────────────────────────────────────

async function buildTextNode(spec: TextNodeSpec, parent: ChildrenMixin): Promise<TextNode> {
  const node = figma.createText()
  parent.appendChild(node)

  applyBaseProps(node, spec)

  // Load font
  await figma.loadFontAsync(spec.style.fontName).catch(() =>
    figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
  )

  // Apply text content
  node.characters = spec.content

  // Apply base style
  const s = spec.style
  node.fontName = s.fontName
  node.fontSize = s.fontSize

  if (s.lineHeight) {
    node.lineHeight = s.lineHeight.unit === 'AUTO'
      ? { unit: 'AUTO' }
      : { value: s.lineHeight.value, unit: s.lineHeight.unit }
  }
  if (s.letterSpacing) node.letterSpacing = s.letterSpacing
  if (s.paragraphSpacing !== undefined) node.paragraphSpacing = s.paragraphSpacing
  if (s.paragraphIndent !== undefined) node.paragraphIndent = s.paragraphIndent
  if (s.textCase) node.textCase = s.textCase
  if (s.textDecoration) node.textDecoration = s.textDecoration
  if (s.textAlignHorizontal) node.textAlignHorizontal = s.textAlignHorizontal
  if (s.textAlignVertical) node.textAlignVertical = s.textAlignVertical
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (s.fills) node.fills = s.fills as unknown as any
  if (s.truncation) node.textTruncation = s.truncation
  if (s.maxLines !== undefined) node.maxLines = s.maxLines
  if (spec.autoResize) node.textAutoResize = spec.autoResize

  // Apply mixed segments
  if (spec.segments && spec.segments.length > 0) {
    for (const seg of spec.segments) {
      if (seg.start !== undefined && seg.end !== undefined) {
        const segStyle = seg.style
        if (!segStyle) continue
        if (segStyle.fontName) {
          await figma.loadFontAsync(segStyle.fontName)
          node.setRangeFontName(seg.start, seg.end, segStyle.fontName)
        }
        if (segStyle.fontSize) node.setRangeFontSize(seg.start, seg.end, segStyle.fontSize)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (segStyle.fills) node.setRangeFills(seg.start, seg.end, segStyle.fills as unknown as any)
        if (segStyle.textCase) node.setRangeTextCase(seg.start, seg.end, segStyle.textCase)
        if (segStyle.textDecoration) node.setRangeTextDecoration(seg.start, seg.end, segStyle.textDecoration)
        if (segStyle.letterSpacing) node.setRangeLetterSpacing(seg.start, seg.end, segStyle.letterSpacing)
        if (segStyle.lineHeight) {
          node.setRangeLineHeight(seg.start, seg.end,
            segStyle.lineHeight.unit === 'AUTO' ? { unit: 'AUTO' } :
              { value: segStyle.lineHeight.value, unit: segStyle.lineHeight.unit }
          )
        }
        if (segStyle.hyperlink) node.setRangeHyperlink(seg.start, seg.end, segStyle.hyperlink)
      }
    }
  }

  return node
}

// ─── Frame Node ───────────────────────────────────────────────────────────────

async function buildFrameNode(spec: FrameNodeSpec, parent: ChildrenMixin): Promise<FrameNode> {
  const node = figma.createFrame()
  parent.appendChild(node)

  applyBaseProps(node, spec)

  if (spec.cornerRadius) applyCornerRadius(node, spec.cornerRadius)
  if (spec.autoLayout) applyAutoLayout(node, spec.autoLayout)
  if (spec.clipsContent !== undefined) node.clipsContent = spec.clipsContent
  if (spec.isMask !== undefined) node.isMask = spec.isMask

  // Build children recursively
  if (spec.children) {
    for (const child of spec.children) {
      await buildNode(child, node) // eslint-disable-line no-use-before-define
    }
  }

  return node
}

// ─── Shape Nodes ──────────────────────────────────────────────────────────────

function buildRectangleNode(spec: RectangleNodeSpec, parent: ChildrenMixin): RectangleNode {
  const node = figma.createRectangle()
  parent.appendChild(node)
  applyBaseProps(node, spec)
  if (spec.cornerRadius) applyCornerRadius(node, spec.cornerRadius)
  if (spec.isMask !== undefined) node.isMask = spec.isMask
  return node
}

function buildEllipseNode(spec: EllipseNodeSpec, parent: ChildrenMixin): EllipseNode {
  const node = figma.createEllipse()
  parent.appendChild(node)
  applyBaseProps(node, spec)
  if (spec.arcData) node.arcData = spec.arcData
  return node
}

function buildLineNode(spec: LineNodeSpec, parent: ChildrenMixin): LineNode {
  const node = figma.createLine()
  parent.appendChild(node)
  applyBaseProps(node, spec)
  return node
}

function buildStarNode(spec: StarNodeSpec, parent: ChildrenMixin): StarNode {
  const node = figma.createStar()
  parent.appendChild(node)
  applyBaseProps(node, spec)
  if (spec.pointCount !== undefined) node.pointCount = spec.pointCount
  if (spec.innerRadius !== undefined) node.innerRadius = spec.innerRadius
  if (spec.cornerRadius) applyCornerRadius(node, spec.cornerRadius)
  return node
}

function buildPolygonNode(spec: PolygonNodeSpec, parent: ChildrenMixin): PolygonNode {
  const node = figma.createPolygon()
  parent.appendChild(node)
  applyBaseProps(node, spec)
  if (spec.pointCount !== undefined) node.pointCount = spec.pointCount
  if (spec.cornerRadius) applyCornerRadius(node, spec.cornerRadius)
  return node
}

function buildVectorNode(spec: VectorNodeSpec, parent: ChildrenMixin): VectorNode {
  const node = figma.createVector()
  parent.appendChild(node)
  applyBaseProps(node, spec)
  node.vectorPaths = spec.vectorPaths
  if (spec.isMask !== undefined) node.isMask = spec.isMask
  return node
}

async function buildGroupNode(spec: GroupNodeSpec, parent: ChildrenMixin): Promise<GroupNode> {
  // Groups must have children, build them in a temp frame first
  const tempFrame = figma.createFrame()
  parent.appendChild(tempFrame)
  const children: SceneNode[] = []
  for (const child of spec.children) {
    const built = await buildNode(child, tempFrame)
    if (built) children.push(built)
  }
  const group = figma.group(children, parent as unknown as BaseNode & ChildrenMixin)
  tempFrame.remove()
  group.name = spec.name
  if (spec.opacity !== undefined) group.opacity = spec.opacity
  if (spec.blendMode) group.blendMode = spec.blendMode as BlendMode
  if (spec.visible !== undefined) group.visible = spec.visible
  return group
}

// ─── Main Dispatcher ──────────────────────────────────────────────────────────

export async function buildNode(
  spec: NodeSpec,
  parent: ChildrenMixin
): Promise<SceneNode | null> {
  switch (spec.type) {
    case 'FRAME': return buildFrameNode(spec as FrameNodeSpec, parent)
    case 'TEXT': return buildTextNode(spec as TextNodeSpec, parent)
    case 'RECTANGLE': return buildRectangleNode(spec as RectangleNodeSpec, parent)
    case 'ELLIPSE': return buildEllipseNode(spec as EllipseNodeSpec, parent)
    case 'LINE': return buildLineNode(spec as LineNodeSpec, parent)
    case 'STAR': return buildStarNode(spec as StarNodeSpec, parent)
    case 'POLYGON': return buildPolygonNode(spec as PolygonNodeSpec, parent)
    case 'VECTOR': return buildVectorNode(spec as VectorNodeSpec, parent)
    case 'GROUP': return buildGroupNode(spec as GroupNodeSpec, parent)
    default:
      console.warn(`[SlideForge] Unknown node type: ${(spec as NodeSpec).type}`)
      return null
  }
}
