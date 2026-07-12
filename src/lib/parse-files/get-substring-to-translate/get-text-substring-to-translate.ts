import { localeMatch, type MakeTranslateExtractor } from "./common";
import { providerParser } from "./provider-parser/provider-parser";

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

export const makeTextTranslateExtractor: MakeTranslateExtractor = ({
  locale,
  provider,
  manual,
}) => {
  const matchByPattern = new RegExp(`^(?:${validProperty.join("|")})=(.*)$`, "i");
  const matchByLocale = new RegExp(`^.*${localeMatch[locale]}+.*$`, "iu");

  const parser = providerParser[provider].txt.encode;
  return (line) => {
    const raw = line.match(matchByPattern)?.[1];
    if (!raw) return null;

    if (typeof manual[raw] !== "undefined") {
      return [
        {
          raw,
          transformed: raw,
          manual: manual[raw],
        },
      ];
    }

    if (!raw.match(matchByLocale)) return null;

    return [
      {
        raw,
        transformed: parser(raw),
      },
    ];
  };
};
