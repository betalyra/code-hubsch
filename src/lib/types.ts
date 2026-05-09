export type Language =
  | 'ts'
  | 'tsx'
  | 'js'
  | 'jsx'
  | 'json'
  | 'html'
  | 'css'
  | 'bash'
  | 'md'

export type Theme =
  | 'one-dark-pro'
  | 'github-dark'
  | 'github-light'
  | 'dracula'
  | 'nord'
  | 'vitesse-dark'
  | 'vitesse-light'
  | 'catppuccin-mocha'
  | 'rose-pine'

export type CodeFont =
  | 'IBM Plex Mono'
  | 'JetBrains Mono'
  | 'Geist Mono'
  | 'Fira Code'

export interface Token {
  readonly content: string
  readonly color?: string
  readonly fontStyle?: number
}

export type TokenLine = ReadonlyArray<Token>

export interface Settings {
  code: string
  language: Language
  theme: Theme
  codeFont: CodeFont
  width: number
  height: number
  fontSize: number
  lineHeight: number
  paddingX: number
  paddingY: number
  background: string
  transparentBackground: boolean
  windowColor: string
  chrome: boolean
  radius: number
}

export interface SizePreset {
  readonly id: string
  readonly label: string
  readonly width: number
  readonly height: number
}

export const SIZE_PRESETS: ReadonlyArray<SizePreset> = [
  { id: '1600x900', label: '1600×900', width: 1600, height: 900 },
  { id: '1200x675', label: '1200×675', width: 1200, height: 675 },
  { id: '1080', label: '1080²', width: 1080, height: 1080 },
  { id: 'og', label: 'OG 1200×630', width: 1200, height: 630 },
]

export interface AppearancePreset {
  readonly id: string
  readonly label: string
  readonly theme: Theme
  readonly windowColor: string
  readonly background: string
}

export const APPEARANCE_PRESETS: ReadonlyArray<AppearancePreset> = [
  {
    id: 'midnight',
    label: 'Midnight',
    theme: 'one-dark-pro',
    windowColor: '#1f2430',
    background: '#0b0f14',
  },
  {
    id: 'paper',
    label: 'Paper',
    theme: 'vitesse-light',
    windowColor: '#ffffff',
    background: '#f5f1e8',
  },
  {
    id: 'mocha',
    label: 'Mocha',
    theme: 'catppuccin-mocha',
    windowColor: '#1e1e2e',
    background: '#11111b',
  },
  {
    id: 'dracula',
    label: 'Dracula',
    theme: 'dracula',
    windowColor: '#282a36',
    background: '#191a21',
  },
  {
    id: 'nord',
    label: 'Nord',
    theme: 'nord',
    windowColor: '#2e3440',
    background: '#1e222b',
  },
  {
    id: 'rosepine',
    label: 'Rosé Pine',
    theme: 'rose-pine',
    windowColor: '#191724',
    background: '#0f0d18',
  },
  {
    id: 'daylight',
    label: 'Daylight',
    theme: 'github-light',
    windowColor: '#ffffff',
    background: '#e5e7eb',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    theme: 'one-dark-pro',
    windowColor: '#1f1726',
    background: '#ff7a59',
  },
]

export const LANGUAGES: ReadonlyArray<{ value: Language; label: string }> = [
  { value: 'ts', label: 'TypeScript' },
  { value: 'tsx', label: 'TSX' },
  { value: 'js', label: 'JavaScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'json', label: 'JSON' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'bash', label: 'Bash' },
  { value: 'md', label: 'Markdown' },
]

export const THEMES: ReadonlyArray<{ value: Theme; label: string }> = [
  { value: 'one-dark-pro', label: 'One Dark Pro' },
  { value: 'github-dark', label: 'GitHub Dark' },
  { value: 'github-light', label: 'GitHub Light' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'nord', label: 'Nord' },
  { value: 'vitesse-dark', label: 'Vitesse Dark' },
  { value: 'vitesse-light', label: 'Vitesse Light' },
  { value: 'catppuccin-mocha', label: 'Catppuccin Mocha' },
  { value: 'rose-pine', label: 'Rosé Pine' },
]

export const CODE_FONTS: ReadonlyArray<{ value: CodeFont; cssFamily: string }> = [
  { value: 'IBM Plex Mono', cssFamily: '"IBM Plex Mono", monospace' },
  { value: 'JetBrains Mono', cssFamily: '"JetBrains Mono", monospace' },
  { value: 'Geist Mono', cssFamily: '"Geist Mono", monospace' },
  { value: 'Fira Code', cssFamily: '"Fira Code", monospace' },
]
