import { pipe } from "effect";

import { ExtensionToTranslate, JASSExtension, StringsExtension } from "../store/extensions";
import { KO, TranslateToLocale, ZH, type TranslateFromLocale } from "../store/locales";

const colorCode = [/\|c([A-Fa-f0-9]{8})/gi, /\s*\[\[([A-Fa-f0-9]{8})\]\]\s*/gi] as const;
const colorClose = [/\|r/gi, /\s*\[\[R\]\]\s*/g] as const;
const newLine = [/\|n/g, /\s*\[\[BRK\]\]\s*/g] as const;
const nextDescription = [/,/g, /\s*<br>\s*/g] as const;

const encodeCommon = (value: string) =>
  value
    .replace(colorCode[0], " [[$1]] ")
    .replace(colorClose[0], " [[R]] ")
    .replace(newLine[0], " [[BRK]] ")
    .replace(nextDescription[0], " <br> ");

const encodeJassCommon = (value: string) =>
  value.replace(colorCode[0], " [[$1]] ").replace(colorClose[0], " [[R]] ");

const decodeCommon = (value: string) =>
  value
    .replace(colorCode[1], "|c$1")
    .replace(colorClose[1], "|r")
    .replace(newLine[1], "|n")
    /** Not allowed, replace with chinese */
    .replace(/,/g, "，")
    .replace(nextDescription[1], ",")
    /** Not allowed, replace with chinese */
    .replace(/</g, "＜")
    /** Not allowed, replace with chinese */
    .replace(/>/g, "＞");

const decodeJassCommon = (value: string) =>
  value.replace(colorCode[1], "|c$1").replace(colorClose[1], "|r");

/** Select damage string as "민첩X24의" because google translate it badly and not consistent */
const koreanDamagePhrase = /(\p{Script=Hangul}+)x(\d+(?:.\d+)?\p{Script=Hangul}*)/giu;
const encodeForLocale: Record<TranslateFromLocale, (raw: string) => string> = {
  [KO.literals[0]]: (raw) => raw.replace(koreanDamagePhrase, "「$1x$2」"),
  [ZH.literals[0]]: (raw) => raw,
};
const encodeByLocale = (raw: string, from?: TranslateFromLocale) =>
  from ? encodeForLocale[from](raw) : raw;

const decodeForLocale: Partial<
  Record<TranslateFromLocale, Partial<Record<TranslateToLocale, (raw: string) => string>>>
> = {};

const decodeByLocale = (raw: string, from?: TranslateFromLocale, to?: TranslateToLocale) =>
  from && decodeForLocale[from] && to && decodeForLocale[from][to]
    ? encodeForLocale[from](raw)
    : raw;

export type WarcraftStringParseProps = {
  value: string;
  from?: TranslateFromLocale;
  to?: TranslateToLocale;
};

type Parser = {
  encode: (props: WarcraftStringParseProps) => string;
  decode: (props: WarcraftStringParseProps) => string;
  clean?: (value: string) => string;
};

export const warcraftString: Record<ExtensionToTranslate, Parser> = {
  [StringsExtension.literals[0]]: {
    encode: ({ value, from }: WarcraftStringParseProps) =>
      pipe(value, encodeCommon, (value) => encodeByLocale(value, from)),

    decode: ({ value, from, to }: WarcraftStringParseProps) =>
      pipe(value, decodeCommon, (value) => decodeByLocale(value, from, to)),

    clean: (value: string) =>
      value.replace(colorCode[0], "").replace(colorClose[0], "").replace(newLine[0], "\n"),
  },
  [JASSExtension.literals[0]]: {
    encode: ({ value }: WarcraftStringParseProps) => pipe(value, encodeJassCommon),
    decode: ({ value }: WarcraftStringParseProps) => pipe(value, decodeJassCommon),
  },
};
