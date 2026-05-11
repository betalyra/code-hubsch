import { useEffect, useMemo, useRef, useState } from 'react'
import { tokenize } from '#/lib/shiki'
import {
  CODE_FONTS,
  type Language,
  type Theme,
  type TokenLine,
} from '#/lib/types'
import { formatLineRanges, parseLineRanges } from '#/lib/wrap'

interface Props {
  code: string
  language: Language
  theme: Theme
  codeFont: string
  fontSize: number
  lineHeight: number
  windowColor: string
  fallbackColor: string
  highlightedLines: string
  highlightColor: string
  ligatures: boolean
  onChange: (code: string) => void
  onHighlightChange: (next: string) => void
}

const fontFamilyFor = (font: string): string =>
  CODE_FONTS.find((f) => f.value === font)?.cssFamily ?? font

const overlayColor = (hex: string): string => {
  const m = hex.match(/^#?([0-9a-fA-F]{6})$/)
  if (m) return `#${m[1]}33`
  return hex
}

export function Editor({
  code,
  language,
  theme,
  codeFont,
  fontSize,
  lineHeight,
  windowColor,
  fallbackColor,
  highlightedLines,
  highlightColor,
  ligatures,
  onChange,
  onHighlightChange,
}: Props) {
  const HIGHLIGHT_BG = overlayColor(highlightColor)
  const [lines, setLines] = useState<ReadonlyArray<TokenLine>>([])
  const taRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const gutterInnerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    tokenize(code, language, theme).then((result) => {
      if (!cancelled) setLines(result)
    })
    return () => {
      cancelled = true
    }
  }, [code, language, theme])

  const fontFamily = useMemo(() => fontFamilyFor(codeFont), [codeFont])
  const fontHasLigatures = useMemo(
    () => CODE_FONTS.find((f) => f.value === codeFont)?.ligatures ?? false,
    [codeFont],
  )
  // ss01–ss08 are needed for fonts (Monaspace family) that ship their
  // programming ligatures as stylistic sets rather than `liga`/`calt`.
  const fontFeatureSettings =
    ligatures && fontHasLigatures
      ? '"liga" 1, "calt" 1, "ss01", "ss02", "ss03", "ss04", "ss05", "ss06", "ss07", "ss08"'
      : '"liga" 0, "calt" 0'
  const lineHeightPx = Math.round(fontSize * lineHeight)
  const padding = 20
  const lineCount = Math.max(code.split('\n').length, lines.length)
  const digits = Math.max(2, String(Math.max(1, lineCount)).length)
  // Line-number column uses the same fontSize as the code so baselines
  // align across the two columns. Width is glyph-count × half-em + a
  // small right gutter.
  const lineNumberWidth = Math.ceil(digits * fontSize * 0.6) + 8
  const toggleWidth = 24
  const gutterWidth = toggleWidth + lineNumberWidth + 4

  const highlightSet = useMemo(
    () => new Set(parseLineRanges(highlightedLines)),
    [highlightedLines],
  )

  const toggleLine = (n: number): void => {
    const next = new Set(highlightSet)
    if (next.has(n)) next.delete(n)
    else next.add(n)
    onHighlightChange(formatLineRanges(Array.from(next)))
  }

  const sharedTextStyle: React.CSSProperties = {
    fontFamily,
    fontSize,
    lineHeight: `${lineHeightPx}px`,
    padding,
    margin: 0,
    border: 0,
    whiteSpace: 'pre',
    tabSize: 2,
    fontFeatureSettings,
  }

  const handleScroll = (): void => {
    const ta = taRef.current
    const pre = preRef.current
    const gutter = gutterInnerRef.current
    if (ta) {
      if (pre) {
        pre.style.transform = `translate(${-ta.scrollLeft}px, ${-ta.scrollTop}px)`
      }
      if (gutter) {
        gutter.style.transform = `translateY(${-ta.scrollTop}px)`
      }
    }
  }

  const handlePaste = (): void => {
    if (highlightedLines !== '') onHighlightChange('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const next = `${code.slice(0, start)}  ${code.slice(end)}`
      onChange(next)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2
      })
    }
  }

  return (
    <div
      className="relative flex h-56 w-full overflow-hidden rounded-xl border border-white/10 sm:h-72 lg:h-80"
      style={{ backgroundColor: windowColor }}
    >
      <div
        className="relative h-full shrink-0 overflow-hidden border-r border-white/5"
        style={{
          width: gutterWidth,
          paddingTop: padding,
        }}
      >
        <div
          ref={gutterInnerRef}
          className="will-change-transform"
          style={{ height: lineCount * lineHeightPx }}
        >
          {Array.from({ length: lineCount }).map((_, i) => {
            const ln = i + 1
            const on = highlightSet.has(ln)
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: stable
                key={i}
                style={{
                  height: lineHeightPx,
                  fontFamily,
                  fontSize,
                  lineHeight: `${lineHeightPx}px`,
                }}
              >
                <button
                  type="button"
                  aria-label={`toggle highlight for line ${ln}`}
                  onClick={() => toggleLine(ln)}
                  style={{
                    width: toggleWidth,
                    height: lineHeightPx,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    verticalAlign: 'top',
                  }}
                  className="group/bubble"
                >
                  <span
                    className={
                      on
                        ? 'block size-2.5 rounded-full shadow-[0_0_0_2px_rgba(0,0,0,0.4)]'
                        : 'block size-2 rounded-full border border-white/25 bg-transparent transition-colors group-hover/bubble:bg-white/15'
                    }
                    style={on ? { backgroundColor: highlightColor } : undefined}
                  />
                </button>
                <span
                  style={{
                    display: 'inline-block',
                    width: lineNumberWidth,
                    paddingRight: 8,
                    color: fallbackColor,
                    opacity: 0.45,
                    textAlign: 'right',
                  }}
                  className="tabular-nums"
                >
                  {ln}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <pre
          ref={preRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 will-change-transform"
          style={{
            ...sharedTextStyle,
            color: fallbackColor,
          }}
        >
          {Array.from({ length: lineCount }).map((_, lineIndex) => {
            const line = lines[lineIndex]
            const ln = lineIndex + 1
            const on = highlightSet.has(ln)
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: stable
                key={lineIndex}
                style={{
                  height: lineHeightPx,
                  marginLeft: -padding,
                  marginRight: -padding,
                  paddingLeft: padding,
                  paddingRight: padding,
                  backgroundColor: on ? HIGHLIGHT_BG : 'transparent',
                }}
              >
                {line === undefined || line.length === 0 ? (
                  <span> </span>
                ) : (
                  line.map((token, tokenIndex) => (
                    <span
                      // biome-ignore lint/suspicious/noArrayIndexKey: stable
                      key={`${lineIndex}-${tokenIndex}`}
                      style={{
                        color: token.color ?? fallbackColor,
                        fontStyle: token.fontStyle === 1 ? 'italic' : 'normal',
                        fontWeight: token.fontStyle === 2 ? 500 : 400,
                      }}
                    >
                      {token.content}
                    </span>
                  ))
                )}
              </div>
            )
          })}
        </pre>

        <textarea
          ref={taRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          wrap="off"
          className="absolute inset-0 h-full w-full resize-none bg-transparent outline-none"
          style={{
            ...sharedTextStyle,
            color: 'transparent',
            caretColor: fallbackColor,
          }}
        />
      </div>
    </div>
  )
}
