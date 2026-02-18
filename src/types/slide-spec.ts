/**
 * SlideForge — Complete TypeScript schema for slide specifications
 * Supports all Figma Plugin API capabilities for motion graphics & SmartAnimate
 */

// ─── Color & Paint ───────────────────────────────────────────────────────────

export interface RGB {
  r: number // 0–1
  g: number // 0–1
  b: number // 0–1
}

export interface RGBA extends RGB {
  a: number // 0–1
}

export type ColorStop = {
  position: number // 0–1
  color: RGBA
}

export type SolidPaint = {
  type: 'SOLID'
  color: RGBA
  blendMode?: BlendMode
  opacity?: number
  visible?: boolean
}

export type GradientPaint = {
  type: 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND'
  gradientStops: ColorStop[]
  gradientTransform: [[number, number, number], [number, number, number]]
  blendMode?: BlendMode
  opacity?: number
  visible?: boolean
}

export type ImagePaint = {
  type: 'IMAGE'
  imageRef: string // hash reference
  scaleMode: 'FILL' | 'FIT' | 'CROP' | 'TILE'
  imageTransform?: [[number, number, number], [number, number, number]]
  scalingFactor?: number
  blendMode?: BlendMode
  opacity?: number
  visible?: boolean
}

export type VideoPaint = {
  type: 'VIDEO'
  videoRef: string
  scaleMode: 'FILL' | 'FIT' | 'CROP' | 'TILE'
  blendMode?: BlendMode
  opacity?: number
  visible?: boolean
}

export type Paint = SolidPaint | GradientPaint | ImagePaint | VideoPaint

// ─── Effects ─────────────────────────────────────────────────────────────────

export type BlendMode =
  | 'NORMAL' | 'MULTIPLY' | 'SCREEN' | 'OVERLAY'
  | 'DARKEN' | 'LIGHTEN' | 'COLOR_DODGE' | 'COLOR_BURN'
  | 'HARD_LIGHT' | 'SOFT_LIGHT' | 'DIFFERENCE' | 'EXCLUSION'
  | 'HUE' | 'SATURATION' | 'COLOR' | 'LUMINOSITY'
  | 'PASS_THROUGH'

export type DropShadow = {
  type: 'DROP_SHADOW'
  color: RGBA
  offset: { x: number; y: number }
  radius: number
  spread?: number
  blendMode?: BlendMode
  visible?: boolean
  showShadowBehindNode?: boolean
}

export type InnerShadow = {
  type: 'INNER_SHADOW'
  color: RGBA
  offset: { x: number; y: number }
  radius: number
  spread?: number
  blendMode?: BlendMode
  visible?: boolean
}

export type LayerBlur = {
  type: 'LAYER_BLUR'
  radius: number
  visible?: boolean
}

export type BackgroundBlur = {
  type: 'BACKGROUND_BLUR'
  radius: number
  visible?: boolean
}

export type Effect = DropShadow | InnerShadow | LayerBlur | BackgroundBlur

// ─── Strokes ─────────────────────────────────────────────────────────────────

export type StrokeAlign = 'INSIDE' | 'OUTSIDE' | 'CENTER'

export type StrokeCap = 'NONE' | 'ROUND' | 'SQUARE' | 'LINE_ARROW' | 'TRIANGLE_ARROW'

export type StrokeJoin = 'MITER' | 'BEVEL' | 'ROUND'

export interface StrokeSpec {
  paint: Paint
  weight: number
  align?: StrokeAlign
  cap?: StrokeCap
  join?: StrokeJoin
  dashPattern?: number[]
  miterLimit?: number
}

// ─── Typography ──────────────────────────────────────────────────────────────

export type TextAlignHorizontal = 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED'
export type TextAlignVertical = 'TOP' | 'CENTER' | 'BOTTOM'
export type TextCase = 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE' | 'SMALL_CAPS' | 'SMALL_CAPS_FORCED'
export type TextDecoration = 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH'
export type TextTruncation = 'DISABLED' | 'ENDING'
export type LineHeightUnit = 'PIXELS' | 'PERCENT' | 'AUTO'

export interface FontName {
  family: string
  style: string
}

export interface TextStyle {
  fontName: FontName
  fontSize: number
  lineHeight?: { value: number; unit: LineHeightUnit }
  letterSpacing?: { value: number; unit: 'PIXELS' | 'PERCENT' }
  paragraphSpacing?: number
  paragraphIndent?: number
  textCase?: TextCase
  textDecoration?: TextDecoration
  textAlignHorizontal?: TextAlignHorizontal
  textAlignVertical?: TextAlignVertical
  fills?: Paint[]
  truncation?: TextTruncation
  maxLines?: number
  hyperlink?: { type: 'URL'; value: string } | { type: 'NODE'; value: string }
}

