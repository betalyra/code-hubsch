import { useRef, useState, useSyncExternalStore } from 'react'
import { LuLigature } from 'react-icons/lu'
import {
  RiAddLine,
  RiArrowDownSLine,
  RiCheckboxBlankCircleFill,
  RiCheckboxBlankCircleLine,
  RiDeleteBinLine,
  RiErrorWarningLine,
  RiLoader4Line,
} from 'react-icons/ri'
import { Button } from '#/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '#/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import {
  addCustomFont,
  cssFamilyFor as customCssFamily,
  type CustomFont,
  listCustomFonts,
  readFontFile,
  removeCustomFont,
  subscribeCustomFonts,
} from '#/lib/customFonts'
import {
  type FontStatus,
  getFontStatus,
  subscribeFontStatus,
} from '#/lib/fonts'
import { CODE_FONTS } from '#/lib/types'

interface Props {
  value: string
  onChange: (next: string) => void
}

const useFontStatus = (font: string): FontStatus =>
  useSyncExternalStore(
    subscribeFontStatus,
    () => getFontStatus(font),
    () => 'idle' as FontStatus,
  )

const useCustomFonts = (): ReadonlyArray<CustomFont> =>
  useSyncExternalStore(
    subscribeCustomFonts,
    listCustomFonts,
    () => [] as ReadonlyArray<CustomFont>,
  )

const StatusIcon = ({ status }: { status: FontStatus }) => {
  if (status === 'loading')
    return (
      <RiLoader4Line
        className="size-3.5 animate-spin text-muted-foreground"
        aria-label="Loading"
      />
    )
  if (status === 'error')
    return (
      <RiErrorWarningLine
        className="size-3.5 text-destructive"
        aria-label="Failed to load"
      />
    )
  if (status === 'loaded')
    return (
      <RiCheckboxBlankCircleFill
        className="size-3 text-muted-foreground/80"
        aria-label="Loaded"
      />
    )
  return (
    <RiCheckboxBlankCircleLine
      className="size-3 text-muted-foreground/30"
      aria-label="Not loaded"
    />
  )
}

const LigaBadge = () => (
  <LuLigature
    className="size-3.5 text-muted-foreground/70"
    aria-label="Has programming ligatures"
  >
    <title>
      Programming ligatures (only render in HTML-in-Canvas mode)
    </title>
  </LuLigature>
)

const Slot = ({ children }: { children: React.ReactNode }) => (
  <span className="flex size-4 shrink-0 items-center justify-center">
    {children}
  </span>
)

const FontRow = ({
  value,
  cssFamily,
  ligatures,
  selected,
  onSelect,
  trailing,
}: {
  value: string
  cssFamily: string
  ligatures: boolean
  selected: boolean
  onSelect: () => void
  trailing?: React.ReactNode
}) => {
  const status = useFontStatus(value)
  return (
    <CommandItem
      value={value}
      data-checked={selected}
      onSelect={onSelect}
      className="flex items-center gap-2 py-1.5"
    >
      <span
        className="flex-1 truncate text-xs"
        style={{ fontFamily: status === 'loaded' ? cssFamily : undefined }}
      >
        {value}
      </span>
      <Slot>{ligatures && <LigaBadge />}</Slot>
      <Slot>
        <StatusIcon status={status} />
      </Slot>
      {trailing}
    </CommandItem>
  )
}

const CurrentFontPreview = ({ value }: { value: string }) => {
  const status = useFontStatus(value)
  const builtIn = CODE_FONTS.find((f) => f.value === value)
  const family = builtIn?.cssFamily ?? customCssFamily(value)
  return (
    <span className="flex min-w-0 items-center gap-2 truncate">
      <span
        className="truncate"
        style={{ fontFamily: status === 'loaded' ? family : undefined }}
      >
        {value || 'Pick a font'}
      </span>
      <StatusIcon status={status} />
    </span>
  )
}

const ACCEPTED_FONT_TYPES = '.woff2,.woff,.ttf,.otf'

export function FontCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const customFonts = useCustomFonts()

  const handleFile = async (file: File): Promise<void> => {
    setUploadError(null)
    try {
      const { defaultName, variant } = await readFontFile(file)
      const name = defaultName || file.name
      addCustomFont({ name, variants: [variant] })
      onChange(name)
      setOpen(false)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to add font'
      setUploadError(message)
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) void handleFile(file)
  }

  const handleRemove = (name: string): void => {
    removeCustomFont(name)
    if (value === name) onChange('JetBrains Mono')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-expanded={open}
          className="w-full justify-between bg-transparent font-normal text-foreground"
        >
          <CurrentFontPreview value={value} />
          <RiArrowDownSLine className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command>
          <CommandInput placeholder="Search font…" />
          <CommandList className="max-h-80">
            <CommandEmpty>No font found.</CommandEmpty>
            {customFonts.length > 0 && (
              <>
                <CommandGroup heading="Custom">
                  {customFonts.map((f) => (
                    <FontRow
                      key={`custom:${f.name}`}
                      value={f.name}
                      cssFamily={customCssFamily(f.name)}
                      ligatures={false}
                      selected={value === f.name}
                      onSelect={() => {
                        onChange(f.name)
                        setOpen(false)
                      }}
                      trailing={
                        <button
                          type="button"
                          aria-label={`Remove ${f.name}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemove(f.name)
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          className="ml-1 inline-flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground/70 hover:bg-destructive/15 hover:text-destructive"
                        >
                          <RiDeleteBinLine className="size-3.5" />
                        </button>
                      }
                    />
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
            <CommandGroup heading="Built-in">
              {CODE_FONTS.map((f) => (
                <FontRow
                  key={f.value}
                  value={f.value}
                  cssFamily={f.cssFamily}
                  ligatures={f.ligatures}
                  selected={value === f.value}
                  onSelect={() => {
                    onChange(f.value)
                    setOpen(false)
                  }}
                />
              ))}
            </CommandGroup>
          </CommandList>
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <RiAddLine className="size-3.5" />
              Upload local font (.woff2, .woff, .ttf, .otf)
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FONT_TYPES}
              className="hidden"
              onChange={onFileChange}
            />
            {uploadError && (
              <p className="px-2 pt-1.5 text-xs text-destructive">
                {uploadError}
              </p>
            )}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
