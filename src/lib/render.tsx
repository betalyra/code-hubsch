import type { ReactElement } from 'react'
import satori from 'satori'
import { loadCodeFont, type SatoriFont } from './fonts'
import { renderTreeToPng } from './htmlInCanvas'
import { tokenize } from './shiki'
import type { ChromeStyle, Settings } from './types'
import { parseLineRanges, type WrappedLine, wrapLines } from './wrap'

const MONO_WIDTH_FACTOR = 0.6

const HIGHLIGHT_ALPHA_HEX = '33'

const overlayColor = (hex: string): string => {
  const m = hex.match(/^#?([0-9a-fA-F]{6})$/)
  if (m) return `#${m[1]}${HIGHLIGHT_ALPHA_HEX}`
  return hex
}

interface RenderTokensInput {
  lines: ReadonlyArray<WrappedLine>
  fallbackColor: string
  lineHeightPx: number
  fontSize: number
  highlight: ReadonlySet<number>
  paddingX: number
  highlightColor: string
  showLineNumbers: boolean
  lineNumberWidth: number
  totalSourceLines: number
}

const renderTokens = ({
  lines,
  fallbackColor,
  lineHeightPx,
  fontSize,
  highlight,
  paddingX,
  highlightColor,
  showLineNumbers,
  lineNumberWidth,
}: RenderTokensInput) => {
  const overlay = overlayColor(highlightColor)
  return lines.map((line, lineIndex) => {
    const isHighlighted = highlight.has(line.sourceLine + 1)
    const previous = lineIndex > 0 ? lines[lineIndex - 1] : undefined
    const showNumber =
      showLineNumbers &&
      (previous === undefined || previous.sourceLine !== line.sourceLine)
    return (
      <div
        // biome-ignore lint/suspicious/noArrayIndexKey: stable render data
        key={lineIndex}
        style={{
          display: 'flex',
          height: lineHeightPx,
          fontSize,
          marginLeft: -paddingX,
          marginRight: -paddingX,
          paddingLeft: paddingX,
          paddingRight: paddingX,
          backgroundColor: isHighlighted ? overlay : 'transparent',
        }}
      >
        {showLineNumbers && (
          <div
            style={{
              display: 'flex',
              width: lineNumberWidth,
              flexShrink: 0,
              justifyContent: 'flex-end',
              paddingRight: 12,
              color: fallbackColor,
              opacity: 0.35,
            }}
          >
            {showNumber ? line.sourceLine + 1 : ''}
          </div>
        )}
        {line.tokens.length === 0 ? (
          <span> </span>
        ) : (
          line.tokens.map((token, tokenIndex) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: stable render data
              key={`${lineIndex}-${tokenIndex}`}
              style={{
                color: token.color ?? fallbackColor,
                flexShrink: 0,
                fontStyle: token.fontStyle === 1 ? 'italic' : 'normal',
                fontWeight: token.fontStyle === 2 ? 500 : 400,
                whiteSpace: 'pre',
              }}
            >
              {token.content}
            </span>
          ))
        )}
      </div>
    )
  })
}

const Filename = ({
  filename,
  filenameColor,
  fontFamily,
  height,
  align = 'left',
}: {
  filename: string
  filenameColor: string
  fontFamily: string
  height: number
  align?: 'left' | 'center'
}) => {
  if (!filename) return null
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        marginLeft: align === 'left' ? 12 : 0,
        fontFamily,
        fontSize: Math.max(11, Math.round(height * 0.42)),
        color: filenameColor,
        opacity: 0.7,
      }}
    >
      {filename}
    </div>
  )
}

const MacosChrome = ({
  height,
  filename,
  filenameColor,
  fontFamily,
  variant,
  chromeColor,
}: {
  height: number
  filename: string
  filenameColor: string
  fontFamily: string
  variant: 'color' | 'minimal'
  chromeColor: string
}) => {
  const dotStyle =
    variant === 'color'
      ? [
          { backgroundColor: '#ff5f57' },
          { backgroundColor: '#ffbd2e' },
          { backgroundColor: '#28c840' },
        ]
      : [
          { backgroundColor: 'rgba(255,255,255,0.18)' },
          { backgroundColor: 'rgba(255,255,255,0.18)' },
          { backgroundColor: 'rgba(255,255,255,0.18)' },
        ]
  return (
    <div
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 18,
        paddingRight: 18,
        gap: 8,
        backgroundColor: chromeColor,
        flexShrink: 0,
      }}
    >
      {dotStyle.map((style, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: stable
          key={i}
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            ...style,
          }}
        />
      ))}
      <Filename
        filename={filename}
        filenameColor={filenameColor}
        fontFamily={fontFamily}
        height={height}
        align="center"
      />
    </div>
  )
}

