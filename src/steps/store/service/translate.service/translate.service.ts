import { Effect } from "effect";

import { fromIndex } from "../../../utils/from-index";
import type { TranslateFromLocale, TranslateToLocale } from "../../locales";
import type { TranslateProvider } from "../../translate-provider";
import { CacheLayer, CacheService, type CacheResultItem } from "../cache.service/cache.service";
import { translateApi } from "./translate-api";

export type TranslateListItem = {
  hash: string;
  fragment: string;
  /** Original order of items to restore after translation */
  index: number;
};

type TranslateProps = {
  list: TranslateListItem[];
  provider: TranslateProvider;
  from: TranslateFromLocale;
  to: TranslateToLocale;
};

export class TranslateService extends Effect.Service<TranslateService>()("TranslateService", {
  effect: Effect.gen(function* () {
    const cache = yield* CacheService;

    return {
      translate: ({ list, provider, from, to }: TranslateProps) =>
        Effect.gen(function* () {
          const [hit, miss] = yield* cache.getTranslation(list);

          yield* Effect.logDebug(`        Cache hit: ${hit.length}`);
          yield* Effect.logDebug(
            `        Char count to translate: ${miss.reduce((total, item) => total + fromIndex(list, item.index).fragment.length, 0)}`,
          );

          const translationList = yield* translateApi[provider]({
            from,
            to,
            list: miss.map((item) => fromIndex(list, item.index).fragment),
          });

          const missResult: CacheResultItem[] = [];

          for (let index = 0; index < miss.length; index++) {
            const request = fromIndex(miss, index);
            const result = fromIndex(translationList, index);

            missResult.push({ ...request, translation: result });
          }

          yield* cache.cacheTranslation(missResult);

          return [...hit, ...missResult]
            .toSorted((a, b) => a.index - b.index)
            .map((item) => item.translation);
        }),
    } as const;
  }),
  dependencies: [CacheLayer],
}) {}
