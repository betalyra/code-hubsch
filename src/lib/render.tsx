import satori from 'satori'
import { loadCodeFont, type SatoriFont } from './fonts'
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
}: {
  height: number
  filename: string
  filenameColor: string
  fontFamily: string
  variant: 'color' | 'minimal'
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
        backgroundColor: 'rgba(255,255,255,0.04)',
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
}: {
  height: number
  filename: string
  filenameColor: string
  fontFamily: string
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
        backgroundColor: 'rgba(255,255,255,0.04)',
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

const renderChrome = (
  style: ChromeStyle,
  height: number,
  filename: string,
  filenameColor: string,
  fontFamily: string,
) => {
  if (style === 'windows') {
    return (
      <WindowsChrome
        height={height}
        filename={filename}
        filenameColor={filenameColor}
        fontFamily={fontFamily}
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

interface RenderOnePageInput {
  settings: Settings
  pageLines: ReadonlyArray<WrappedLine>
  fonts: ReadonlyArray<SatoriFont>
  width: number
  height: number
  highlightSet: ReadonlySet<number>
  lineNumberWidth: number
  totalSourceLines: number
}

const renderOnePage = async ({
  settings,
  pageLines,
  fonts,
  width,
  height,
  highlightSet,
  lineNumberWidth,
  totalSourceLines,
}: RenderOnePageInput): Promise<string> => {
  const {
    codeFont,
    fontSize,
    lineHeight,
    paddingX,
    paddingY,
    windowColor,
    chrome,
    chromeStyle,
    filename,
    radius,
    outerMargin,
    windowShadow,
    lineNumbers,
    highlightColor,
  } = settings

  const lineHeightPx = Math.round(fontSize * lineHeight)
  const chromeHeight = chrome ? Math.max(28, Math.round(fontSize * 1.1)) : 0
  const fallbackColor = '#d6deeb'
  const backgroundStyle = buildBackground(settings)
  const shadow = buildShadow(windowShadow)

  const tree = (
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
        }}
      >
        {chrome &&
          renderChrome(
            chromeStyle,
            chromeHeight,
            filename,
            fallbackColor,
            codeFont,
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

export interface Page {
  svg: string
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

  if (autoHeight) {
    const computedHeight =
      outerMargin * 2 +
      chromeHeight +
      paddingY * 2 +
      Math.max(1, wrapped.length) * lineHeightPx
    const svg = await renderOnePage({
      settings,
      pageLines: wrapped,
      fonts,
      width,
      height: computedHeight,
      highlightSet,
      lineNumberWidth,
      totalSourceLines,
    })
    return {
      pages: [{ svg, pageIndex: 0, width, height: computedHeight }],
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

  const pages = await Promise.all(
    Array.from({ length: totalPages }, async (_, i): Promise<Page> => {
      const start = i * linesPerPage
      const slice = wrapped.slice(start, start + linesPerPage)
      const svg = await renderOnePage({
        settings,
        pageLines: slice,
        fonts,
        width,
        height,
        highlightSet,
        lineNumberWidth,
        totalSourceLines,
      })
      return { svg, pageIndex: i, width, height }
    }),
  )

  return {
    pages,
    width,
    height,
    totalPages,
    totalLines: wrapped.length,
    linesPerPage,
  }
}
