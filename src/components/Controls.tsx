import { useState } from 'react'
import {
  RiAddLine,
  RiArrowDownSLine,
  RiContrast2Line,
  RiDownload2Line,
  RiEqualizer2Line,
  RiFileCodeLine,
  RiFontSize,
  RiImageLine,
  RiLayoutGridLine,
  RiPaletteLine,
  RiResetLeftLine,
  RiSubtractLine,
} from 'react-icons/ri'
import { Button } from '#/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/collapsible'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Slider } from '#/components/ui/slider'
import { Switch } from '#/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import {
  APPEARANCE_PRESETS,
  CODE_FONTS,
  type CodeFont,
  LANGUAGES,
  type Language,
  SIZE_PRESETS,
  type Settings,
  THEMES,
  type Theme,
} from '#/lib/types'

interface Props {
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
  onReset: () => void
  onDownloadPng: () => void
  onDownloadSvg: () => void
  rendering: boolean
  pageCount: number
}

const Section = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) => (
  <section className="flex flex-col gap-2.5">
    <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
      <span className="text-sm">{icon}</span>
      {title}
    </div>
    {children}
  </section>
)

const FieldLabel = ({
  label,
  value,
}: {
  label: string
  value?: string
}) => (
  <div className="flex items-center justify-between text-xs text-muted-foreground">
    <span>{label}</span>
    {value !== undefined && <span className="tabular-nums">{value}</span>}
  </div>
)

const ColorField = ({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) => (
  <div
    className={`flex items-center gap-1.5 rounded-md border bg-input/30 pr-2 pl-1 ${disabled ? 'pointer-events-none opacity-40' : ''}`}
  >
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 w-full bg-transparent text-xs tabular-nums outline-none"
    />
  </div>
)

interface SliderInputProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  precision?: number
  onChange: (value: number) => void
}

const SliderInput = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  precision = 0,
  onChange,
}: SliderInputProps) => {
  const dec = () => onChange(Math.max(min, Number((value - step).toFixed(precision))))
  const inc = () => onChange(Math.min(max, Number((value + step).toFixed(precision))))
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel label={label} value={`${value.toFixed(precision)}${unit}`} />
      <div className="flex items-center gap-1.5">
        <Slider
          className="flex-1"
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={([v]) => v != null && onChange(v)}
        />
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label={`decrease ${label}`}
          onClick={dec}
        >
          <RiSubtractLine />
        </Button>
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (Number.isFinite(n)) onChange(n)
          }}
          className="h-6 w-12 px-1 text-center text-xs tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label={`increase ${label}`}
          onClick={inc}
        >
          <RiAddLine />
        </Button>
      </div>
    </div>
  )
}

