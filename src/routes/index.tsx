import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { RiSparkling2Line } from 'react-icons/ri'
import { Controls } from '#/components/Controls'
import { Editor } from '#/components/Editor'
import { EditorToolbar } from '#/components/EditorToolbar'
import { Preview } from '#/components/Preview'
import { Separator } from '#/components/ui/separator'
import { type Detection, detectLanguage } from '#/lib/detect'
import {
  copyPngToClipboard,
  copySvgToClipboard,
  downloadPagesZip,
  downloadPng,
  downloadSvg,
} from '#/lib/download'
import type { Page } from '#/lib/render'
import { clearSettings, loadSettings, saveSettings } from '#/lib/storage'
import type { Settings } from '#/lib/types'

export const Route = createFileRoute('/')({ component: Home })

const SAMPLE_CODE = `import { Effect } from "effect"

const program = Effect.gen(function* () {
  const value = yield* Effect.succeed(42)
  yield* Effect.log(\`The answer is \${value}\`)
  return value * 2
})

const result = Effect.runSync(program)
`

const INITIAL: Settings = {
  code: SAMPLE_CODE,
  language: 'ts',
  theme: 'one-dark-pro',
  codeFont: 'IBM Plex Mono',
  width: 1200,
  height: 675,
  autoHeight: false,
  fontSize: 26,
  lineHeight: 1.45,
  paddingX: 56,
  paddingY: 44,
  background: '#00c9ff',
  backgroundSecondary: '#92fe9d',
  backgroundType: 'linear',
  gradientAngle: 135,
  transparentBackground: false,
  windowColor: '#1f2430',
  chrome: true,
  chromeStyle: 'macos',
  filename: '',
  radius: 18,
  outerMargin: 50,
  windowShadow: 50,
  lineNumbers: false,
  highlightedLines: '',
  highlightColor: '#63c4ff',
}

function Home() {
  const [settings, setSettings] = useState<Settings>(INITIAL)
  const [hydrated, setHydrated] = useState(false)
  const [pages, setPages] = useState<ReadonlyArray<Page>>([])
  const [busy, setBusy] = useState(false)
  const [detected, setDetected] = useState<Detection | undefined>(undefined)

  useEffect(() => {
    const t = setTimeout(() => {
      setDetected(detectLanguage(settings.code))
    }, 400)
    return () => clearTimeout(t)
  }, [settings.code])

  useEffect(() => {
    setSettings(loadSettings(INITIAL))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveSettings(settings)
  }, [settings, hydrated])

  const update = useCallback(
    (patch: Partial<Settings>) =>
      setSettings((prev) => ({ ...prev, ...patch })),
    [],
  )

  const handlePages = useCallback((next: ReadonlyArray<Page>) => {
    setPages(next)
  }, [])

  const handleReset = useCallback(() => {
    clearSettings()
    setSettings(INITIAL)
  }, [])

  const handleCopyPng = useCallback(async () => {
    if (pages.length === 0) return
    const page = pages[0]
    if (!page) return
    setBusy(true)
    try {
      await copyPngToClipboard(page.svg, page.width, page.height)
    } catch (e) {
      console.error('Copy failed', e)
    } finally {
      setBusy(false)
    }
  }, [pages])

  const handleCopySvg = useCallback(async () => {
    if (pages.length === 0) return
    const page = pages[0]
    if (!page) return
    try {
      await copySvgToClipboard(page.svg)
    } catch (e) {
      console.error('Copy failed', e)
    }
  }, [pages])

  const handlePng = useCallback(async () => {
    if (pages.length === 0) return
    setBusy(true)
    try {
      if (pages.length === 1) {
        const page = pages[0]
        if (page) {
          await downloadPng(page.svg, page.width, page.height, 'code.png')
        }
      } else {
        const first = pages[0]
        if (!first) return
        await downloadPagesZip(
          pages.map((p) => p.svg),
          first.width,
          first.height,
          'png',
          'code.zip',
        )
      }
    } finally {
      setBusy(false)
    }
  }, [pages])

  const handleSvgDownload = useCallback(async () => {
    if (pages.length === 0) return
    setBusy(true)
    try {
      if (pages.length === 1) {
        const page = pages[0]
        if (page) downloadSvg(page.svg, 'code.svg')
      } else {
        const first = pages[0]
        if (!first) return
        await downloadPagesZip(
          pages.map((p) => p.svg),
          first.width,
          first.height,
          'svg',
          'code.zip',
        )
      }
    } finally {
      setBusy(false)
    }
  }, [pages])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-[1600px] items-center gap-2">
          <RiSparkling2Line className="text-xl text-foreground/80" />
          <h1 className="text-lg font-medium tracking-tight">code pretty</h1>
          <Separator orientation="vertical" className="mx-2 h-4" />
          <span className="text-sm text-muted-foreground">
            tweet-ready code images
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] items-start gap-6 p-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="self-start lg:sticky lg:top-6">
          <Controls
            settings={settings}
            onChange={update}
            onReset={handleReset}
            onCopyPng={handleCopyPng}
            onCopySvg={handleCopySvg}
            onDownloadPng={handlePng}
            onDownloadSvg={handleSvgDownload}
            rendering={busy || pages.length === 0}
            pageCount={pages.length}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <EditorToolbar
              language={settings.language}
              detected={detected}
              onLanguageChange={(language) => update({ language })}
            />
            <Editor
              code={settings.code}
              language={settings.language}
              theme={settings.theme}
              codeFont={settings.codeFont}
              fontSize={Math.min(settings.fontSize, 18)}
              lineHeight={settings.lineHeight}
              windowColor={settings.windowColor}
              fallbackColor="#d6deeb"
              highlightedLines={settings.highlightedLines}
              highlightColor={settings.highlightColor}
              showLineNumbers={settings.lineNumbers}
              onChange={(code) => update({ code })}
              onHighlightChange={(highlightedLines) =>
                update({ highlightedLines })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Preview · {settings.width}×{settings.height}
              </h2>
              {pages.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  {pages.length} pages — downloads as zip
                </span>
              )}
            </div>
            <Preview settings={settings} onPages={handlePages} />
          </div>
        </div>
      </main>
    </div>
  )
}
