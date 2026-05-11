import {
  RiAddLine,
  RiClipboardLine,
  RiCodeSSlashLine,
  RiContrast2Line,
  RiDownload2Line,
  RiFileCodeLine,
  RiFlaskLine,
  RiImageLine,
  RiInformationLine,
  RiLayoutGridLine,
  RiMarkPenLine,
  RiPaletteLine,
  RiResetLeftLine,
  RiSubtractLine,
  RiWindow2Line,
} from 'react-icons/ri'
import { useEffect, useState } from 'react'
import { ChromeStyleCombobox } from '#/components/ChromeStyleCombobox'
import { FontCombobox } from '#/components/FontCombobox'
import { SizePresetCombobox } from '#/components/SizePresetCombobox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { isDrawElementImageSupported } from '#/lib/htmlInCanvas'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'
import { Button } from '#/components/ui/button'
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
  type BackgroundType,
  CHROME_COLOR_PRESETS,
  CHROME_STYLE_PATCHES,
  defaultHighlightFor,
  GRADIENT_PRESETS,
  type Settings,
  THEMES,
  type Theme,
} from '#/lib/types'

interface Props {
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
  onReset: () => void
  onCopyPng: () => void
  onCopySvg: () => void
  onDownloadPng: () => void
  onDownloadSvg: () => void
  rendering: boolean
  pageCount: number
  proposedFilename: string
}