export interface TextSegment {
  characters: string
  style?: Partial<TextStyle> // overrides base style
  start?: number
  end?: number
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export type LayoutMode = 'NONE' | 'HORIZONTAL' | 'VERTICAL'
export type PrimaryAxisAlignItems = 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN'
export type CounterAxisAlignItems = 'MIN' | 'CENTER' | 'MAX' | 'BASELINE'
export type LayoutWrap = 'NO_WRAP' | 'WRAP'
export type ConstraintType = 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE'

export interface AutoLayout {
  mode: LayoutMode
  primaryAxisAlignItems?: PrimaryAxisAlignItems
  counterAxisAlignItems?: CounterAxisAlignItems
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  itemSpacing?: number
  counterAxisSpacing?: number
  layoutWrap?: LayoutWrap
  strokesIncludedInLayout?: boolean
  clipsContent?: boolean
}

export interface Constraints {
  horizontal: ConstraintType
  vertical: ConstraintType
}

// ─── Corners ─────────────────────────────────────────────────────────────────

export interface CornerRadius {
  all?: number
  topLeft?: number
  topRight?: number
  bottomLeft?: number
  bottomRight?: number
  smoothing?: number // 0–1, Figma corner smoothing
}

// ─── Transitions & SmartAnimate ──────────────────────────────────────────────

export type TransitionType =
  | 'SMART_ANIMATE'
  | 'DISSOLVE'
  | 'SLIDE_IN'
  | 'SLIDE_OUT'
  | 'PUSH'
  | 'MOVE_IN'
  | 'MOVE_OUT'
  | 'SCROLL_ANIMATE'

export type EasingType =
  | 'LINEAR'
  | 'EASE_IN'
  | 'EASE_OUT'
  | 'EASE_IN_AND_OUT'
  | 'EASE_IN_BACK'
  | 'EASE_OUT_BACK'
  | 'EASE_IN_AND_OUT_BACK'
  | 'SPRING'
  | 'CUSTOM_SPRING'
  | 'CUSTOM_BEZIER'

export interface CustomBezier {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface SpringParams {
  mass: number
  stiffness: number
  damping: number
}

export interface EasingSpec {
  type: EasingType
  bezier?: CustomBezier
  spring?: SpringParams
}

export type TransitionDirection = 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM'

export interface SlideTransition {
  from: string // slide id
  to: string   // slide id
  type: TransitionType
  easing?: EasingSpec
  duration?: number // seconds, default 0.3
  direction?: TransitionDirection
  matchLayers?: boolean // default true for SMART_ANIMATE
}

// ─── Layer Animations (per-layer entrance/exit) ───────────────────────────────

export type AnimationType = 'FADE' | 'SLIDE' | 'SCALE' | 'BLUR' | 'CUSTOM'

export interface LayerAnimation {
  layerName: string
  trigger: 'AFTER_PREVIOUS' | 'WITH_PREVIOUS' | 'ON_CLICK'
  type: AnimationType
  direction?: TransitionDirection
  delay?: number // seconds
  duration?: number // seconds
  easing?: EasingSpec
  from?: Partial<LayerAnimationState>
  to?: Partial<LayerAnimationState>
}

export interface LayerAnimationState {
  opacity: number
  x: number
  y: number
  scaleX: number
  scaleY: number
  blur: number
  rotation: number
}

// ─── Node Specs ──────────────────────────────────────────────────────────────

export type NodeType = 'FRAME' | 'TEXT' | 'RECTANGLE' | 'ELLIPSE' | 'VECTOR' | 'GROUP' | 'COMPONENT' | 'INSTANCE' | 'LINE' | 'STAR' | 'POLYGON'

export interface BaseNodeSpec {
  name: string // CRITICAL: used for SmartAnimate matching
  type: NodeType
  x?: number
  y?: number
  width?: number
  height?: number
  rotation?: number
  opacity?: number
  blendMode?: BlendMode
  visible?: boolean
  locked?: boolean
  fills?: Paint[]
  strokes?: StrokeSpec[]
  effects?: Effect[]
  constraints?: Constraints
  layoutAlign?: 'INHERIT' | 'STRETCH' | 'MIN' | 'CENTER' | 'MAX'
  layoutGrow?: number // 0 = fixed, 1 = fill container
  zIndex?: number
  exportSettings?: ExportSetting[]
}

export interface FrameNodeSpec extends BaseNodeSpec {
  type: 'FRAME'
  children?: NodeSpec[]
  autoLayout?: AutoLayout
  cornerRadius?: CornerRadius
  clipsContent?: boolean
  isMask?: boolean
  backgrounds?: Paint[]
}

export interface TextNodeSpec extends BaseNodeSpec {
  type: 'TEXT'
  content: string
  style: TextStyle
  segments?: TextSegment[] // for mixed-style text
  autoResize?: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE'
}

export interface RectangleNodeSpec extends BaseNodeSpec {
  type: 'RECTANGLE'
  cornerRadius?: CornerRadius
  isMask?: boolean
}

export interface EllipseNodeSpec extends BaseNodeSpec {
  type: 'ELLIPSE'
  arcData?: { startingAngle: number; endingAngle: number; innerRadius: number }
  isMask?: boolean
}

export interface LineNodeSpec extends BaseNodeSpec {
  type: 'LINE'
}

export interface StarNodeSpec extends BaseNodeSpec {
  type: 'STAR'
  pointCount?: number
  innerRadius?: number
  cornerRadius?: CornerRadius
}

export interface PolygonNodeSpec extends BaseNodeSpec {
  type: 'POLYGON'
  pointCount?: number
  cornerRadius?: CornerRadius
}

export interface VectorNodeSpec extends BaseNodeSpec {
  type: 'VECTOR'
  vectorPaths: Array<{ windingRule: 'EVENODD' | 'NONZERO'; data: string }>
  isMask?: boolean
}

export interface GroupNodeSpec extends BaseNodeSpec {
  type: 'GROUP'
  children: NodeSpec[]
}

export type NodeSpec =
  | FrameNodeSpec
  | TextNodeSpec
  | RectangleNodeSpec
  | EllipseNodeSpec
  | LineNodeSpec
  | StarNodeSpec
  | PolygonNodeSpec
  | VectorNodeSpec
  | GroupNodeSpec

// ─── Export Settings ─────────────────────────────────────────────────────────

export interface ExportSetting {
  format: 'PNG' | 'JPG' | 'SVG' | 'PDF'
  suffix?: string
  constraint?: { type: 'SCALE' | 'WIDTH' | 'HEIGHT'; value: number }
}

// ─── Design Tokens ───────────────────────────────────────────────────────────

export interface ColorToken {
  name: string
  value: RGBA
}

export interface FontToken {
  name: string
  family: string
  style: string
  size: number
  lineHeight?: { value: number; unit: LineHeightUnit }
  letterSpacing?: { value: number; unit: 'PIXELS' | 'PERCENT' }
}

export interface SpacingToken {
  name: string
  value: number
}

export interface RadiusToken {
  name: string
  value: number
}

export interface EffectToken {
  name: string
  effects: Effect[]
}

export interface DesignTokens {
  colors?: ColorToken[]
  fonts?: FontToken[]
  spacing?: SpacingToken[]
  radii?: RadiusToken[]
  effects?: EffectToken[]
}

// ─── Slide ────────────────────────────────────────────────────────────────────

export interface SlideSpec {
  id: string
  name: string // becomes Figma frame name
  width?: number  // default 1920
  height?: number // default 1080
  background?: Paint
  children: NodeSpec[]
  animations?: LayerAnimation[]
  notes?: string // presenter notes
}

// ─── Full Deck Spec ───────────────────────────────────────────────────────────

export interface DeckSpec {
  name: string
  version?: string
  tokens?: DesignTokens
  slides: SlideSpec[]
  transitions?: SlideTransition[]
  defaultSlideSize?: { width: number; height: number }
  defaultFonts?: FontName[]
  startSlideId?: string
}

// ─── Plugin ↔ UI Messages ──────────────────────────────────────────────────

export type PluginMessage =
  | { type: 'PONG'; version: string }
  | { type: 'GENERATION_START' }
  | { type: 'PROGRESS'; stage: string; current?: number; total?: number; message?: string }
  | { type: 'GENERATION_COMPLETE'; slideCount: number; transitionCount: number; duration: number }
  | { type: 'ERROR'; message: string }
  | { type: 'CLEARED'; count: number }
  | { type: 'CANCELLED' }

export type UIMessage =
  | { type: 'PING' }
  | { type: 'GENERATE'; deck: DeckSpec & { _uiOverrides?: { duration: number; transitionType: string } } }
  | { type: 'CLEAR' }
  | { type: 'CANCEL' }