const WindowsChrome = ({
  height,
  filename,
  filenameColor,
  fontFamily,
  chromeColor,
}: {
  height: number
  filename: string
  filenameColor: string
  fontFamily: string
  chromeColor: string
}) => {
  const iconSize = Math.round(height * 0.4)
  const cellWidth = Math.round(height * 1.4)
  const lineColor = 'rgba(255,255,255,0.7)'
  return (
    <div
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: chromeColor,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          marginLeft: 14,
          fontFamily,
          fontSize: Math.max(11, Math.round(height * 0.42)),
          color: filenameColor,
          opacity: 0.7,
          flex: 1,
        }}
      >
        {filename}
      </div>
      <div
        style={{
          display: 'flex',
          width: cellWidth,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 12 12">
          <line
            x1="1.5"
            y1="6"
            x2="10.5"
            y2="6"
            stroke={lineColor}
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div
        style={{
          display: 'flex',
          width: cellWidth,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 12 12">
          <rect
            x="1.5"
            y="1.5"
            width="9"
            height="9"
            fill="none"
            stroke={lineColor}
            strokeWidth="1"
          />
        </svg>
      </div>
      <div
        style={{
          display: 'flex',
          width: cellWidth,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 12 12">
          <line
            x1="2"
            y1="2"
            x2="10"
            y2="10"
            stroke={lineColor}
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="10"
            y1="2"
            x2="2"
            y2="10"
            stroke={lineColor}
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}

const Win95Chrome = ({
  height,
  filename,
  fontFamily,
  chromeColor,
}: {
  height: number
  filename: string
  fontFamily: string
  chromeColor: string
}) => {
  const buttonSize = Math.round(height * 0.7)
  const iconSize = Math.round(buttonSize * 0.55)
  const buttonBg = '#c0c0c0'
  const beveled = {
    width: buttonSize,
    height: buttonSize,
    backgroundColor: buttonBg,
    borderTopColor: '#ffffff',
    borderLeftColor: '#ffffff',
    borderRightColor: '#000000',
    borderBottomColor: '#000000',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const
  return (
    <div
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: chromeColor,
        flexShrink: 0,
        paddingLeft: 8,
        paddingRight: 6,
        gap: 6,
      }}
    >
      <div
        style={{
          flex: 1,
          fontFamily,
          fontSize: Math.max(11, Math.round(height * 0.42)),
          color: '#ffffff',
          fontWeight: 700,
          letterSpacing: 0.2,
        }}
      >
        {filename}
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        <div style={beveled}>
          <svg width={iconSize} height={iconSize} viewBox="0 0 12 12">
            <line
              x1="2"
              y1="9"
              x2="10"
              y2="9"
              stroke="#000000"
              strokeWidth="1.6"
            />
          </svg>
        </div>
        <div style={beveled}>
          <svg width={iconSize} height={iconSize} viewBox="0 0 12 12">
            <rect
              x="2"
              y="2"
              width="8"
              height="8"
              fill="none"
              stroke="#000000"
              strokeWidth="1.6"
            />
          </svg>
        </div>
        <div style={beveled}>
          <svg width={iconSize} height={iconSize} viewBox="0 0 12 12">
            <line
              x1="2.5"
              y1="2.5"
              x2="9.5"
              y2="9.5"
              stroke="#000000"
              strokeWidth="1.6"
              strokeLinecap="square"
            />
            <line
              x1="9.5"
              y1="2.5"
              x2="2.5"
              y2="9.5"
              stroke="#000000"
              strokeWidth="1.6"
              strokeLinecap="square"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

const renderChrome = (
  style: ChromeStyle,
  height: number,
  filename: string,
  filenameColor: string,
  fontFamily: string,
  chromeColor: string,
) => {
  if (style === 'windows') {
    return (
      <WindowsChrome
        height={height}
        filename={filename}
        filenameColor={filenameColor}
        fontFamily={fontFamily}
        chromeColor={chromeColor}
      />
    )
  }
  if (style === 'win95') {
    return (
      <Win95Chrome
        height={height}
        filename={filename}
        fontFamily={fontFamily}
        chromeColor={chromeColor}
      />
    )
  }
  return (
    <MacosChrome
      height={height}
      filename={filename}
      filenameColor={filenameColor}
      fontFamily={fontFamily}
      variant={style === 'minimal' ? 'minimal' : 'color'}
      chromeColor={chromeColor}
    />
  )
}

const buildBackground = (
  settings: Settings,
): { backgroundColor?: string; backgroundImage?: string } => {
  if (settings.transparentBackground) return { backgroundColor: 'rgba(0,0,0,0)' }
  if (settings.backgroundType === 'linear') {
    return {
      backgroundImage: `linear-gradient(${settings.gradientAngle}deg, ${settings.background}, ${settings.backgroundSecondary})`,
    }
  }
  if (settings.backgroundType === 'radial') {
    return {
      backgroundImage: `radial-gradient(circle at 50% 50%, ${settings.background}, ${settings.backgroundSecondary})`,
    }
  }
  return { backgroundColor: settings.background }
}

const buildShadow = (intensity: number): string | undefined => {
  if (intensity <= 0) return undefined
  const t = Math.min(1, intensity / 100)
  const offsetY = Math.round(8 + t * 56)
  const blur = Math.round(16 + t * 96)
  const alpha = (0.18 + t * 0.42).toFixed(3)
  return `0 ${offsetY}px ${blur}px rgba(0,0,0,${alpha})`
}

interface BuildPageTreeInput {
  settings: Settings
  pageLines: ReadonlyArray<WrappedLine>
  width: number
  height: number
  highlightSet: ReadonlySet<number>
  lineNumberWidth: number
  totalSourceLines: number
}

const buildPageTree = ({
  settings,
  pageLines,
  width,
  height,
  highlightSet,
  lineNumberWidth,
  totalSourceLines,
}: BuildPageTreeInput): ReactElement => {
  const {
    codeFont,
    fontSize,
    lineHeight,
    paddingX,
    paddingY,
    windowColor,
    chromeColor,
    chrome,
    chromeStyle,
    filename,
    radius,
    outerMargin,
    windowShadow,
    lineNumbers,
    highlightColor,
    ligatures,
    htmlInCanvas,
  } = settings

  const lineHeightPx = Math.round(fontSize * lineHeight)
  const chromeHeight = chrome ? Math.max(28, Math.round(fontSize * 1.1)) : 0
  const fallbackColor = '#d6deeb'
  const backgroundStyle = buildBackground(settings)
  const shadow = buildShadow(windowShadow)

  // font-feature-settings is only meaningful on the HTML-in-Canvas path —
  // Satori silently ignores it. Explicitly setting "liga"/"calt" to 0
  // disables ligatures in the live DOM render. ss01–ss08 are needed for
  // fonts (like Monaspace) that ship programming ligatures as stylistic
  // sets rather than standard ligatures; fonts that don't have those
  // features ignore the unknown tags.
  const ligaOn =
    '"liga" 1, "calt" 1, "ss01", "ss02", "ss03", "ss04", "ss05", "ss06", "ss07", "ss08"'
  const ligaOff = '"liga" 0, "calt" 0'
  const featureSettings = htmlInCanvas && ligatures ? ligaOn : ligaOff

  const borderStyle =
    settings.borderWidth > 0
      ? {
          borderColor: settings.borderColor,
          borderStyle: 'solid' as const,
          borderTopWidth: settings.borderWidth,
          borderLeftWidth: settings.borderWidth,
          borderRightWidth: settings.borderWidth,
          borderBottomWidth: settings.borderWidth,
        }
      : {}

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        padding: outerMargin,
        ...backgroundStyle,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: windowColor,
          ...(shadow ? { boxShadow: shadow } : {}),
          ...borderStyle,
        }}
      >
        {chrome &&
          renderChrome(
            chromeStyle,
            chromeHeight,
            filename,
            fallbackColor,
            codeFont,
            chromeColor,
          )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: `${paddingY}px ${paddingX}px`,
            fontFamily: codeFont,
            fontSize,
            lineHeight: `${lineHeightPx}px`,
            color: fallbackColor,
            flex: 1,
            overflow: 'hidden',
            fontFeatureSettings: featureSettings,
          }}
        >
          {renderTokens({
            lines: pageLines,
            fallbackColor,
            lineHeightPx,
            fontSize,
            highlight: highlightSet,
            paddingX,
            highlightColor,
            showLineNumbers: lineNumbers,
            lineNumberWidth,
            totalSourceLines,
          })}
        </div>
      </div>
    </div>
  )
}

interface RenderOnePageInput extends BuildPageTreeInput {
  fonts: ReadonlyArray<SatoriFont>
}

const renderOnePageSvg = async ({
  fonts,
  width,
  height,
  ...rest
}: RenderOnePageInput): Promise<string> => {
  const tree = buildPageTree({ ...rest, width, height })
  return satori(tree, {
    width,
    height,
    fonts: fonts.map((f) => ({
      name: f.name,
      data: f.data,
      weight: f.weight,
      style: f.style,
    })),
  })
}

const renderOnePagePng = async (
  input: BuildPageTreeInput,
  scale: number,
): Promise<Blob> => {
  const tree = buildPageTree(input)
  return renderTreeToPng(tree, input.width, input.height, scale)
}

export interface Page {
  svg: string
  png?: Blob
  pageIndex: number
  width: number
  height: number
}

export interface RenderResult {
  pages: ReadonlyArray<Page>
  width: number
  height: number
  totalPages: number
  totalLines: number
  linesPerPage: number
}

export const renderCodePages = async (
  settings: Settings,
): Promise<RenderResult> => {
  const {
    code,
    language,
    theme,
    codeFont,
    width,
    height,
    autoHeight,
    fontSize,
    lineHeight,
    paddingX,
    paddingY,
    chrome,
    outerMargin,
    highlightedLines,
  } = settings

  const tokenLines = await tokenize(code, language, theme)

  const lineHeightPx = Math.round(fontSize * lineHeight)
  const chromeHeight = chrome ? Math.max(28, Math.round(fontSize * 1.1)) : 0
  const charWidth = fontSize * MONO_WIDTH_FACTOR
  const totalSourceLines = tokenLines.length
  const lineNumberDigits = Math.max(2, String(Math.max(1, totalSourceLines)).length)
  const lineNumberWidth = settings.lineNumbers
    ? Math.round(lineNumberDigits * charWidth + 12)
    : 0
  const innerWidth = Math.max(
    40,
    width - outerMargin * 2 - paddingX * 2 - lineNumberWidth,
  )
  const maxChars = Math.max(10, Math.floor(innerWidth / charWidth))
  const wrapped = wrapLines(tokenLines, maxChars)

  const fonts = await loadCodeFont(codeFont)
  const highlightSet = new Set<number>(parseLineRanges(highlightedLines))

  const renderPage = async (
    pageLines: ReadonlyArray<WrappedLine>,
    pageIndex: number,
    pageHeight: number,
  ): Promise<Page> => {
    const baseInput: BuildPageTreeInput = {
      settings,
      pageLines,
      width,
      height: pageHeight,
      highlightSet,
      lineNumberWidth,
      totalSourceLines,
    }
    const svg = await renderOnePageSvg({ ...baseInput, fonts })
    // PNG is rendered in parallel via HTML-in-Canvas when enabled. We
    // still keep the Satori SVG around so the SVG export path keeps
    // working (canvas rasterisation can't be vectorised).
    const png = settings.htmlInCanvas
      ? await renderOnePagePng(baseInput, settings.exportScale)
      : undefined
    return { svg, png, pageIndex, width, height: pageHeight }
  }

  if (autoHeight) {
    const computedHeight =
      outerMargin * 2 +
      chromeHeight +
      paddingY * 2 +
      Math.max(1, wrapped.length) * lineHeightPx
    const page = await renderPage(wrapped, 0, computedHeight)
    return {
      pages: [page],
      width,
      height: computedHeight,
      totalPages: 1,
      totalLines: wrapped.length,
      linesPerPage: wrapped.length,
    }
  }

  const innerHeight = Math.max(
    lineHeightPx,
    height - outerMargin * 2 - paddingY * 2 - chromeHeight,
  )
  const linesPerPage = Math.max(1, Math.floor(innerHeight / lineHeightPx))
  const totalPages = Math.max(1, Math.ceil(wrapped.length / linesPerPage))

  // HTML-in-Canvas renders sequentially (it mounts a real DOM subtree
  // off-screen for each page). The Satori path can run in parallel.
  const pages: Page[] = []
  for (let i = 0; i < totalPages; i += 1) {
    const start = i * linesPerPage
    const slice = wrapped.slice(start, start + linesPerPage)
    // biome-ignore lint/performance/noAwaitInLoops: sequential by design (see comment above)
    pages.push(await renderPage(slice, i, height))
  }

  return {
    pages,
    width,
    height,
    totalPages,
    totalLines: wrapped.length,
    linesPerPage,
  }
}
