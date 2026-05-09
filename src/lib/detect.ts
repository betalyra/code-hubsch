import { LANGUAGE_SAMPLES } from './samples'
import type { Language } from './types'

const TOKEN_RE =
  /#!\/[^\n]*|```+|##+|<!DOCTYPE|<!--|-->|===|!==|=>|::|:=|<=|>=|&&|\|\||\+\+|--|<-|<\|?|\?\.|\?\?|\.\.\.|\/>|<\/|@media|--[a-zA-Z][\w-]*|[a-zA-Z_$#][\w$.-]*|[<>{}()[\];,:.@#$%^&*+\-=!?\\|/'"`~]/g

const tokenize = (code: string): string[] => {
  const out: string[] = []
  TOKEN_RE.lastIndex = 0
  let m: RegExpExecArray | null
  // biome-ignore lint/suspicious/noAssignInExpressions: regex iteration idiom
  while ((m = TOKEN_RE.exec(code)) !== null) out.push(m[0])
  return out
}

interface Model {
  langs: ReadonlyArray<Language>
  tfs: Record<Language, ReadonlyMap<string, number>>
  docLens: Record<Language, number>
  avgDocLen: number
  df: ReadonlyMap<string, number>
  N: number
}

const buildModel = (): Model => {
  const langs = Object.keys(LANGUAGE_SAMPLES) as Language[]
  const tfs = {} as Record<Language, Map<string, number>>
  const docLens = {} as Record<Language, number>
  const df = new Map<string, number>()
  let total = 0

  for (const lang of langs) {
    const samples = LANGUAGE_SAMPLES[lang] ?? []
    const tokens = samples.flatMap((s) => tokenize(s))
    const tf = new Map<string, number>()
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1)
    tfs[lang] = tf
    docLens[lang] = tokens.length
    total += tokens.length
    for (const term of tf.keys()) df.set(term, (df.get(term) ?? 0) + 1)
  }

  return {
    langs,
    tfs,
    docLens,
    avgDocLen: langs.length === 0 ? 0 : total / langs.length,
    df,
    N: langs.length,
  }
}

const MODEL = buildModel()

const K1 = 1.5
const B = 0.75

export interface DetectionScore {
  language: Language
  score: number
}

export interface Detection {
  language: Language
  scores: ReadonlyArray<DetectionScore>
  confidence: number
}

export const detectLanguage = (code: string): Detection | undefined => {
  if (!code.trim()) return undefined
  const tokens = tokenize(code)
  if (tokens.length < 6) return undefined

  // Distinct query terms only — TF inside each language doc handles the rest.
  const terms = Array.from(new Set(tokens))

  const scores = {} as Record<Language, number>
  for (const lang of MODEL.langs) scores[lang] = 0

  for (const term of terms) {
    const docFreq = MODEL.df.get(term)
    if (docFreq === undefined || docFreq === 0) continue
    const idf = Math.log((MODEL.N - docFreq + 0.5) / (docFreq + 0.5) + 1)
    if (idf <= 0) continue
    for (const lang of MODEL.langs) {
      const tf = MODEL.tfs[lang].get(term) ?? 0
      if (tf === 0) continue
      const docLen = MODEL.docLens[lang]
      const norm =
        (tf * (K1 + 1)) /
        (tf + K1 * (1 - B + B * (docLen / MODEL.avgDocLen)))
      scores[lang] += idf * norm
    }
  }

  const ranked = MODEL.langs
    .map((lang) => ({ language: lang, score: scores[lang] }))
    .sort((a, b) => b.score - a.score)

  const top = ranked[0]
  if (!top || top.score <= 0) return undefined
  const second = ranked[1]?.score ?? 0
  const gap = top.score - second
  const confidence = Math.min(1, gap / Math.max(top.score, 0.001))

  return { language: top.language, scores: ranked, confidence }
}
