// Small utilities for building deterministic, collision-resistant download names.
//
// Every artifact gets a base name (derived from the user's filename setting,
// falling back to "code") plus a 6-char hash derived from the content + the
// settings that affect the rendered output. Same code + same settings → same
// hash → safely overwrites itself. Any change → new hash → new file.

export const baseFilename = (input: string): string => {
  const trimmed = input.trim()
  if (!trimmed) return 'code'
  const stripped = trimmed.replace(/\.[a-z0-9]+$/i, '')
  const safe = stripped
    .replace(/[^a-z0-9._-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
  return safe || 'code'
}

// FNV-1a 32-bit, base-36 encoded, 6 chars. Fast, dependency-free, more than
// enough for a per-user cache-buster.
export const shortHash = (input: string): string => {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36).padStart(6, '0').slice(-6)
}

export const buildDownloadName = (
  baseInput: string,
  contentForHash: string,
  ext: string,
): string => {
  const base = baseFilename(baseInput)
  const tag = shortHash(contentForHash)
  return `${base}-${tag}.${ext}`
}
