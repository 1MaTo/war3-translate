import { Effect } from "effect";

import { fromIndex } from "../../../utils/from-index";
import { getListCharCount } from "../../../utils/get-list-char-count";
import type { TranslateState } from "../../store";
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
} & Pick<TranslateState, "translateApiOptions" | "from" | "to" | "provider">;

export class TranslateService extends Effect.Service<TranslateService>()("TranslateService", {
  effect: Effect.gen(function* () {
    const cache = yield* CacheService;

    return {
      translate: ({ list, provider, from, to, translateApiOptions }: TranslateProps) =>
        Effect.gen(function* () {
          const [hit, miss] = yield* cache.getTranslation(list);

          yield* Effect.logDebug(`        Cache fragment hit: ${hit.length} / ${list.length}`);
          yield* Effect.logDebug(
            `        ${getListCharCount(miss, (item) => fromIndex(list, item.index).fragment)} chars to translate`,
          );

          const translateList = miss.map((item) => fromIndex(list, item.index).fragment);
          const translationList = translateList.length
            ? yield* translateApi[provider]({
                from,
                to,
                list: translateList,
                translateApiOptions,
              })
            : [];

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
