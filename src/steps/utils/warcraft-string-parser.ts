import { pipe } from "effect";

import { ExtensionToTranslate, JASSExtension, StringsExtension } from "../store/extensions";
import { KO, TranslateToLocale, ZH, type TranslateFromLocale } from "../store/locales";

//#region COMMON

const strings = {
  /** This symbols is badly translated by providers */
  unsafeSymbols: [/([：])/g, /\[\[([：])\]\]\s*/g],
  colorCode: [/\|c([A-Fa-f0-9]{8})/gi, /\s*\[\[([A-Fa-f0-9]{8})\]\]\s*/gi],
  colorClose: [/\|r/gi, /\s*\[\[R\]\]\s*/g],
  newLine: [/\|n/g, /\s*\[\[BRK\]\]\s*/g],
  nextDescription: [/,/g, /\s*<br>\s*/gi],
} as const;

//#endregion

//#region JASS

const jass = {
  colorCode: [/\|c([A-Fa-f0-9]{8})/gi, / *\[\[([A-Fa-f0-9]{8})\]\] */gi],
  colorClose: [/\|r/gi, / *\[\[R\]\] */g],
  newLine: [/\|n/g, / *\[\[BRK\]\] */g],
  nextDescription: [/,/g, / *<br> */g],

  /** Weird using of repeated symbols */
  multiBackslash: [/((?:\\){3,})/gi, / *\[\[((?:\\){3,})]\] */gi],
  newCodeLine: [/\r?\n/g, / *\[\[BRKH\]\] */g],
  /** Used in j file to proper format final string */
  startEmptySpace: [/^ /g, /\[\[SPCS\]\] ?/g],
  endEmptySpace: [/ $/g, / ?\[\[SPCE\]\]/g],
} as const;

//#endregion

const encodeCommon = (value: string) =>
  value
    .replace(strings.colorCode[0], " [[$1]] ")
    .replace(strings.colorClose[0], " [[R]] ")
    .replace(strings.newLine[0], " [[BRK]] ")
    .replace(strings.nextDescription[0], " <br> ")
    .replace(strings.unsafeSymbols[0], "[[$1]]");

const encodeJassCommon = (value: string) =>
  value
    .replace(jass.startEmptySpace[0], "[[SPCS]] ")
    .replace(jass.endEmptySpace[0], " [[SPCE]]")
    .replace(jass.colorCode[0], " [[$1]] ")
    .replace(jass.colorClose[0], " [[R]] ")
    .replace(jass.multiBackslash[0], " [[$1]] ")
    .replace(jass.newCodeLine[0], " [[BRKH]] ");

const decodeCommon = (value: string) =>
  value
    .replace(strings.colorCode[1], "|c$1")
    .replace(strings.colorClose[1], "|r")
    .replace(strings.newLine[1], "|n")
    .replace(strings.unsafeSymbols[1], "$1")
    /** Deepl replace 「」with &quot; */
    .replace(/&quot;(.*?)&quot;/g, "「$1」")
    .replace(/“(.*?)”/g, "「$1」")
    .replace(/\\?"(.*?)\\?"/g, "「$1」")
    /** Not allowed, replace with chinese */
    .replace(/,/g, "，")
    .replace(strings.nextDescription[1], ",")
    /** Not allowed, replace with chinese */
    .replace(/</g, "＜")
    /** Not allowed, replace with chinese */
    .replace(/>/g, "＞")
    .replace(/^\s*/g, "")
    .replace(/ *$/g, "");

const decodeJassCommon = (value: string) =>
  value
    .replace(jass.colorCode[1], " |c$1")
    .replace(jass.colorClose[1], "|r ")
    .replace(jass.multiBackslash[1], " $1")
    .replace(jass.newCodeLine[1], "\r\n")
    .replace(jass.startEmptySpace[1], " ")
    .replace(jass.endEmptySpace[1], " ");

/** Select damage string as "민첩X24의" because google translate it badly and not consistent */
const koreanDamagePhrase = /(\p{Script=Hangul}+)x(\d+(?:.\d+)?\p{Script=Hangul}*)/giu;
const encodeForLocale: Record<TranslateFromLocale, (raw: string) => string> = {
  [KO.literals[0]]: (raw) => raw.replace(koreanDamagePhrase, "“$1x$2”"),
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
      value
        .replace(strings.colorCode[0], "")
        .replace(strings.colorClose[0], "")
        .replace(strings.newLine[0], "\n"),
  },
  [JASSExtension.literals[0]]: {
    encode: ({ value }: WarcraftStringParseProps) => pipe(value, encodeJassCommon),
    decode: ({ value }: WarcraftStringParseProps) => pipe(value, decodeJassCommon),
  },
};
