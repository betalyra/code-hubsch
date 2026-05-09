import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { RiSparkling2Line } from 'react-icons/ri'
import { Controls } from '#/components/Controls'
import { Editor } from '#/components/Editor'
import { Preview } from '#/components/Preview'
import { Separator } from '#/components/ui/separator'
import { downloadPagesZip, downloadPng, downloadSvg } from '#/lib/download'
import type { Page } from '#/lib/render'
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
  fontSize: 26,
  lineHeight: 1.45,
  paddingX: 56,
  paddingY: 44,
  background: '#0b0f14',
  transparentBackground: false,
  windowColor: '#1f2430',
  chrome: true,
  radius: 18,
}

function Home() {
  const [settings, setSettings] = useState<Settings>(INITIAL)
  const [pages, setPages] = useState<ReadonlyArray<Page>>([])
  const [busy, setBusy] = useState(false)

  const update = useCallback(
    (patch: Partial<Settings>) =>
      setSettings((prev) => ({ ...prev, ...patch })),
    [],
  )

  const handlePages = useCallback((next: ReadonlyArray<Page>) => {
    setPages(next)
  }, [])

  const handleReset = useCallback(() => setSettings(INITIAL), [])

  const handlePng = useCallback(async () => {
    if (pages.length === 0) return
    setBusy(true)
    try {
      if (pages.length === 1) {
        const page = pages[0]
        if (page) {
          await downloadPng(page.svg, settings.width, settings.height, 'code.png')
        }
      } else {
        await downloadPagesZip(
          pages.map((p) => p.svg),
          settings.width,
          settings.height,
          'png',
          'code.zip',
        )
      }
    } finally {
      setBusy(false)
    }
  }, [pages, settings.width, settings.height])

  const handleSvgDownload = useCallback(async () => {
    if (pages.length === 0) return
    setBusy(true)
    try {
      if (pages.length === 1) {
        const page = pages[0]
        if (page) downloadSvg(page.svg, 'code.svg')
      } else {
        await downloadPagesZip(
          pages.map((p) => p.svg),
          settings.width,
          settings.height,
          'svg',
          'code.zip',
        )
      }
    } finally {
      setBusy(false)
    }
  }, [pages, settings.width, settings.height])

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
            onDownloadPng={handlePng}
            onDownloadSvg={handleSvgDownload}
            rendering={busy || pages.length === 0}
            pageCount={pages.length}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Editor
            </h2>
            <Editor
              code={settings.code}
              language={settings.language}
              theme={settings.theme}
              codeFont={settings.codeFont}
              fontSize={Math.min(settings.fontSize, 18)}
              lineHeight={settings.lineHeight}
              windowColor={settings.windowColor}
              fallbackColor="#d6deeb"
              onChange={(code) => update({ code })}
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
