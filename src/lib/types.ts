export type Language =
  // web
  | 'ts'
  | 'tsx'
  | 'js'
  | 'jsx'
  | 'html'
  | 'css'
  | 'scss'
  | 'vue'
  | 'svelte'
  | 'astro'
  // data / docs
  | 'json'
  | 'yaml'
  | 'toml'
  | 'xml'
  | 'md'
  | 'graphql'
  | 'sql'
  // shell / infra
  | 'bash'
  | 'powershell'
  | 'docker'
  | 'makefile'
  | 'hcl'
  // systems
  | 'c'
  | 'cpp'
  | 'rust'
  | 'go'
  | 'zig'
  | 'nim'
  // jvm
  | 'java'
  | 'kotlin'
  | 'scala'
  | 'clojure'
  | 'groovy'
  // .net
  | 'csharp'
  | 'fsharp'
  // functional
  | 'haskell'
  | 'ocaml'
  | 'elm'
  | 'purescript'
  | 'rescript'
  | 'erlang'
  | 'elixir'
  // scripting
  | 'python'
  | 'ruby'
  | 'lua'
  | 'perl'
  | 'php'
  // other
  | 'swift'
  | 'dart'
  | 'r'
  | 'julia'
  | 'solidity'

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

export type BackgroundType = 'solid' | 'linear' | 'radial'

export type ChromeStyle = 'macos' | 'windows' | 'minimal'

export const CHROME_STYLES: ReadonlyArray<{
  value: ChromeStyle
  label: string
}> = [
  { value: 'macos', label: 'macOS' },
  { value: 'windows', label: 'Windows' },
  { value: 'minimal', label: 'Minimal' },
]

export interface Settings {
  code: string
  language: Language
  theme: Theme
  codeFont: CodeFont
  width: number
  height: number
  autoHeight: boolean
  fontSize: number
  lineHeight: number
  paddingX: number
  paddingY: number
  background: string
  backgroundSecondary: string
  backgroundType: BackgroundType
  gradientAngle: number
  transparentBackground: boolean
  windowColor: string
  chrome: boolean
  chromeStyle: ChromeStyle
  filename: string
  radius: number
  outerMargin: number
  windowShadow: number
  lineNumbers: boolean
  highlightedLines: string
  highlightColor: string
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

export interface GradientPreset {
  readonly id: string
  readonly label: string
  readonly from: string
  readonly to: string
  readonly angle: number
}

export const GRADIENT_PRESETS: ReadonlyArray<GradientPreset> = [
  { id: 'aurora', label: 'Aurora', from: '#00c9ff', to: '#92fe9d', angle: 135 },
  { id: 'sunset', label: 'Sunset', from: '#ff7e5f', to: '#feb47b', angle: 135 },
  { id: 'ocean', label: 'Ocean', from: '#2196f3', to: '#6dd5ed', angle: 135 },
  { id: 'lavender', label: 'Lavender', from: '#c471f5', to: '#fa71cd', angle: 135 },
  { id: 'sky', label: 'Sky', from: '#5b86e5', to: '#36d1dc', angle: 135 },
  { id: 'coral', label: 'Coral', from: '#ff5e62', to: '#ff9966', angle: 135 },
  { id: 'plum', label: 'Plum', from: '#654ea3', to: '#eaafc8', angle: 135 },
  { id: 'mojave', label: 'Mojave', from: '#1e3c72', to: '#2a5298', angle: 135 },
]

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
  { value: 'astro', label: 'Astro' },
  { value: 'bash', label: 'Bash' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'clojure', label: 'Clojure' },
  { value: 'css', label: 'CSS' },
  { value: 'dart', label: 'Dart' },
  { value: 'docker', label: 'Dockerfile' },
  { value: 'elixir', label: 'Elixir' },
  { value: 'elm', label: 'Elm' },
  { value: 'erlang', label: 'Erlang' },
  { value: 'fsharp', label: 'F#' },
  { value: 'go', label: 'Go' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'groovy', label: 'Groovy' },
  { value: 'haskell', label: 'Haskell' },
  { value: 'hcl', label: 'Terraform / HCL' },
  { value: 'html', label: 'HTML' },
  { value: 'java', label: 'Java' },
  { value: 'js', label: 'JavaScript' },
  { value: 'json', label: 'JSON' },
  { value: 'jsx', label: 'JSX' },
  { value: 'julia', label: 'Julia' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'lua', label: 'Lua' },
  { value: 'makefile', label: 'Makefile' },
  { value: 'md', label: 'Markdown' },
  { value: 'nim', label: 'Nim' },
  { value: 'ocaml', label: 'OCaml' },
  { value: 'perl', label: 'Perl' },
  { value: 'php', label: 'PHP' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'purescript', label: 'PureScript' },
  { value: 'python', label: 'Python' },
  { value: 'r', label: 'R' },
  { value: 'rescript', label: 'ReScript' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'rust', label: 'Rust' },
  { value: 'scala', label: 'Scala' },
  { value: 'scss', label: 'SCSS' },
  { value: 'solidity', label: 'Solidity' },
  { value: 'sql', label: 'SQL' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'swift', label: 'Swift' },
  { value: 'toml', label: 'TOML' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'tsx', label: 'TSX' },
  { value: 'vue', label: 'Vue' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'zig', label: 'Zig' },
]

export const THEMES: ReadonlyArray<{
  value: Theme
  label: string
  defaultHighlight: string
}> = [
  { value: 'one-dark-pro', label: 'One Dark Pro', defaultHighlight: '#63c4ff' },
  { value: 'github-dark', label: 'GitHub Dark', defaultHighlight: '#3fb950' },
  { value: 'github-light', label: 'GitHub Light', defaultHighlight: '#ffd564' },
  { value: 'dracula', label: 'Dracula', defaultHighlight: '#bd93f9' },
  { value: 'nord', label: 'Nord', defaultHighlight: '#88c0d0' },
  { value: 'vitesse-dark', label: 'Vitesse Dark', defaultHighlight: '#dabb7a' },
  { value: 'vitesse-light', label: 'Vitesse Light', defaultHighlight: '#faaf40' },
  { value: 'catppuccin-mocha', label: 'Catppuccin Mocha', defaultHighlight: '#f5c2e7' },
  { value: 'rose-pine', label: 'Rosé Pine', defaultHighlight: '#ebbcba' },
]

export const defaultHighlightFor = (theme: Theme): string =>
  THEMES.find((t) => t.value === theme)?.defaultHighlight ?? '#ffffff'

export const CODE_FONTS: ReadonlyArray<{ value: CodeFont; cssFamily: string }> = [
  { value: 'IBM Plex Mono', cssFamily: '"IBM Plex Mono", monospace' },
  { value: 'JetBrains Mono', cssFamily: '"JetBrains Mono", monospace' },
  { value: 'Geist Mono', cssFamily: '"Geist Mono", monospace' },
  { value: 'Fira Code', cssFamily: '"Fira Code", monospace' },
]
