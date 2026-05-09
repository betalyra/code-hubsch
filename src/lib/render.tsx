import satori from 'satori'
import { loadCodeFont, type SatoriFont } from './fonts'
import { tokenize } from './shiki'
import type { Settings, TokenLine } from './types'
import { wrapLines } from './wrap'

const MONO_WIDTH_FACTOR = 0.6

const renderTokens = (
  lines: ReadonlyArray<TokenLine>,
  fallbackColor: string,
  lineHeightPx: number,
  fontSize: number,
) =>
  lines.map((line, lineIndex) => (
    <div
      // biome-ignore lint/suspicious/noArrayIndexKey: stable render data
      key={lineIndex}
      style={{ display: 'flex', height: lineHeightPx, fontSize }}
    >
      {line.length === 0 ? (
        <span> </span>
      ) : (
        line.map((token, tokenIndex) => (
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
  ))

const Chrome = ({ height }: { height: number }) => (
  <div
    style={{
      height,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 18,
      gap: 8,
      backgroundColor: 'rgba(255,255,255,0.04)',
      flexShrink: 0,
    }}
  >
    {['#ff5f57', '#ffbd2e', '#28c840'].map((color) => (
      <div
        key={color}
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          backgroundColor: color,
        }}
      />
    ))}
  </div>
)

interface RenderOnePageInput {
  settings: Settings
  pageLines: ReadonlyArray<TokenLine>
  fonts: ReadonlyArray<SatoriFont>
}

const renderOnePage = async ({
  settings,
  pageLines,
  fonts,
}: RenderOnePageInput): Promise<string> => {
  const {
    codeFont,
    width,
    height,
    fontSize,
    lineHeight,
    paddingX,
    paddingY,
    background,
    transparentBackground,
    windowColor,
    chrome,
    radius,
  } = settings

  const lineHeightPx = Math.round(fontSize * lineHeight)
  const chromeHeight = chrome ? Math.max(28, Math.round(fontSize * 1.1)) : 0
  const fallbackColor = '#d6deeb'
  const effectiveBackground = transparentBackground
    ? 'rgba(0,0,0,0)'
    : background

  const tree = (
    <div
      style={{
        width,
        height,
        display: 'flex',
        backgroundColor: effectiveBackground,
        padding: 0,
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
        }}
      >
        {chrome && <Chrome height={chromeHeight} />}
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
          {renderTokens(pageLines, fallbackColor, lineHeightPx, fontSize)}
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
    fontSize,
    lineHeight,
    paddingX,
    paddingY,
    chrome,
  } = settings

  const tokenLines = await tokenize(code, language, theme)

  const lineHeightPx = Math.round(fontSize * lineHeight)
  const chromeHeight = chrome ? Math.max(28, Math.round(fontSize * 1.1)) : 0
  const charWidth = fontSize * MONO_WIDTH_FACTOR
  const innerWidth = Math.max(40, width - paddingX * 2)
  const maxChars = Math.max(10, Math.floor(innerWidth / charWidth))
  const wrapped = wrapLines(tokenLines, maxChars)

  const innerHeight = Math.max(lineHeightPx, height - paddingY * 2 - chromeHeight)
  const linesPerPage = Math.max(1, Math.floor(innerHeight / lineHeightPx))
  const totalPages = Math.max(1, Math.ceil(wrapped.length / linesPerPage))

  const fonts = await loadCodeFont(codeFont)

  const pages = await Promise.all(
    Array.from({ length: totalPages }, async (_, i): Promise<Page> => {
      const start = i * linesPerPage
      const slice = wrapped.slice(start, start + linesPerPage)
      const svg = await renderOnePage({ settings, pageLines: slice, fonts })
      return { svg, pageIndex: i }
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
