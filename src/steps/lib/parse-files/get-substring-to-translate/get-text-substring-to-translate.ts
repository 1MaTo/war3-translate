import {
  DeeplProvider,
  GoogleFreeProvider,
  TranslateProvider,
} from "../../../store/translate-provider";
import { localeMatch, type MakeTranslateExtractor, type ProviderStringParser } from "./common";
import { deeplParser } from "./provider-parser/deepl.parser";
import { googleFreeParser } from "./provider-parser/google-free.parser";

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

export const providerParser: Record<TranslateProvider, ProviderStringParser> = {
  [GoogleFreeProvider.literals[0]]: googleFreeParser,
  [DeeplProvider.literals[0]]: deeplParser,
};

export const makeTextTranslateExtractor: MakeTranslateExtractor = (locale, provider) => {
  const matcher = new RegExp(
    `^(?:${validProperty.join("|")})=(.*${localeMatch[locale]}+.*)$`,
    "iu",
  );
  const parser = providerParser[provider].encode;
  return (line) => {
    const raw = line.match(matcher)?.[1];
    if (!raw) return null;

    return {
      raw,
      transformed: parser(raw),
    };
  };
};