const SectionTitle = ({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) => (
  <span className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
    <span className="text-sm text-foreground">{icon}</span>
    {title}
  </span>
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
  const dec = () =>
    onChange(Math.max(min, Number((value - step).toFixed(precision))))
  const inc = () =>
    onChange(Math.min(max, Number((value + step).toFixed(precision))))
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
  onCopyPng,
  onCopySvg,
  onDownloadPng,
  onDownloadSvg,
  rendering,
  pageCount,
  proposedFilename,
}: Props) {
  const multi = pageCount > 1
  // Defer the feature check to after mount so SSR and the initial
  // client render produce the same DOM — otherwise hydration mismatches.
  const [htmlInCanvasSupported, setHtmlInCanvasSupported] = useState(false)
  useEffect(() => {
    setHtmlInCanvasSupported(isDrawElementImageSupported())
  }, [])

  const appearanceId =
    APPEARANCE_PRESETS.find(
      (p) =>
        p.theme === settings.theme &&
        p.windowColor.toLowerCase() === settings.windowColor.toLowerCase() &&
        p.background.toLowerCase() === settings.background.toLowerCase() &&
        settings.backgroundType === 'solid',
    )?.id ?? ''

  const gradientId =
    settings.backgroundType !== 'solid'
      ? GRADIENT_PRESETS.find(
          (g) =>
            g.from.toLowerCase() === settings.background.toLowerCase() &&
            g.to.toLowerCase() === settings.backgroundSecondary.toLowerCase(),
        )?.id ?? ''
      : ''

  const applyGradientPreset = (id: string) => {
    const g = GRADIENT_PRESETS.find((x) => x.id === id)
    if (!g) return
    onChange({
      backgroundType: 'linear',
      background: g.from,
      backgroundSecondary: g.to,
      gradientAngle: g.angle,
      transparentBackground: false,
      outerMargin: Math.max(settings.outerMargin, 64),
      windowShadow: Math.max(settings.windowShadow, 50),
    })
  }

  return (
    <aside className="w-full rounded-xl border bg-card/40 px-4">
      <Accordion type="multiple" defaultValue={['code', 'export']}>
        {/* ─── Code ───────────────────────────────────────────────── */}
        <AccordionItem value="code">
          <AccordionTrigger>
            <SectionTitle icon={<RiCodeSSlashLine />} title="Code" />
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel label="Syntax theme" />
              <Select
                value={settings.theme}
                onValueChange={(v) => {
                  const theme = v as Theme
                  onChange({
                    theme,
                    highlightColor: defaultHighlightFor(theme),
                  })
                }}
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
              <FieldLabel label="Font family" />
              <FontCombobox
                value={settings.codeFont}
                onChange={(codeFont) => onChange({ codeFont })}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border bg-input/20 px-2.5 py-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className={settings.htmlInCanvas ? '' : 'opacity-50'}>
                  Ligatures
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="About ligatures"
                      className="inline-flex cursor-pointer items-center text-muted-foreground hover:text-foreground"
                    >
                      <RiInformationLine className="size-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    side="top"
                    className="w-64 text-xs leading-relaxed"
                  >
                    <p>
                      Renders <code>=&gt;</code>, <code>!=</code>,{' '}
                      <code>-&gt;</code> as single glyphs. Requires the{' '}
                      <strong>HTML-in-Canvas renderer</strong> (Renderer
                      section) and a font that ships programming ligatures
                      (marked with <span aria-hidden>ﬁ</span> in the font
                      picker).
                    </p>
                  </PopoverContent>
                </Popover>
              </span>
              <Switch
                checked={settings.htmlInCanvas && settings.ligatures}
                disabled={!settings.htmlInCanvas}
                onCheckedChange={(ligatures) => onChange({ ligatures })}
              />
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

            <label className="flex cursor-pointer items-center justify-between rounded-md border bg-input/20 px-2.5 py-2 text-xs">
              <span>Show line numbers</span>
              <Switch
                checked={settings.lineNumbers}
                onCheckedChange={(lineNumbers) => onChange({ lineNumbers })}
              />
            </label>
          </AccordionContent>
        </AccordionItem>

        {/* ─── Highlight ──────────────────────────────────────────── */}
        <AccordionItem value="highlight">
          <AccordionTrigger>
            <SectionTitle icon={<RiMarkPenLine />} title="Highlight" />
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <FieldLabel label="Lines" />
              <Input
                placeholder="e.g. 3, 5-7"
                value={settings.highlightedLines}
                onChange={(e) =>
                  onChange({ highlightedLines: e.target.value })
                }
                className="h-7 text-xs tabular-nums"
              />
              <span className="text-[10px] text-muted-foreground">
                Type ranges or click bubbles in the editor.
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel label="Color" />
              <ColorField
                value={settings.highlightColor}
                onChange={(highlightColor) =>
                  onChange({ highlightColor })
                }
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ─── Look ───────────────────────────────────────────────── */}
        <AccordionItem value="look">
          <AccordionTrigger>
            <SectionTitle icon={<RiPaletteLine />} title="Look" />
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
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
                    backgroundSecondary: p.background,
                    backgroundType: 'solid',
                    transparentBackground: false,
                    highlightColor: defaultHighlightFor(p.theme),
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
              <FieldLabel label="Background style" />
              <ToggleGroup
                type="single"
                spacing={0}
                value={settings.backgroundType}
                onValueChange={(v) => {
                  if (!v) return
                  onChange({ backgroundType: v as BackgroundType })
                }}
                className="grid w-full grid-cols-3"
              >
                <ToggleGroupItem
                  value="solid"
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px]"
                >
                  Solid
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="linear"
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px]"
                >
                  Linear
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="radial"
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px]"
                >
                  Radial
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {settings.backgroundType !== 'solid' && (
              <div className="flex flex-col gap-1.5">
                <FieldLabel label="Gradient presets" />
                <div className="grid grid-cols-4 gap-1.5">
                  {GRADIENT_PRESETS.map((g) => {
                    const active = gradientId === g.id
                    return (
                      <button
                        key={g.id}
                        type="button"
                        title={g.label}
                        onClick={() => applyGradientPreset(g.id)}
                        className={`h-8 rounded-md border transition-all ${active ? 'ring-2 ring-ring ring-offset-2 ring-offset-card' : 'hover:scale-105'}`}
                        style={{
                          backgroundImage: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`,
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <FieldLabel label="Window" />
                <ColorField
                  value={settings.windowColor}
                  onChange={(windowColor) => onChange({ windowColor })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel label="Canvas" />
                <ColorField
                  value={settings.background}
                  onChange={(background) => onChange({ background })}
                  disabled={settings.transparentBackground}
                />
              </div>
            </div>

            {settings.backgroundType !== 'solid' && (
              <div className="flex flex-col gap-1.5">
                <FieldLabel label="Secondary color" />
                <ColorField
                  value={settings.backgroundSecondary}
                  onChange={(backgroundSecondary) =>
                    onChange({ backgroundSecondary })
                  }
                  disabled={settings.transparentBackground}
                />
              </div>
            )}

            {settings.backgroundType === 'linear' && (
              <SliderInput
                label="Gradient angle"
                value={settings.gradientAngle}
                min={0}
                max={360}
                step={5}
                unit="°"
                onChange={(gradientAngle) => onChange({ gradientAngle })}
              />
            )}

            <label className="flex cursor-pointer items-center justify-between rounded-md border bg-input/20 px-2.5 py-2 text-xs">
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
          </AccordionContent>
        </AccordionItem>

        {/* ─── Window ─────────────────────────────────────────────── */}
        <AccordionItem value="window">
          <AccordionTrigger>
            <SectionTitle icon={<RiWindow2Line />} title="Window" />
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
            <label className="flex cursor-pointer items-center justify-between rounded-md border bg-input/20 px-2.5 py-2 text-xs">
              <span>Show chrome</span>
              <Switch
                checked={settings.chrome}
                onCheckedChange={(chrome) => onChange({ chrome })}
              />
            </label>

            {settings.chrome && (
              <div className="flex flex-col gap-1.5">
                <FieldLabel label="Style" />
                <ChromeStyleCombobox
                  value={settings.chromeStyle}
                  onChange={(chromeStyle) =>
                    onChange({
                      chromeStyle,
                      ...CHROME_STYLE_PATCHES[chromeStyle](settings),
                    })
                  }
                />
              </div>
            )}

            {settings.chrome && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Chrome color
                  </span>
                  {settings.chromeColor.toLowerCase() !==
                    settings.windowColor.toLowerCase() && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange({ chromeColor: settings.windowColor })
                      }
                      className="text-[10px] text-muted-foreground transition-colors hover:text-primary"
                    >
                      Match window
                    </button>
                  )}
                </div>
                <ColorField
                  value={settings.chromeColor}
                  onChange={(chromeColor) => onChange({ chromeColor })}
                />
                <div className="grid grid-cols-5 gap-1.5">
                  {CHROME_COLOR_PRESETS.map((c) => {
                    const active =
                      settings.chromeColor.toLowerCase() ===
                      c.hex.toLowerCase()
                    return (
                      <button
                        key={c.id}
                        type="button"
                        title={c.label}
                        onClick={() => onChange({ chromeColor: c.hex })}
                        className={`h-6 rounded border transition-all ${active ? 'ring-2 ring-ring ring-offset-2 ring-offset-card' : 'hover:scale-110'}`}
                        style={{ backgroundColor: c.hex }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            <SliderInput
              label="Padding around window"
              value={settings.outerMargin}
              min={0}
              max={200}
              step={2}
              unit="px"
              onChange={(outerMargin) => onChange({ outerMargin })}
            />

            <SliderInput
              label="Window shadow"
              value={settings.windowShadow}
              min={0}
              max={100}
              step={1}
              onChange={(windowShadow) => onChange({ windowShadow })}
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

            <SliderInput
              label="Border width"
              value={settings.borderWidth}
              min={0}
              max={8}
              step={1}
              unit="px"
              onChange={(borderWidth) => onChange({ borderWidth })}
            />

            {settings.borderWidth > 0 && (
              <div className="flex flex-col gap-1.5">
                <FieldLabel label="Border color" />
                <ColorField
                  value={settings.borderColor}
                  onChange={(borderColor) => onChange({ borderColor })}
                />
              </div>
            )}

            <SliderInput
              label="Inner padding X"
              value={settings.paddingX}
              min={0}
              max={160}
              step={2}
              unit="px"
              onChange={(paddingX) => onChange({ paddingX })}
            />

            <SliderInput
              label="Inner padding Y"
              value={settings.paddingY}
              min={0}
              max={160}
              step={2}
              unit="px"
              onChange={(paddingY) => onChange({ paddingY })}
            />
          </AccordionContent>
        </AccordionItem>

        {/* ─── Canvas ─────────────────────────────────────────────── */}
        <AccordionItem value="canvas">
          <AccordionTrigger>
            <SectionTitle icon={<RiLayoutGridLine />} title="Canvas" />
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
            <SizePresetCombobox
              width={settings.width}
              height={settings.height}
              onChange={({ width, height }) => onChange({ width, height })}
            />

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
                  disabled={settings.autoHeight}
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-md border bg-input/20 px-2.5 py-2 text-xs">
              <span>Auto-fit height to code</span>
              <Switch
                checked={settings.autoHeight}
                onCheckedChange={(autoHeight) => onChange({ autoHeight })}
              />
            </label>
          </AccordionContent>
        </AccordionItem>

        {/* ─── Renderer (experimental) ───────────────────────────── */}
        {htmlInCanvasSupported && (
          <AccordionItem value="renderer">
            <AccordionTrigger>
              <SectionTitle icon={<RiFlaskLine />} title="Renderer" />
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-between rounded-md border bg-input/20 px-2.5 py-2 text-xs">
                <span className="flex flex-col">
                  <span>HTML-in-Canvas (experimental)</span>
                  <span className="text-[10px] text-muted-foreground">
                    Uses the browser's real CSS rendering for PNG export.
                    Required for ligatures.
                  </span>
                </span>
                <Switch
                  checked={settings.htmlInCanvas}
                  onCheckedChange={(htmlInCanvas) =>
                    onChange({ htmlInCanvas })
                  }
                />
              </label>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* ─── Export ─────────────────────────────────────────────── */}
        <AccordionItem value="export">
          <AccordionTrigger>
            <SectionTitle icon={<RiDownload2Line />} title="Export" />
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
            {settings.chrome && (
              <div className="flex flex-col gap-1">
                <FieldLabel label="Filename" />
                <Input
                  placeholder={proposedFilename}
                  value={settings.filename}
                  onChange={(e) => onChange({ filename: e.target.value })}
                  className="h-7 text-xs"
                />
                <span className="text-[10px] text-muted-foreground">
                  Saves as <span className="tabular-nums">{proposedFilename}</span>
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={rendering || multi}
                onClick={onCopyPng}
                title={multi ? 'Copy is for single images only' : undefined}
              >
                <RiClipboardLine data-icon="inline-start" />
                Copy PNG
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={rendering}
                onClick={onDownloadPng}
              >
                <RiImageLine data-icon="inline-start" />
                {multi ? `PNG · ${pageCount}` : 'PNG'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={rendering || multi}
                onClick={onCopySvg}
                title={multi ? 'Copy is for single images only' : undefined}
              >
                <RiClipboardLine data-icon="inline-start" />
                Copy SVG
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={rendering}
                onClick={onDownloadSvg}
              >
                <RiFileCodeLine data-icon="inline-start" />
                {multi ? `SVG · ${pageCount}` : 'SVG'}
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  )
}
