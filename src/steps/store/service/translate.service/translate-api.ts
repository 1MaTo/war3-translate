import { Effect } from "effect";
import translate from "google-translate-api-x";

import { fromIndex } from "../../../utils/from-index";
import { localeMatch } from "../../../utils/get-line-parser/get-file-chunk-utils";
import { TranslateError } from "../../error";
import { TranslateFromLocale, ZH, type TranslateToLocale } from "../../locales";
import { type TranslateState } from "../../store";
import { GoogleFreeProvider, type TranslateProvider } from "../../translate-provider";

type TranslateApi = (
  props: Pick<TranslateState, "from" | "to"> & { list: string[] },
) => Effect.Effect<string[], TranslateError>;

const googleLocale: Partial<Record<TranslateFromLocale | TranslateToLocale, string>> = {
  [ZH.literals[0]]: "zh-Hans",
};

type ItemToTranslate = { index: number; value: string };

const googleFree: TranslateApi = ({ list, from, to }) =>
  Effect.gen(function* () {
    if (list.length === 0) return [];

    let retry: ItemToTranslate[] = list.map((value, index) => ({
      value,
      index,
    }));
    const complete: ItemToTranslate[] = [];

    let retryCount = 0;
    while (retry.length > 0 && retryCount < 4) {
      if (retryCount > 0)
        yield* Effect.logWarning(
          `Detected "from" language values in translation result, retry translation...`,
        );

      retryCount++;

      const result = yield* Effect.tryPromise({
        try: () =>
          translate(list, {
            from: googleLocale[from] || from,
            to: googleLocale[to] || to,
            forceFrom: true,
            forceBatch: false,
          }),
        catch: (error) => new TranslateError("Translate api call failed", error),
      });

      const newRetry: ItemToTranslate[] = [];
      for (let index = 0; index < retry.length; index++) {
        const retryItem = fromIndex(retry, index);
        const translated = fromIndex(result, index).text;

        if (translated.match(new RegExp(`${localeMatch[from]}+`, "gu"))) {
          newRetry.push(retryItem);
          continue;
        }

        complete.push({ value: translated, index: retryItem.index });
      }

      retry = newRetry;
    }

    return complete.toSorted((a, b) => a.index - b.index).map((item) => item.value);
  });

export const translateApi: Record<TranslateProvider, TranslateApi> = {
  [GoogleFreeProvider.literals[0]]: googleFree,
};
