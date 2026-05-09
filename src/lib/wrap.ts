import type { Token, TokenLine } from './types'

const HANGING_INDENT = 2

export interface WrappedLine {
  tokens: ReadonlyArray<Token>
  sourceLine: number
}

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
): ReadonlyArray<WrappedLine> => {
  if (maxChars < 10) maxChars = 10

  const out: WrappedLine[] = []

  for (let sourceLine = 0; sourceLine < lines.length; sourceLine += 1) {
    const line = lines[sourceLine] as TokenLine
    if (line.length === 0) {
      out.push({ tokens: [], sourceLine })
      continue
    }

    const indent = Math.min(leadingIndent(line), maxChars - HANGING_INDENT - 4)
    const continuationPrefix = ' '.repeat(Math.max(0, indent + HANGING_INDENT))
    let current: Token[] = []
    let col = 0

    const flush = (): void => {
      out.push({ tokens: current, sourceLine })
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
          flush()
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
          flush()
        }
      }
    }

    out.push({ tokens: current, sourceLine })
  }

  return out
}

export const formatLineRanges = (numbers: ReadonlyArray<number>): string => {
  if (numbers.length === 0) return ''
  const sorted = Array.from(new Set(numbers))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b)
  if (sorted.length === 0) return ''
  const groups: string[] = []
  let start = sorted[0] as number
  let end = start
  for (let i = 1; i < sorted.length; i += 1) {
    const n = sorted[i] as number
    if (n === end + 1) {
      end = n
    } else {
      groups.push(start === end ? `${start}` : `${start}-${end}`)
      start = n
      end = n
    }
  }
  groups.push(start === end ? `${start}` : `${start}-${end}`)
  return groups.join(', ')
}

export const parseLineRanges = (input: string): ReadonlyArray<number> => {
  const out = new Set<number>()
  for (const part of input.split(/[,\s]+/).filter(Boolean)) {
    const match = part.match(/^(\d+)(?:[-–](\d+))?$/)
    if (!match) continue
    const a = Number(match[1])
    const b = match[2] ? Number(match[2]) : a
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    for (let i = lo; i <= hi; i += 1) out.add(i)
  }
  return Array.from(out).sort((a, b) => a - b)
}
