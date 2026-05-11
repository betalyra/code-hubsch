import { useState, useSyncExternalStore } from 'react'
import {
  RiArrowDownSLine,
  RiCheckLine,
  RiCheckboxBlankCircleFill,
  RiCheckboxBlankCircleLine,
  RiErrorWarningLine,
  RiLoader4Line,
} from 'react-icons/ri'
import { LuLigature } from 'react-icons/lu'
import { Button } from '#/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import {
  type FontStatus,
  getFontStatus,
  subscribeFontStatus,
} from '#/lib/fonts'
import { CODE_FONTS, type CodeFont } from '#/lib/types'

interface Props {
  value: CodeFont
  onChange: (next: CodeFont) => void
}

const useFontStatus = (font: CodeFont): FontStatus =>
  useSyncExternalStore(
    subscribeFontStatus,
    () => getFontStatus(font),
    () => 'idle' as FontStatus,
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
}: {
  value: CodeFont
  cssFamily: string
  ligatures: boolean
  selected: boolean
  onSelect: () => void
}) => {
  const status = useFontStatus(value)
  return (
    <CommandItem
      value={value}
      data-checked={selected}
      onSelect={onSelect}
      className="flex items-center gap-2 py-1.5"
    >
      <Slot>
        {selected && (
          <RiCheckLine
            className="size-3.5 text-emerald-400"
            aria-label="Selected"
          />
        )}
      </Slot>
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
    </CommandItem>
  )
}

export function FontCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const current = CODE_FONTS.find((f) => f.value === value)
  const currentStatus = useFontStatus(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-expanded={open}
          className="w-full justify-between bg-transparent font-normal text-foreground"
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <span
              className="truncate"
              style={{
                fontFamily:
                  currentStatus === 'loaded' ? current?.cssFamily : undefined,
              }}
            >
              {current?.value ?? 'Pick a font'}
            </span>
            <StatusIcon status={currentStatus} />
          </span>
          <RiArrowDownSLine className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command>
          <CommandInput placeholder="Search font…" />
          <CommandList className="max-h-72">
            <CommandEmpty>No font found.</CommandEmpty>
            <CommandGroup>
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
        </Command>
      </PopoverContent>
    </Popover>
  )
}
