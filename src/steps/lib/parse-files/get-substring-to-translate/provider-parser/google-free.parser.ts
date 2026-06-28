import { JASSExtension, StringsExtension } from "../../../../store/extensions";
import type { ProviderStringParser } from "../common";

/**
 * NOTES
 * Add spacing in encoding because provider treats tags badly when near numbers
 * Remove all multiple spaces when decoding
 */

export const patternReplacer = {
  colorCode: {
    open: {
      from: [/\|c([A-Fa-f0-9]{8})/gi, ' <div data-color="$1"> '],
      to: [/<div\s*data-color="([A-Fa-f0-9]{8})"\s*>/gi, "|c$1"],
    },
    close: {
      from: [/\|r/gi, " </div> "],
      to: [/\s*<\s*\/div\s*>\s*/gi, "|r"],
    },
  },
  nextDescription: {
    from: [/,/g, ' <span translate="no">{{comma}}</span> '],
    to: [/<span\s*translate="no"\s*>{{comma}}<\/span>/gi, ","],
  },
  newLine: {
    from: ["|n", ' <span translate="no">{{|n}}</span> '],
    to: [/\s*<span\s*translate="no"\s*>{{\|n}}<\/span>\s*/gi, "|n"],
  },
  defaultNewLine: {
    from: ["\n", ' <span translate="no" >{{newLine}}</span> '],
    to: [/\s*<span\s*translate="no"\s*>{{newLine}}<\/span>\s*/gi, "\n"],
  },
  inCodeColorCode: {
    open: {
      from: [/\|c([A-Fa-f0-9]{8})/gi, " <$1> "],
      to: [/<([A-Fa-f0-9]{8})>/gi, "|c$1"],
    },
    close: {
      from: [/\|r/gi, " <R> "],
      to: [/<R>/gi, "|r"],
    },
  },
  quotes: {
    from: ["&quot;", "[[quote]]"],
    to: ["[[quote]]", "&quot;"],
  },
} as const;

export const googleFreeParser: ProviderStringParser = {
  [StringsExtension.literals[0]]: {
    encode: (value) =>
      value
        .replaceAll(...patternReplacer.colorCode.open.from)
        .replaceAll(...patternReplacer.colorCode.close.from)
        .replaceAll(...patternReplacer.newLine.from)
        .replaceAll(...patternReplacer.nextDescription.from)
        .trim(),

    decode: (value) =>
      value
        .replaceAll(...patternReplacer.colorCode.open.to)
        .replaceAll(...patternReplacer.colorCode.close.to)
        .replaceAll(...patternReplacer.newLine.to)
        /** Not allowed, replace with chinese before nextDescription replace */
        .replaceAll(/,/g, "，")
        .replaceAll(...patternReplacer.nextDescription.to)
        /** Not allowed, replace with chinese after all html replacement */
        .replaceAll(/</g, "＜")
        .replaceAll(/>/g, "＞")
        .replaceAll(/\s{2,}/g, " "),
  },
  [JASSExtension.literals[0]]: {
    encode: (value) =>
      value
        .replaceAll(...patternReplacer.inCodeColorCode.open.from)
        .replaceAll(...patternReplacer.inCodeColorCode.close.from)
        .replaceAll(...patternReplacer.defaultNewLine.from)
        .replaceAll(...patternReplacer.quotes.from),
    /*  .replaceAll(...patternReplacer.codeRepeatedBackslash.from), */
    decode: (value) =>
      value
        .replaceAll(...patternReplacer.inCodeColorCode.open.to)
        .replaceAll(...patternReplacer.inCodeColorCode.close.to)
        .replaceAll(...patternReplacer.defaultNewLine.to)
        .replaceAll(...patternReplacer.quotes.to)
        .replace(/(\\{5,})/gi, "")
        /* .replaceAll(...patternReplacer.codeRepeatedBackslash.to) */
        .replaceAll(/"(.*?)"/gi, "“$1”")
        .replaceAll("&quot;", '\\"')
        .replaceAll(/(?<!\\)"/g, '\\"')
        .replaceAll(/\s{2,}/g, " "),
  },
};
