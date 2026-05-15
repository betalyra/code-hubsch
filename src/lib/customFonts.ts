// Local custom fonts uploaded by the user. The user picks a font file from
// disk; we read the bytes, persist them to localStorage as base64, and make
// the font available to both render paths:
//   * DOM preview — registered via FontFace on document.fonts
//   * Satori export — surfaced through loadCodeFont in fonts.ts
//
// Storage is intentionally simple (one localStorage key, base64 payload).
// Browser monospace fonts in woff/woff2 are typically well under the ~5 MB
// localStorage quota even at a few entries. If the quota is exceeded the
// save throws and the upload is reported as failed.

export type CustomFontStyle = 'normal' | 'italic'
export type CustomFontWeight = 400 | 500

export interface CustomFontVariant {
  readonly weight: CustomFontWeight
  readonly style: CustomFontStyle
  readonly data: string // base64-encoded font bytes
  readonly mime: string
}

export interface CustomFont {
  readonly name: string
  readonly variants: ReadonlyArray<CustomFontVariant>
}

const STORAGE_KEY = 'code-pretty:custom-fonts:v1'

const listeners = new Set<() => void>()
let cache: ReadonlyArray<CustomFont> | undefined

const notify = (): void => {
  for (const l of listeners) l()
}

const readStorage = (): ReadonlyArray<CustomFont> => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as ReadonlyArray<CustomFont>
  } catch {
    return []
  }
}

const writeStorage = (fonts: ReadonlyArray<CustomFont>): void => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fonts))
}

export const listCustomFonts = (): ReadonlyArray<CustomFont> => {
  if (cache === undefined) cache = readStorage()
  return cache
}

export const subscribeCustomFonts = (cb: () => void): (() => void) => {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export const findCustomFont = (name: string): CustomFont | undefined =>
  listCustomFonts().find((f) => f.name === name)

export const cssFamilyFor = (name: string): string =>
  `"${name.replace(/"/g, '\\"')}", monospace`

const replaceAll = (next: ReadonlyArray<CustomFont>): void => {
  writeStorage(next)
  cache = next
  notify()
}

export const addCustomFont = (font: CustomFont): void => {
  const rest = listCustomFonts().filter((f) => f.name !== font.name)
  replaceAll([...rest, font])
}

export const removeCustomFont = (name: string): void => {
  replaceAll(listCustomFonts().filter((f) => f.name !== name))
}

const bytesToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  // Chunked to avoid String.fromCharCode argument-count limits on large files.
  const chunkSize = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

export const base64ToBytes = (b64: string): ArrayBuffer => {
  const binary = atob(b64)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
  return out.buffer
}

const mimeFor = (filename: string): string => {
  const ext = filename.toLowerCase().split('.').pop() ?? ''
  if (ext === 'woff2') return 'font/woff2'
  if (ext === 'woff') return 'font/woff'
  if (ext === 'otf') return 'font/otf'
  return 'font/ttf'
}

const stripExt = (filename: string): string =>
  filename.replace(/\.(woff2?|otf|ttf)$/i, '').trim()

export interface ReadFileResult {
  readonly defaultName: string
  readonly variant: CustomFontVariant
}

export const readFontFile = async (file: File): Promise<ReadFileResult> => {
  const buffer = await file.arrayBuffer()
  return {
    defaultName: stripExt(file.name),
    variant: {
      weight: 400,
      style: 'normal',
      data: bytesToBase64(buffer),
      mime: mimeFor(file.name),
    },
  }
}
