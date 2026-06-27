import type {
  ExtensionToTranslate,
  JASSExtension,
  StringsExtension,
} from "../../../store/extensions";
import { KO, ZH, type TranslateFromLocale } from "../../../store/locales";
import type { TranslateProvider } from "../../../store/translate-provider";

export type ParsedSubstring = {
  id: string;
  /** Chunk for this substring right after all occurrences of substring replaced */
  chunk: string;
  extension: ExtensionToTranslate;
} & ExtractedSubstring;

export type ExtractedSubstring = {
  /** Raw substring from chunk */
  raw: string;
  /** Parsed substring according to locale and file format */
  transformed: string;
};

/** Parse chunk if found text to translate and return info, null if nothing to translate */
export type MakeTranslateExtractor = (props: {
  locale: TranslateFromLocale;
  provider: TranslateProvider;
}) => (chunk: string) => ExtractedSubstring[] | null;

export const localeMatch: Record<TranslateFromLocale, string> = {
  [KO.literals[0]]: "\\p{Script=Hangul}",
  [ZH.literals[0]]: "[\u4E00-\u9FFF]",
} as const;

export type ProviderStringParser = {
  [StringsExtension.Type]: {
    /** From warcraft to html */
    encode: (value: string) => string;
    /** From html to warcraft */
    decode: (value: string) => string;
  };
  [JASSExtension.Type]: {
    /** From warcraft to html */
    encode: (value: string) => string;
    /** From html to warcraft */
    decode: (value: string) => string;
  };
};
