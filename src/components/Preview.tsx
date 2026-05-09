import { useEffect, useState } from 'react'
import { type Page, renderCodePages } from '#/lib/render'
import type { Settings } from '#/lib/types'

interface Props {
  settings: Settings
  onPages: (pages: ReadonlyArray<Page>) => void
}

const DEBOUNCE_MS = 200

const responsiveSvg = (svg: string): string =>
  svg.replace(
    /<svg([^>]*?)>/,
    '<svg$1 style="width:100%;height:auto;display:block">',
  )

export function Preview({ settings, onPages }: Props) {
  const [pages, setPages] = useState<ReadonlyArray<Page>>([])
  const [error, setError] = useState<string | undefined>(undefined)
  const [rendering, setRendering] = useState(false)

  useEffect(() => {
    let cancelled = false
    setRendering(true)
    const t = setTimeout(async () => {
      try {
        const result = await renderCodePages(settings)
        if (cancelled) return
        setPages(result.pages)
        setError(undefined)
        onPages(result.pages)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
        setPages([])
        onPages([])
      } finally {
        if (!cancelled) setRendering(false)
      }
    }, DEBOUNCE_MS)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [settings, onPages])

  return (
    <div
      className="relative flex w-full flex-col gap-3"
      style={{ maxWidth: settings.width }}
    >
      {pages.length > 0 ? (
        pages.map((page) => (
          <div key={page.pageIndex} className="relative">
            {pages.length > 1 && (
              <div className="pointer-events-none absolute -top-2 -right-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground tabular-nums shadow">
                {page.pageIndex + 1}/{pages.length}
              </div>
            )}
            <div
              // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted satori SVG output
              dangerouslySetInnerHTML={{ __html: responsiveSvg(page.svg) }}
            />
          </div>
        ))
      ) : (
        <div
          className="flex w-full items-center justify-center text-muted-foreground"
          style={{
            aspectRatio: `${settings.width} / ${settings.height}`,
            backgroundColor: settings.windowColor,
            borderRadius: settings.radius,
          }}
        >
          {error ? `render error: ${error}` : 'rendering…'}
        </div>
      )}

      {rendering && pages.length > 0 && (
        <div className="pointer-events-none absolute right-3 bottom-3 rounded-md bg-primary/80 px-2 py-1 text-xs text-primary-foreground backdrop-blur">
          rendering…
        </div>
      )}
      {error && pages.length > 0 && (
        <div className="pointer-events-none absolute right-3 bottom-3 max-w-xs truncate rounded-md bg-destructive/80 px-2 py-1 text-xs text-destructive-foreground">
          {error}
        </div>
      )}
    </div>
  )
}
