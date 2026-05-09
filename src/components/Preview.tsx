import { useEffect, useState } from 'react'
import { RiExpandDiagonalLine, RiCollapseDiagonalLine } from 'react-icons/ri'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { type Page, renderCodePages } from '#/lib/render'
import type { Settings } from '#/lib/types'

interface Props {
  settings: Settings
  onPages: (pages: ReadonlyArray<Page>) => void
}

const DEBOUNCE_MS = 200

type ViewMode = 'fit' | 'actual'

const responsiveSvg = (svg: string): string =>
  svg.replace(
    /<svg([^>]*?)>/,
    '<svg$1 style="width:100%;height:auto;display:block">',
  )

export function Preview({ settings, onPages }: Props) {
  const [pages, setPages] = useState<ReadonlyArray<Page>>([])
  const [error, setError] = useState<string | undefined>(undefined)
  const [rendering, setRendering] = useState(false)
  const [view, setView] = useState<ViewMode>('actual')

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

  const isFit = view === 'fit'

  return (
    <div className="relative flex w-full flex-col gap-2">
      <div className="flex justify-end">
        <ToggleGroup
          type="single"
          spacing={0}
          value={view}
          onValueChange={(v) => v && setView(v as ViewMode)}
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

      <div className="flex w-full flex-col gap-3">
        {pages.length > 0 ? (
          pages.map((page) => (
            <div
              key={page.pageIndex}
              className="relative w-full overflow-hidden rounded-md"
            >
              {pages.length > 1 && (
                <div className="pointer-events-none absolute top-2 right-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground tabular-nums shadow">
                  {page.pageIndex + 1}/{pages.length}
                </div>
              )}
              {isFit ? (
                <div
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted satori SVG output
                  dangerouslySetInnerHTML={{ __html: responsiveSvg(page.svg) }}
                />
              ) : (
                <div className="scroll-overlay w-full overflow-x-auto">
                  <div
                    style={{ width: page.width, height: page.height }}
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted satori SVG output
                    dangerouslySetInnerHTML={{ __html: page.svg }}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div
            className="flex w-full max-w-full items-center justify-center text-muted-foreground"
            style={{
              aspectRatio: `${settings.width} / ${settings.height}`,
              backgroundColor: settings.windowColor,
              borderRadius: settings.radius,
            }}
          >
            {error ? `render error: ${error}` : 'rendering…'}
          </div>
        )}
      </div>

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
