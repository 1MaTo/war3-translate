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
      to: [/\s*<div\s*data-color="([A-Fa-f0-9]{8})"\s*>\s*/gi, "|c$1"],
    },
    close: {
      from: [/\|r/gi, " </div> "],
      to: [/\s*<\s*\/div\s*>\s*/gi, "|r"],
    },
  },
  nextDescription: {
    from: [/,/g, ' <span translate="no">{{comma}}</span> '],
    to: [/\s*<span\s*translate="no"\s*>{{comma}}<\/span>\s*/gi, ","],
  },
  newLine: {
    from: ["|n", ' <span translate="no">{{|n}}</span> '],
    to: [/\s*<span\s*translate="no"\s*>{{\|n}}<\/span>\s*/gi, "|n"],
  },
} as const;

export const googleFreeParser: ProviderStringParser = {
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
      .replaceAll(/>/g, "＞"),
};
