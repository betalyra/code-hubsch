import ibmRegular from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff?inline'
import ibmItalic from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-italic.woff?inline'
import ibmMedium from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff?inline'

import jetRegular from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff?inline'
import jetItalic from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-italic.woff?inline'
import jetMedium from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff?inline'

import firaRegular from '@fontsource/fira-code/files/fira-code-latin-400-normal.woff?inline'
import firaMedium from '@fontsource/fira-code/files/fira-code-latin-500-normal.woff?inline'

import geistRegular from '@fontsource/geist-mono/files/geist-mono-latin-400-normal.woff?inline'
import geistMedium from '@fontsource/geist-mono/files/geist-mono-latin-500-normal.woff?inline'

import type { CodeFont } from './types'

interface FontVariant {
  readonly url: string
  readonly weight: 400 | 500
  readonly style: 'normal' | 'italic'
}

const REGISTRY: Record<CodeFont, ReadonlyArray<FontVariant>> = {
  'IBM Plex Mono': [
    { url: ibmRegular, weight: 400, style: 'normal' },
    { url: ibmItalic, weight: 400, style: 'italic' },
    { url: ibmMedium, weight: 500, style: 'normal' },
  ],
  'JetBrains Mono': [
    { url: jetRegular, weight: 400, style: 'normal' },
    { url: jetItalic, weight: 400, style: 'italic' },
    { url: jetMedium, weight: 500, style: 'normal' },
  ],
  'Fira Code': [
    { url: firaRegular, weight: 400, style: 'normal' },
    { url: firaMedium, weight: 500, style: 'normal' },
  ],
  'Geist Mono': [
    { url: geistRegular, weight: 400, style: 'normal' },
    { url: geistMedium, weight: 500, style: 'normal' },
  ],
}

const bufferCache = new Map<string, Promise<ArrayBuffer>>()

const fetchBuffer = (url: string): Promise<ArrayBuffer> => {
  let cached = bufferCache.get(url)
  if (!cached) {
    cached = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`Failed to load font: ${url}`)
      return r.arrayBuffer()
    })
    bufferCache.set(url, cached)
  }
  return cached
}

export interface SatoriFont {
  name: string
  data: ArrayBuffer
  weight: 400 | 500
  style: 'normal' | 'italic'
}

export const loadCodeFont = async (
  font: CodeFont,
): Promise<ReadonlyArray<SatoriFont>> => {
  const variants = REGISTRY[font]
  const buffers = await Promise.all(variants.map((v) => fetchBuffer(v.url)))
  return variants.map((variant, i) => ({
    name: font,
    data: buffers[i] as ArrayBuffer,
    weight: variant.weight,
    style: variant.style,
  }))
}
