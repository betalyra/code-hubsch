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
  const lineHeightPx = Math.round(fontSize * lineHeight)
  const padding = 20
  const lineCount = Math.max(code.split('\n').length, lines.length)

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
      className="relative flex w-full overflow-hidden rounded-xl border border-white/10"
      style={{ height: 320, backgroundColor: windowColor }}
    >
      <div
        className="relative h-full shrink-0 overflow-hidden border-r border-white/5"
        style={{ width: 36, paddingTop: padding }}
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
              <button
                // biome-ignore lint/suspicious/noArrayIndexKey: stable
                key={i}
                type="button"
                aria-label={`toggle highlight for line ${ln}`}
                onClick={() => toggleLine(ln)}
                style={{
                  height: lineHeightPx,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
