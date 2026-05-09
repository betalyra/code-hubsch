import { useEffect, useMemo, useRef, useState } from 'react'
import { tokenize } from '#/lib/shiki'
import { CODE_FONTS, type Language, type Theme, type TokenLine } from '#/lib/types'

interface Props {
  code: string
  language: Language
  theme: Theme
  codeFont: string
  fontSize: number
  lineHeight: number
  windowColor: string
  fallbackColor: string
  onChange: (code: string) => void
}

const fontFamilyFor = (font: string): string =>
  CODE_FONTS.find((f) => f.value === font)?.cssFamily ?? font

export function Editor({
  code,
  language,
  theme,
  codeFont,
  fontSize,
  lineHeight,
  windowColor,
  fallbackColor,
  onChange,
}: Props) {
  const [lines, setLines] = useState<ReadonlyArray<TokenLine>>([])
  const taRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)

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
    if (ta && pre) {
      pre.style.transform = `translate(${-ta.scrollLeft}px, ${-ta.scrollTop}px)`
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
      className="relative w-full overflow-hidden rounded-xl border border-white/10"
      style={{ height: 320, backgroundColor: windowColor }}
    >
      <pre
        ref={preRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 will-change-transform"
        style={{
          ...sharedTextStyle,
          color: fallbackColor,
        }}
      >
        {lines.map((line, lineIndex) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: stable
            key={lineIndex}
            style={{ height: lineHeightPx }}
          >
            {line.length === 0 ? (
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
        ))}
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
  )
}
