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
import { CHROME_STYLES, type ChromeStyle } from '#/lib/types'

interface Props {
  value: ChromeStyle
  onChange: (next: ChromeStyle) => void
}

export function ChromeStyleCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const current = CHROME_STYLES.find((s) => s.value === value)

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
            <span className="truncate">{current?.label ?? 'Pick a style'}</span>
            {current && (
              <span className="truncate text-muted-foreground">
                · {current.description}
              </span>
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
          <CommandInput placeholder="Search style…" />
          <CommandList className="max-h-72">
            <CommandEmpty>No style found.</CommandEmpty>
            <CommandGroup>
              {CHROME_STYLES.map((s) => (
                <CommandItem
                  key={s.value}
                  value={`${s.label} ${s.description}`}
                  data-checked={value === s.value}
                  onSelect={() => {
                    onChange(s.value)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 py-1.5"
                >
                  <span className="text-xs">{s.label}</span>
                  <span className="flex-1 truncate text-xs text-muted-foreground">
                    {s.description}
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
