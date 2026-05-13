import { LanguageCombobox } from '#/components/LanguageCombobox'
import { LANGUAGES, type Language } from '#/lib/types'

interface DetectionHint {
  language: Language
  confidence: number
}

interface Props {
  language: Language
  detected?: DetectionHint
  onLanguageChange: (language: Language) => void
}

export function EditorToolbar({
  language,
  detected,
  onLanguageChange,
}: Props) {
  const showDetected =
    detected !== undefined &&
    detected.language !== language &&
    detected.confidence > 0.05

  const detectedNode = showDetected ? (
    <button
      type="button"
      onClick={() => onLanguageChange(detected.language)}
      className="text-xs text-muted-foreground transition-colors hover:text-primary"
    >
      Detected:{' '}
      <span className="text-foreground">
        {LANGUAGES.find((l) => l.value === detected.language)?.label}
      </span>{' '}
      — apply
    </button>
  ) : null

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="size-1.5 rounded-full bg-accent-pink/80"
        />
        <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Editor
        </h2>
      </div>

      <div className="flex w-full flex-col items-end gap-1 sm:w-auto sm:flex-row-reverse sm:items-center sm:gap-3">
        <div className="w-full sm:w-56">
          <LanguageCombobox value={language} onChange={onLanguageChange} />
        </div>
        {detectedNode}
      </div>
    </div>
  )
}
