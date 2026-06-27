import { JASSExtension, StringsExtension } from "../../../../store/extensions";
import type { ProviderStringParser } from "../common";

export const patternReplacer = {
  colorCode: {
    open: {
      from: [/\|c([A-Fa-f0-9]{8})/gi, '<div data-color="$1">'],
      to: [/\s*<div data-color="([A-Fa-f0-9]{8})">\s*/gi, "|c$1"],
    },
    close: {
      from: [/\|r/gi, "</div>"],
      to: [/\s*<\/div>\s*/gi, "|r"],
    },
  },
  nextDescription: {
    from: [/,/g, '<span translate="no">{{comma}}</span>'],
    to: [/\s*<span translate="no">{{comma}}<\/span>\s*/gi, ","],
  },
  newLine: {
    from: ["|n", '<span translate="no">{{|n}}</span>'],
    to: [/\s*<span translate="no">{{\|n}}<\/span>\s*/gi, "|n"],
  },
} as const;

export const deeplParser: ProviderStringParser = {
  [StringsExtension.literals[0]]: {
    encode: (value) =>
      value
        .replaceAll(...patternReplacer.colorCode.open.from)
        .replaceAll(...patternReplacer.colorCode.close.from)
        .replaceAll(...patternReplacer.newLine.from)
        .replaceAll(...patternReplacer.nextDescription.from),

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
        /** Deepl replace 「」with &quot; */
        .replaceAll(/&quot;(.*?)&quot;/g, "「$1」")
        /** Deepl replace ' with &#x27; */
        .replaceAll(/&#x27;/g, "'"),
  },
  [JASSExtension.literals[0]]: {
    encode: (value) => value,
    decode: (value) => value,
  },
};
