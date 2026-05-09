import {
  type BundledLanguage,
  type BundledTheme,
  type HighlighterGeneric,
  createHighlighter,
} from 'shiki'
import type { Language, Theme, TokenLine } from './types'

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

const INITIAL_LANGS: ReadonlyArray<Language> = ['ts', 'tsx', 'js', 'json']

const SHIKI_LANG_ALIAS: Partial<Record<Language, BundledLanguage>> = {
  docker: 'dockerfile' as BundledLanguage,
}

const toShikiLang = (lang: Language): BundledLanguage =>
  (SHIKI_LANG_ALIAS[lang] ?? lang) as BundledLanguage

let highlighterPromise:
  | Promise<HighlighterGeneric<BundledLanguage, BundledTheme>>
  | undefined
const loaded = new Set<BundledLanguage>()

export const getHighlighter = (): Promise<
  HighlighterGeneric<BundledLanguage, BundledTheme>
> => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      langs: INITIAL_LANGS.map(toShikiLang) as Array<BundledLanguage>,
      themes: [...THEME_VALUES] as Array<BundledTheme>,
    }).then((h) => {
      for (const l of INITIAL_LANGS) loaded.add(toShikiLang(l))
      return h
    })
  }
  return highlighterPromise
}

const ensureLanguage = async (
  highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>,
  lang: Language,
): Promise<void> => {
  const shikiLang = toShikiLang(lang)
  if (loaded.has(shikiLang)) return
  await highlighter.loadLanguage(shikiLang)
  loaded.add(shikiLang)
}

export const tokenize = async (
  code: string,
  language: Language,
  theme: Theme,
): Promise<ReadonlyArray<TokenLine>> => {
  const highlighter = await getHighlighter()
  await ensureLanguage(highlighter, language)
  return highlighter.codeToTokensBase(code, {
    lang: toShikiLang(language),
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
