import { DeepLClient, type TargetLanguageCode } from "deepl-node";

import { TranslateError } from "../../../store/error";
import {
  EN,
  KO,
  RU,
  ZH,
  type TranslateFromLocale,
  type TranslateToLocale,
} from "../../../store/locales";
import { fromIndex } from "../../../utils/from-index";
import type { MakeTranslateApiFn } from "../common";

const deeplLocale: Record<TranslateFromLocale | TranslateToLocale, TargetLanguageCode> = {
  [EN.literals[0]]: "en-US",
  [RU.literals[0]]: "ru",
  [KO.literals[0]]: "ko",
  [ZH.literals[0]]: "zh",
};

export const translateDeepl: MakeTranslateApiFn = (options) => {
  if (!options?.deepl) throw new TranslateError("Deepl options not found");
  const { apiKey, ...props } = options.deepl;

  const client = new DeepLClient(apiKey);
  return async ({ from, list, to }) => {
    const deeplResult = await client.translateText(list, from, deeplLocale[to], {
      ...props,
      tagHandling: "html",
      preserveFormatting: true,
      tagHandlingVersion: "v2",
    });
    const result: string[] = [];
    for (let index = 0; index < deeplResult.length; index++) {
      result.push(fromIndex(deeplResult, index).text);
    }
    return result;
  };
};
