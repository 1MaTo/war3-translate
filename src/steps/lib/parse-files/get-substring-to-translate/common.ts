import { KO, ZH, type TranslateFromLocale } from "../../../store/locales";
import type { TranslateProvider } from "../../../store/translate-provider";

export type ParsedSubstring = {
  /** Raw substring from chunk */
  raw: string;
  /** Parsed substring according to locale and file format */
  transformed: string;
};

export type ParsedChunk = {
  id: string;
  /** Same chunk but with replaced substring with id */
  chunk: string;
  substring: ParsedSubstring;
};

/** Parse chunk if found text to translate and return info, null if nothing to translate */
export type MakeTranslateExtractor = (
  locale: TranslateFromLocale,
  provider: TranslateProvider,
) => (chunk: string) => ParsedSubstring | null;

export const localeMatch: Record<TranslateFromLocale, string> = {
  [KO.literals[0]]: "\\p{Script=Hangul}",
  [ZH.literals[0]]: "[\u4E00-\u9FFF]",
} as const;

export type ProviderStringParser = {
  /** From warcraft to html */
  encode: (value: string) => string;
  /** From html to warcraft */
  decode: (value: string) => string;
};
