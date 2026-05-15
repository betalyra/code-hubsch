import {
  base64ToBytes,
  findCustomFont,
  subscribeCustomFonts,
} from './customFonts'
import type { CodeFont } from './types'

// Each variant is loaded lazily via a dynamic import of the woff file as an
// inlined data URL. Vite emits one JS chunk per import, so the woff bytes
// only travel to the browser when the user picks (or hovers) the font.
// `?inline` is used (instead of `?url`) because TanStack Router intercepts
// any request to /node_modules/... and 404s before Vite can serve it.

type WoffModule = { default: string }
type WoffLoader = () => Promise<WoffModule>

interface FontVariant {
  readonly load: WoffLoader
  readonly weight: 400 | 500
  readonly style: 'normal' | 'italic'
}

const REGISTRY: Record<CodeFont, ReadonlyArray<FontVariant>> = {
  'IBM Plex Mono': [
    { load: () => import('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'JetBrains Mono': [
    { load: () => import('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Fira Code': [
    { load: () => import('@fontsource/fira-code/files/fira-code-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/fira-code/files/fira-code-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Geist Mono': [
    { load: () => import('@fontsource/geist-mono/files/geist-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/geist-mono/files/geist-mono-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Source Code Pro': [
    { load: () => import('@fontsource/source-code-pro/files/source-code-pro-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/source-code-pro/files/source-code-pro-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/source-code-pro/files/source-code-pro-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Roboto Mono': [
    { load: () => import('@fontsource/roboto-mono/files/roboto-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/roboto-mono/files/roboto-mono-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/roboto-mono/files/roboto-mono-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Space Mono': [
    { load: () => import('@fontsource/space-mono/files/space-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/space-mono/files/space-mono-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
  ],
  Inconsolata: [
    { load: () => import('@fontsource/inconsolata/files/inconsolata-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/inconsolata/files/inconsolata-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Anonymous Pro': [
    { load: () => import('@fontsource/anonymous-pro/files/anonymous-pro-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/anonymous-pro/files/anonymous-pro-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
  ],
  'Ubuntu Mono': [
    { load: () => import('@fontsource/ubuntu-mono/files/ubuntu-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/ubuntu-mono/files/ubuntu-mono-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
  ],
  'DM Mono': [
    { load: () => import('@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/dm-mono/files/dm-mono-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/dm-mono/files/dm-mono-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Fira Mono': [
    { load: () => import('@fontsource/fira-mono/files/fira-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/fira-mono/files/fira-mono-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  Cousine: [
    { load: () => import('@fontsource/cousine/files/cousine-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/cousine/files/cousine-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
  ],
  'Victor Mono': [
    { load: () => import('@fontsource/victor-mono/files/victor-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/victor-mono/files/victor-mono-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/victor-mono/files/victor-mono-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Commit Mono': [
    { load: () => import('@fontsource/commit-mono/files/commit-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/commit-mono/files/commit-mono-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/commit-mono/files/commit-mono-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Maple Mono': [
    { load: () => import('@fontsource/maple-mono/files/maple-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/maple-mono/files/maple-mono-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/maple-mono/files/maple-mono-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  Lilex: [
    { load: () => import('@fontsource/lilex/files/lilex-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/lilex/files/lilex-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/lilex/files/lilex-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Monaspace Argon': [
    { load: () => import('@fontsource/monaspace-argon/files/monaspace-argon-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/monaspace-argon/files/monaspace-argon-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/monaspace-argon/files/monaspace-argon-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Monaspace Krypton': [
    { load: () => import('@fontsource/monaspace-krypton/files/monaspace-krypton-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/monaspace-krypton/files/monaspace-krypton-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/monaspace-krypton/files/monaspace-krypton-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Monaspace Neon': [
    { load: () => import('@fontsource/monaspace-neon/files/monaspace-neon-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/monaspace-neon/files/monaspace-neon-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/monaspace-neon/files/monaspace-neon-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  Iosevka: [
    { load: () => import('@fontsource/iosevka/files/iosevka-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/iosevka/files/iosevka-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/iosevka/files/iosevka-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Intel One Mono': [
    { load: () => import('@fontsource/intel-one-mono/files/intel-one-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/intel-one-mono/files/intel-one-mono-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/intel-one-mono/files/intel-one-mono-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Martian Mono': [
    { load: () => import('@fontsource/martian-mono/files/martian-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/martian-mono/files/martian-mono-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Red Hat Mono': [
    { load: () => import('@fontsource/red-hat-mono/files/red-hat-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/red-hat-mono/files/red-hat-mono-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/red-hat-mono/files/red-hat-mono-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'B612 Mono': [
    { load: () => import('@fontsource/b612-mono/files/b612-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/b612-mono/files/b612-mono-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
  ],
  'Kode Mono': [
    { load: () => import('@fontsource/kode-mono/files/kode-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/kode-mono/files/kode-mono-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Overpass Mono': [
    { load: () => import('@fontsource/overpass-mono/files/overpass-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/overpass-mono/files/overpass-mono-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Spline Sans Mono': [
    { load: () => import('@fontsource/spline-sans-mono/files/spline-sans-mono-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/spline-sans-mono/files/spline-sans-mono-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/spline-sans-mono/files/spline-sans-mono-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
  'Google Sans Code': [
    { load: () => import('@fontsource/google-sans-code/files/google-sans-code-latin-400-normal.woff?inline'), weight: 400, style: 'normal' },
    { load: () => import('@fontsource/google-sans-code/files/google-sans-code-latin-400-italic.woff?inline'), weight: 400, style: 'italic' },
    { load: () => import('@fontsource/google-sans-code/files/google-sans-code-latin-500-normal.woff?inline'), weight: 500, style: 'normal' },
  ],
}

export interface SatoriFont {
  name: string
  data: ArrayBuffer
  weight: 400 | 500
  style: 'normal' | 'italic'
}

export type FontStatus = 'idle' | 'loading' | 'loaded' | 'error'

const statuses = new Map<string, FontStatus>()
const listeners = new Set<() => void>()

const notify = () => {
  for (const l of listeners) l()
}

export const getFontStatus = (font: string): FontStatus =>
  statuses.get(font) ?? 'idle'

export const subscribeFontStatus = (cb: () => void): (() => void) => {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

const bufferCache = new WeakMap<WoffLoader, Promise<ArrayBuffer>>()
const registeredFaces = new WeakSet<WoffLoader>()

const fetchBuffer = (variant: FontVariant): Promise<ArrayBuffer> => {
  let cached = bufferCache.get(variant.load)
  if (!cached) {
    cached = variant
      .load()
      .then((mod) => fetch(mod.default))
      .then((r) => {
        if (!r.ok) throw new Error('Failed to decode font data URL')
        return r.arrayBuffer()
      })
    bufferCache.set(variant.load, cached)
  }
  return cached
}

const loadVariant = async (
  font: string,
  variant: FontVariant,
): Promise<SatoriFont> => {
  const buffer = await fetchBuffer(variant)
  if (
    !registeredFaces.has(variant.load) &&
    typeof document !== 'undefined' &&
    'fonts' in document
  ) {
    try {
      const face = new FontFace(font, buffer, {
        weight: String(variant.weight),
        style: variant.style,
      })
      await face.load()
      document.fonts.add(face)
      registeredFaces.add(variant.load)
    } catch {
      // Non-fatal: Satori still works via the binary buffer; only the DOM
      // preview path loses this variant.
    }
  }
  return {
    name: font,
    data: buffer,
    weight: variant.weight,
    style: variant.style,
  }
}

const loadPromises = new Map<string, Promise<ReadonlyArray<SatoriFont>>>()

// Custom fonts can be added, replaced, or removed at any time; invalidate
// any cached promise/status for non-built-in names so the next consumer
// re-reads from storage.
subscribeCustomFonts(() => {
  for (const name of Array.from(loadPromises.keys())) {
    if (!(name in REGISTRY)) {
      loadPromises.delete(name)
      statuses.delete(name)
    }
  }
  notify()
})

const isBuiltIn = (font: string): font is CodeFont => font in REGISTRY

const loadCustomVariants = async (
  font: string,
): Promise<ReadonlyArray<SatoriFont>> => {
  const entry = findCustomFont(font)
  if (!entry) throw new Error(`Unknown custom font: ${font}`)
  return Promise.all(
    entry.variants.map(async (v) => {
      const buffer = base64ToBytes(v.data)
      if (typeof document !== 'undefined' && 'fonts' in document) {
        try {
          const face = new FontFace(font, buffer, {
            weight: String(v.weight),
            style: v.style,
          })
          await face.load()
          document.fonts.add(face)
        } catch {
          // Non-fatal: Satori path still works via the buffer.
        }
      }
      return { name: font, data: buffer, weight: v.weight, style: v.style }
    }),
  )
}

export const loadCodeFont = async (
  font: string,
): Promise<ReadonlyArray<SatoriFont>> => {
  const existing = loadPromises.get(font)
  if (existing) return existing
  statuses.set(font, 'loading')
  notify()
  const promise = (
    isBuiltIn(font)
      ? Promise.all(REGISTRY[font].map((v) => loadVariant(font, v)))
      : loadCustomVariants(font)
  )
    .then((result) => {
      statuses.set(font, 'loaded')
      notify()
      return result
    })
    .catch((e) => {
      statuses.set(font, 'error')
      notify()
      loadPromises.delete(font)
      throw e
    })
  loadPromises.set(font, promise)
  return promise
}
