import type { Language } from '#/lib/types'
import { DATA_SAMPLES } from './data'
import { DOTNET_SAMPLES } from './dotnet'
import { FUNCTIONAL_SAMPLES } from './functional'
import { JVM_SAMPLES } from './jvm'
import { OTHER_SAMPLES } from './other'
import { SCRIPTING_SAMPLES } from './scripting'
import { SHELL_SAMPLES } from './shell'
import { SYSTEMS_SAMPLES } from './systems'
import { WEB_SAMPLES } from './web'

const merged = {
  ...WEB_SAMPLES,
  ...DATA_SAMPLES,
  ...SHELL_SAMPLES,
  ...SYSTEMS_SAMPLES,
  ...JVM_SAMPLES,
  ...DOTNET_SAMPLES,
  ...FUNCTIONAL_SAMPLES,
  ...SCRIPTING_SAMPLES,
  ...OTHER_SAMPLES,
} as Partial<Record<Language, ReadonlyArray<string>>>

export const LANGUAGE_SAMPLES: Readonly<
  Record<Language, ReadonlyArray<string>>
> = merged as Readonly<Record<Language, ReadonlyArray<string>>>
