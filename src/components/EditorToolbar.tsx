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

  return (
    <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
      <h2 className="pt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Editor
      </h2>

      <div className="flex w-full flex-col gap-1 sm:w-56">
        <LanguageCombobox value={language} onChange={onLanguageChange} />
        {showDetected && (
          <button
            type="button"
            onClick={() => onLanguageChange(detected.language)}
            className="self-end text-[10px] text-muted-foreground transition-colors hover:text-primary"
          >
            Detected:{' '}
            <span className="text-foreground">
              {LANGUAGES.find((l) => l.value === detected.language)?.label}
            </span>{' '}
            — apply
          </button>
        )}
      </div>
    </div>
  )
}
