import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { RiFlowerLine, RiSettings3Line } from 'react-icons/ri'
import { Controls } from '#/components/Controls'
import { Editor } from '#/components/Editor'
import { EditorToolbar } from '#/components/EditorToolbar'
import { FontLicensesLink } from '#/components/FontLicenses'
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

const SAMPLE_CODE = `import { Effect, pipe } from "effect"

const greet = (name: string) =>
  name.length >= 1
    ? Effect.succeed(\`Hello, \${name}!\`)
    : Effect.fail("empty" as const)

const program = pipe(
  greet("world"),
  Effect.tap((msg) => Effect.log(msg)),
)
`

const INITIAL: Settings = {
  code: SAMPLE_CODE,
  language: 'ts',
  theme: 'github-dark',
  codeFont: 'Monaspace Neon',
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
  chromeColor: '#1f2430',
  chrome: true,
  chromeStyle: 'macos',
  filename: '',
  radius: 18,
  outerMargin: 50,
  windowShadow: 50,
  borderWidth: 0,
  borderColor: '#808080',
  lineNumbers: false,
  highlightedLines: '',
  highlightColor: '#63c4ff',
  htmlInCanvas: true,
  ligatures: true,
  exportScale: 2,
}

function Home() {
  const [settings, setSettings] = useState<Settings>(INITIAL)
  const [hydrated, setHydrated] = useState(false)
  const [pages, setPages] = useState<ReadonlyArray<Page>>([])
  const [busy, setBusy] = useState(false)
  const [detected, setDetected] = useState<Detection | undefined>(undefined)
  const [previewView, setPreviewView] = useState<PreviewView>('fit')

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
      await copyPngToClipboard(
        page.svg,
        page.width,
        page.height,
        page.png,
        settings.exportScale,
      )
    } catch (e) {
      console.error('Copy failed', e)
    } finally {
      setBusy(false)
    }
  }, [pages, settings.exportScale])

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
          await downloadPng(
            page.svg,
            page.width,
            page.height,
            name,
            page.png,
            settings.exportScale,
          )
        }
      } else {
        const first = pages[0]
        if (!first) return
        const name = buildDownloadName(settings.filename, settingsKey, 'zip')
        await downloadPagesZip(
          pages.map((p) => ({ svg: p.svg, png: p.png })),
          first.width,
          first.height,
          'png',
          name,
          settings.exportScale,
        )
      }
    } finally {
      setBusy(false)
    }
  }, [pages, settings.filename, settingsKey, settings.exportScale])

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
          pages.map((p) => ({ svg: p.svg })),
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
        <div className="mx-auto flex max-w-[1600px] items-center gap-1.5">
          <RiFlowerLine className="text-2xl text-accent-pink sm:text-3xl" />
          <h1
            className="text-xl leading-none tracking-tight sm:text-2xl"
            style={{
              fontFamily: '"Lora Variable", "Lora", serif',
              fontStyle: 'italic',
              fontWeight: 500,
            }}
            aria-label="code hübsch"
          >
            <span aria-hidden>
              code h
              <span className="relative inline-block">
                u
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 flex justify-center"
                  style={{
                    top: '0.13em',
                    gap: '0.05em',
                    transform: 'translateX(0.04em)',
                  }}
                >
                  <span
                    className="block rounded-full bg-accent-pink"
                    style={{
                      width: '0.1em',
                      height: '0.12em',
                      transform: 'rotate(12deg)',
                    }}
                  />
                  <span
                    className="block rounded-full bg-accent-pink"
                    style={{
                      width: '0.1em',
                      height: '0.12em',
                      transform: 'rotate(12deg)',
                    }}
                  />
                </span>
              </span>
              bsch
            </span>
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
              ligatures={settings.htmlInCanvas && settings.ligatures}
              onChange={(code) => update({ code })}
              onHighlightChange={(highlightedLines) =>
                update({ highlightedLines })
              }
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-accent-pink/80"
                  />
                  <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Preview
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground/70 tabular-nums">
                  {settings.width}×{settings.height}
                </span>
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
                  className="h-7 w-16 justify-center px-2 text-[11px]"
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
                  className="h-7 w-16 justify-center px-2 text-[11px]"
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

      <footer className="border-t px-4 py-3 text-xs text-muted-foreground sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <a
            href="https://betalyra.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Betalyra"
            className="inline-flex h-7 w-24 items-center bg-current text-foreground/80 transition-colors hover:text-accent-pink"
            style={{
              maskImage: 'url(/betalyra.svg)',
              maskRepeat: 'no-repeat',
              maskSize: 'contain',
              maskPosition: 'left center',
              WebkitMaskImage: 'url(/betalyra.svg)',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskSize: 'contain',
              WebkitMaskPosition: 'left center',
            }}
          />

          <a
            href="https://codehubsch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="leading-none transition-colors hover:text-accent-pink"
          >
            codehubsch.com
          </a>

          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center gap-3 leading-none"
          >
            <a
              href="https://betalyra.com/imprint"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-accent-pink"
            >
              Imprint
            </a>
            <a
              href="https://betalyra.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-accent-pink"
            >
              Privacy
            </a>
            <FontLicensesLink />
          </nav>
        </div>
      </footer>
    </div>
  )
}
