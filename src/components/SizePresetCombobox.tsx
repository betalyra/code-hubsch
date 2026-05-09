import { useState } from 'react'
import { RiArrowDownSLine } from 'react-icons/ri'
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
import { SIZE_PRESETS } from '#/lib/types'

interface Props {
  width: number
  height: number
  onChange: (next: { width: number; height: number }) => void
}

export function SizePresetCombobox({ width, height, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const current = SIZE_PRESETS.find(
    (p) => p.width === width && p.height === height,
  )

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
            {current ? (
              <>
                <span className="font-mono tabular-nums">{current.label}</span>
                <span className="truncate text-muted-foreground">
                  · {current.description}
                </span>
              </>
            ) : (
              <>
                <span className="font-mono tabular-nums">
                  {width} × {height}
                </span>
                <span className="text-muted-foreground">· Custom</span>
              </>
            )}
          </span>
          <RiArrowDownSLine className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder="Search size, platform, or ratio…" />
          <CommandList className="max-h-72">
            <CommandEmpty>No size found.</CommandEmpty>
            <CommandGroup>
              {SIZE_PRESETS.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.label} ${p.description} ${p.aspect}`}
                  data-checked={current?.id === p.id}
                  onSelect={() => {
                    onChange({ width: p.width, height: p.height })
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 py-1.5"
                >
                  <span className="font-mono text-xs tabular-nums">
                    {p.label}
                  </span>
                  <span className="flex-1 truncate text-xs text-muted-foreground">
                    {p.description}
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {p.aspect}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
