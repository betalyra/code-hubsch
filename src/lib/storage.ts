import type { Settings } from './types'

const STORAGE_KEY = 'code-pretty:settings:v1'

export const loadSettings = (fallback: Settings): Settings => {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<Settings>
    return { ...fallback, ...parsed }
  } catch {
    return fallback
  }
}

export const saveSettings = (settings: Settings): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // ignore quota / serialization errors
  }
}

export const clearSettings = (): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
