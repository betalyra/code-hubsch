import {
  type BundledLanguage,
  type BundledTheme,
  type HighlighterGeneric,
  createHighlighter,
} from 'shiki'
import type { Language, Theme, TokenLine } from './types'

const LANGS: ReadonlyArray<Language> = [
  'ts',
  'tsx',
  'js',
  'jsx',
  'json',
  'html',
  'css',
  'bash',
  'md',
]

const THEME_VALUES: ReadonlyArray<Theme> = [
  'one-dark-pro',
  'github-dark',
  'github-light',
  'dracula',
  'nord',
  'vitesse-dark',
  'vitesse-light',
  'catppuccin-mocha',
  'rose-pine',
]

let highlighterPromise:
  | Promise<HighlighterGeneric<BundledLanguage, BundledTheme>>
  | undefined

export const getHighlighter = (): Promise<
  HighlighterGeneric<BundledLanguage, BundledTheme>
> => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      langs: [...LANGS] as Array<BundledLanguage>,
      themes: [...THEME_VALUES] as Array<BundledTheme>,
    })
  }
  return highlighterPromise
}

export const tokenize = async (
  code: string,
  language: Language,
  theme: Theme,
): Promise<ReadonlyArray<TokenLine>> => {
  const highlighter = await getHighlighter()
  return highlighter.codeToTokensBase(code, {
    lang: language as BundledLanguage,
    theme: theme as BundledTheme,
  }) as ReadonlyArray<TokenLine>
}

export const themeColors = async (
  theme: Theme,
): Promise<{ fg: string; bg: string }> => {
  const highlighter = await getHighlighter()
  const t = highlighter.getTheme(theme as BundledTheme)
  return { fg: t.fg ?? '#d6deeb', bg: t.bg ?? '#1f2430' }
}
