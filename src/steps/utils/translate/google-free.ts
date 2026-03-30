export const temp = 2;

/* import { Effect } from "effect";
import { translate } from "google-translate-api-x";

import { TranslateError } from "../../store/error";
import { TranslateService } from "./service";

const GoogleFreeTranslateService = TranslateService.of({
  translate: ({ list, from, to }) =>
    Effect.gen(function* () {
      const result = yield* Effect.tryPromise({
        try: () => translate(list, { from, to, forceFrom: true, forceBatch: false }),
        catch: (error) => new TranslateError("Failed to translate using google free api", error),
      });


      return [];
    }),
}); */

/* const languageCodeMap: Partial<Record<TranslateLanguage, string>> = {
  [TranslateLanguage.enum.zh]: "zh-Hans",
};

export const googleTranslateApi: TranslateApi = {
  translateHTMLStringList: async ({ list, source, target }) => {
    const result = await translate(list, {
      from: languageCodeMap[source] || source,
      to: languageCodeMap[target] || target,
      forceFrom: true,
      forceBatch: false,
    });

    const resultList: string[] = [];
    for (let index = 0; index < result.length; index++) {
      resultList.push(result[index].text || "");
    }

    return resultList;
  },
  getTranslationCostInRUB: () => `free`,
}; */