export function Controls({
  settings,
  onChange,
  onReset,
  onDownloadPng,
  onDownloadSvg,
  rendering,
  pageCount,
}: Props) {
  const multi = pageCount > 1
  const pngLabel = multi ? `PNG · ${pageCount} pages` : 'PNG'
  const svgLabel = multi ? `SVG · ${pageCount} pages` : 'SVG'
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const sizePresetId =
    SIZE_PRESETS.find(
      (p) => p.width === settings.width && p.height === settings.height,
    )?.id ?? ''

  const appearanceId =
    APPEARANCE_PRESETS.find(
      (p) =>
        p.theme === settings.theme &&
        p.windowColor.toLowerCase() === settings.windowColor.toLowerCase() &&
        p.background.toLowerCase() === settings.background.toLowerCase(),
    )?.id ?? ''

  return (
    <aside className="flex w-full flex-col gap-4 rounded-xl border bg-card/40 p-4">
      <Section icon={<RiPaletteLine />} title="Appearance">
        <ToggleGroup
          type="single"
          spacing={1}
          value={appearanceId}
          onValueChange={(id) => {
            if (!id) return
            const p = APPEARANCE_PRESETS.find((x) => x.id === id)
            if (p) {
              onChange({
                theme: p.theme,
                windowColor: p.windowColor,
                background: p.background,
                transparentBackground: false,
              })
            }
          }}
          className="grid w-full grid-cols-4 gap-1"
        >
          {APPEARANCE_PRESETS.map((p) => (
            <ToggleGroupItem
              key={p.id}
              value={p.id}
              size="sm"
              variant="outline"
              className="h-7 text-[11px]"
            >
              {p.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex flex-col gap-1.5">
          <FieldLabel label="Syntax theme" />
          <Select
            value={settings.theme}
            onValueChange={(v) => onChange({ theme: v as Theme })}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <FieldLabel label="Language" />
          <Select
            value={settings.language}
            onValueChange={(v) => onChange({ language: v as Language })}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <FieldLabel label="Window" />
            <ColorField
              value={settings.windowColor}
              onChange={(windowColor) => onChange({ windowColor })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel label="Background" />
            <ColorField
              value={settings.background}
              onChange={(background) => onChange({ background })}
              disabled={settings.transparentBackground}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-md border bg-input/20 p-2.5">
          <label className="flex cursor-pointer items-center justify-between text-xs">
            <span>Show window chrome</span>
            <Switch
              checked={settings.chrome}
              onCheckedChange={(chrome) => onChange({ chrome })}
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <RiContrast2Line className="text-muted-foreground" />
              Transparent canvas
            </span>
            <Switch
              checked={settings.transparentBackground}
              onCheckedChange={(transparentBackground) =>
                onChange({ transparentBackground })
              }
            />
          </label>
        </div>
      </Section>

      <Section icon={<RiLayoutGridLine />} title="Canvas size">
        <ToggleGroup
          type="single"
          spacing={1}
          value={sizePresetId}
          onValueChange={(id) => {
            if (!id) return
            const p = SIZE_PRESETS.find((x) => x.id === id)
            if (p) onChange({ width: p.width, height: p.height })
          }}
          className="grid w-full grid-cols-2 gap-1.5"
        >
          {SIZE_PRESETS.map((p) => (
            <ToggleGroupItem
              key={p.id}
              value={p.id}
              size="sm"
              variant="outline"
              className="h-9 text-xs"
            >
              {p.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <FieldLabel label="Width" />
            <Input
              type="number"
              min={200}
              max={4000}
              value={settings.width}
              onChange={(e) => {
                const n = Number(e.target.value)
                if (Number.isFinite(n)) onChange({ width: n })
              }}
              className="h-7 text-xs tabular-nums"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel label="Height" />
            <Input
              type="number"
              min={200}
              max={4000}
              value={settings.height}
              onChange={(e) => {
                const n = Number(e.target.value)
                if (Number.isFinite(n)) onChange({ height: n })
              }}
              className="h-7 text-xs tabular-nums"
            />
          </div>
        </div>
      </Section>

      <Section icon={<RiFontSize />} title="Code">
        <div className="flex flex-col gap-1.5">
          <FieldLabel label="Font family" />
          <Select
            value={settings.codeFont}
            onValueChange={(v) => onChange({ codeFont: v as CodeFont })}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CODE_FONTS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  <span style={{ fontFamily: f.cssFamily }}>{f.value}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SliderInput
          label="Font size"
          value={settings.fontSize}
          min={10}
          max={64}
          step={1}
          unit="px"
          onChange={(fontSize) => onChange({ fontSize })}
        />

        <SliderInput
          label="Line height"
          value={settings.lineHeight}
          min={1}
          max={2}
          step={0.05}
          precision={2}
          onChange={(lineHeight) => onChange({ lineHeight })}
        />
      </Section>

      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md border bg-input/20 px-3 py-2 text-xs font-medium text-foreground hover:bg-input/40">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <RiEqualizer2Line className="text-sm" />
            Advanced
          </span>
          <RiArrowDownSLine className="text-base transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 flex flex-col gap-3">
          <SliderInput
            label="Padding X"
            value={settings.paddingX}
            min={0}
            max={160}
            step={2}
            unit="px"
            onChange={(paddingX) => onChange({ paddingX })}
          />
          <SliderInput
            label="Padding Y"
            value={settings.paddingY}
            min={0}
            max={160}
            step={2}
            unit="px"
            onChange={(paddingY) => onChange({ paddingY })}
          />
          <SliderInput
            label="Corner radius"
            value={settings.radius}
            min={0}
            max={48}
            step={1}
            unit="px"
            onChange={(radius) => onChange({ radius })}
          />
        </CollapsibleContent>
      </Collapsible>

      <Section icon={<RiDownload2Line />} title="Export">
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            type="button"
            size="sm"
            disabled={rendering}
            onClick={onDownloadPng}
          >
            <RiImageLine data-icon="inline-start" />
            {pngLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={rendering}
            onClick={onDownloadSvg}
          >
            <RiFileCodeLine data-icon="inline-start" />
            {svgLabel}
          </Button>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onReset}
          className="w-full"
        >
          <RiResetLeftLine data-icon="inline-start" />
          Reset to defaults
        </Button>
      </Section>
    </aside>
  )
}
