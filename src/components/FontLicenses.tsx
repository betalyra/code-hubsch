import { RiExternalLinkLine } from 'react-icons/ri'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { CODE_FONTS, FONT_LICENSES, type FontLicense } from '#/lib/types'

interface Props {
  trigger: React.ReactNode
}

export function FontLicenses({ trigger }: Props) {
  const grouped = new Map<FontLicense, typeof CODE_FONTS>()
  for (const font of CODE_FONTS) {
    const list = grouped.get(font.license) ?? []
    grouped.set(font.license, [...list, font])
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Font licenses</DialogTitle>
          <DialogDescription>
            Every code font is bundled with the app and served from this origin.
            Each one is open-source under one of the licenses below. Generated
            PNG/SVG images carry no font-license obligations — these licenses
            govern only the font binaries themselves.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-2">
          {Array.from(grouped.entries()).map(([id, fonts]) => {
            const info = FONT_LICENSES[id]
            return (
              <section key={id} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">{info.name}</h3>
                  <a
                    href={info.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Full text
                    <RiExternalLinkLine className="size-3" />
                  </a>
                </div>
                <ul className="flex flex-col gap-1 rounded-md border border-border/40 bg-card/40 p-2">
                  {fonts.map((f) => (
                    <li
                      key={f.value}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span
                        className="truncate"
                        style={{ fontFamily: f.cssFamily }}
                      >
                        {f.value}
                      </span>
                      <a
                        href={f.homepage}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        Homepage
                        <RiExternalLinkLine className="size-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>

        <p className="pt-2 text-xs text-muted-foreground">
          Font binaries delivered via{' '}
          <a
            href="https://fontsource.org"
            target="_blank"
            rel="noreferrer noopener"
            className="underline hover:text-foreground"
          >
            Fontsource
          </a>
          .
        </p>
      </DialogContent>
    </Dialog>
  )
}

export function FontLicensesLink() {
  return (
    <FontLicenses
      trigger={
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
        >
          Font licenses
        </Button>
      }
    />
  )
}
