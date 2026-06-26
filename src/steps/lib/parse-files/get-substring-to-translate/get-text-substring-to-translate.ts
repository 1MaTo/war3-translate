import { localeMatch, type MakeTranslateExtractor } from "./common";

/** List of warcraft 3 string file properties that ok to translate (it is possible to see this strings in game) */
const validProperty: string[] = [
  "agility",
  "agility_hilight",
  "awakentip",
  "bonus_defense_fixed",
  "bonus_hpregen",
  "bonus_manaregen",
  "bufftip",
  "buffubertip",
  "colon_agility",
  "colon_gold",
  "colon_gold_income_rate",
  "colon_intellect",
  "colon_lumber",
  "colon_lumber_income_rate",
  "colon_strength",
  "description",
  "gold",
  "goldandlumberfromally",
  "goldfromally",
  "intellect",
  "intellect_hilight",
  "intelligence",
  "lumber",
  "lumberfromally",
  "name",
  "nogold",
  "nolumber",
  "propernames",
  "researchtip",
  "researchubertip",
  "resource_ubertip_gold",
  "resource_ubertip_lumber",
  "revivetip",
  "strength",
  "strength_hilight",
  "tip",
  "ubertip",
  "untip",
  "unubertip",
  "upkeep_high",
  "upkeep_low",
  "upkeep_none",
];

export const patternReplacer = {
  colorCode: {
    open: {
      from: [/\|c([A-Fa-f0-9]{8})/gi, '<div data-color="$1">'],
      to: [/<div data-color="([A-Fa-f0-9]{8})">/gi, "|c$1"],
    },
    close: {
      from: [/\|r/gi, "</div>"],
      to: ["</div>", "|r"],
    },
  },
  nextDescription: {
    from: [/,/g, '<span translate="no">{{comma}}</span>'],
    to: ['<span translate="no">{{comma}}</span>', ","],
  },
  newLine: {
    from: ["|n", '<span translate="no">{{|n}}</span>'],
    to: ['<span translate="no">{{|n}}</span>', "|n"],
  },
} as const;

// const strings = {
//   /** This symbols is badly translated by providers */
//   unsafeSymbols: [/([：])/g, /\[\[([：])\]\]\s*/g],
//   colorCode: [/\|c([A-Fa-f0-9]{8})/gi, /\s*\[\[([A-Fa-f0-9]{8})\]\]\s*/gi],
//   colorClose: [/\|r/gi, /\s*\[\[R\]\]\s*/gi],
//   newLine: [/\|n/g, /\s*\[\[BRK\]\]\s*/gi],
//   nextDescription: [/,/g, /\s*<br>\s*/gi],
// } as const;

export const makeTextTranslateExtractor: MakeTranslateExtractor = (locale) => {
  const matcher = new RegExp(
    `^(?:${validProperty.join("|")})=(.*${localeMatch[locale]}+.*)$`,
    "iu",
  );
  return (line) => {
    const raw = line.match(matcher)?.[1];
    if (!raw) return null;

    return {
      raw,
      transformed: raw
        .replaceAll(...patternReplacer.colorCode.open.from)
        .replaceAll(...patternReplacer.colorCode.close.from)
        .replaceAll(...patternReplacer.newLine.from)
        .replaceAll(...patternReplacer.nextDescription.from),
    };
  };
};
