import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { RiSettings3Line, RiSparkling2Line } from 'react-icons/ri'
import { Controls } from '#/components/Controls'
import { Editor } from '#/components/Editor'
import { EditorToolbar } from '#/components/EditorToolbar'
import { Preview } from '#/components/Preview'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet'
import { type Detection, detectLanguage } from '#/lib/detect'
import {
  copyPngToClipboard,
  copySvgToClipboard,
  downloadPagesZip,
  downloadPng,
  downloadSvg,
} from '#/lib/download'
import { baseFilename, buildDownloadName, shortHash } from '#/lib/filename'
import type { Page } from '#/lib/render'
import type { PreviewView } from '#/components/Preview'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '#/components/ui/toggle-group'
import { RiCollapseDiagonalLine, RiExpandDiagonalLine } from 'react-icons/ri'
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
  const [previewView, setPreviewView] = useState<PreviewView>('actual')

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

  const settingsKey = JSON.stringify(settings)
  const proposedFilename = `${baseFilename(settings.filename)}-${shortHash(settingsKey)}`

  const handlePng = useCallback(async () => {
    if (pages.length === 0) return
    setBusy(true)
    try {
      if (pages.length === 1) {
        const page = pages[0]
        if (page) {
          const name = buildDownloadName(settings.filename, settingsKey, 'png')
          await downloadPng(page.svg, page.width, page.height, name)
        }
      } else {
        const first = pages[0]
        if (!first) return
        const name = buildDownloadName(settings.filename, settingsKey, 'zip')
        await downloadPagesZip(
          pages.map((p) => p.svg),
          first.width,
          first.height,
          'png',
          name,
        )
      }
    } finally {
      setBusy(false)
    }
  }, [pages, settings.filename, settingsKey])

  const handleSvgDownload = useCallback(async () => {
    if (pages.length === 0) return
    setBusy(true)
    try {
      if (pages.length === 1) {
        const page = pages[0]
        if (page) {
          const name = buildDownloadName(settings.filename, settingsKey, 'svg')
          downloadSvg(page.svg, name)
        }
      } else {
        const first = pages[0]
        if (!first) return
        const name = buildDownloadName(settings.filename, settingsKey, 'zip')
        await downloadPagesZip(
          pages.map((p) => p.svg),
          first.width,
          first.height,
          'svg',
          name,
        )
      }
    } finally {
      setBusy(false)
    }
  }, [pages, settings.filename, settingsKey])

  const controlsProps = {
    settings,
    onChange: update,
    onReset: handleReset,
    onCopyPng: handleCopyPng,
    onCopySvg: handleCopySvg,
    onDownloadPng: handlePng,
    onDownloadSvg: handleSvgDownload,
    rendering: busy || pages.length === 0,
    pageCount: pages.length,
    proposedFilename,
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-[1600px] items-center gap-2">
          <RiSparkling2Line className="text-xl text-foreground/80" />
          <h1 className="text-base font-medium tracking-tight sm:text-lg">
            code pretty
          </h1>
          <Separator
            orientation="vertical"
            className="mx-2 hidden h-4 sm:block"
          />
          <span className="hidden text-sm text-muted-foreground sm:inline">
            tweet-ready code images
          </span>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="ml-auto lg:hidden"
                aria-label="Open settings"
              >
                <RiSettings3Line data-icon="inline-start" />
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[92vw] max-w-md flex-col gap-3 overflow-y-auto p-4 sm:w-96"
            >
              <SheetHeader className="px-0">
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <Controls {...controlsProps} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] items-start gap-4 p-4 sm:gap-6 sm:p-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="hidden self-start lg:sticky lg:top-6 lg:block">
          <Controls {...controlsProps} />
        </div>

        <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
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

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Preview · {settings.width}×{settings.height}
                </h2>
                {pages.length > 1 && (
                  <span className="text-xs text-muted-foreground">
                    {pages.length} pages — downloads as zip
                  </span>
                )}
              </div>
              <ToggleGroup
                type="single"
                spacing={0}
                value={previewView}
                onValueChange={(v) => v && setPreviewView(v as PreviewView)}
                aria-label="Preview zoom"
              >
                <ToggleGroupItem
                  value="fit"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                  aria-label="Fit to width"
                  title="Fit to width"
                >
                  <RiCollapseDiagonalLine />
                  Fit
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="actual"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                  aria-label="Actual size"
                  title="Actual size (1:1)"
                >
                  <RiExpandDiagonalLine />
                  1:1
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <Preview
              settings={settings}
              view={previewView}
              onPages={handlePages}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
