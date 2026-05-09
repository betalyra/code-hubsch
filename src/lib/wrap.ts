import type { Token, TokenLine } from './types'

const HANGING_INDENT = 2

const leadingIndent = (line: TokenLine): number => {
  let count = 0
  for (const token of line) {
    for (const ch of token.content) {
      if (ch === ' ') count += 1
      else if (ch === '\t') count += 2
      else return count
    }
  }
  return count
}

export const wrapLines = (
  lines: ReadonlyArray<TokenLine>,
  maxChars: number,
): ReadonlyArray<TokenLine> => {
  if (maxChars < 10) maxChars = 10

  const out: Token[][] = []

  for (const line of lines) {
    if (line.length === 0) {
      out.push([])
      continue
    }

    const indent = Math.min(leadingIndent(line), maxChars - HANGING_INDENT - 4)
    const continuationPrefix = ' '.repeat(Math.max(0, indent + HANGING_INDENT))
    let current: Token[] = []
    let col = 0

    const startContinuation = (): void => {
      out.push(current)
      current = []
      if (continuationPrefix.length > 0) {
        current.push({ content: continuationPrefix })
      }
      col = continuationPrefix.length
    }

    for (const token of line) {
      let remaining = token.content
      while (remaining.length > 0) {
        const available = maxChars - col
        if (available <= 0) {
          startContinuation()
          continue
        }
        if (remaining.length <= available) {
          current.push({ ...token, content: remaining })
          col += remaining.length
          remaining = ''
        } else {
          const fit = remaining.slice(0, available)
          current.push({ ...token, content: fit })
          col += fit.length
          remaining = remaining.slice(available)
          startContinuation()
        }
      }
    }

    out.push(current)
  }

  return out
}
