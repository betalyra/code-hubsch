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
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { LANGUAGES, type Language } from '#/lib/types'

interface Props {
  value: Language
  onChange: (next: Language) => void
}

export function LanguageCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find((l) => l.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-expanded={open}
          className="w-full justify-between bg-transparent font-normal text-foreground"
        >
          <span className="truncate">
            {current ? current.label : 'Pick a language'}
          </span>
          <RiArrowDownSLine className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder="Search language…" />
          <CommandList className="max-h-64">
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {LANGUAGES.map((lang) => (
                <CommandItem
                  key={lang.value}
                  value={`${lang.value} ${lang.label}`}
                  data-checked={lang.value === value}
                  onSelect={() => {
                    onChange(lang.value)
                    setOpen(false)
                  }}
                >
                  {lang.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
