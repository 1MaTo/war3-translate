import { Effect } from "effect";

import { GoogleFreeProvider } from "../types/translate-provider";
import { TranslateError } from "../utils/error";
import { fromIndex } from "../utils/from-index";
import type { TranslateInQueueProps } from "./common";
import {
  cacheTranslations,
  getCachedTranslations,
  type TranslationToCache,
} from "./translate-cache";
import { translateInQueue } from "./translate-in-queue";

type TranslateListProps = { ignoreCache?: boolean } & Pick<
  TranslateInQueueProps,
  "from" | "to" | "provider" | "list" | "options"
>;
export const translateList = ({
  list,
  from,
  to,
  provider = GoogleFreeProvider.literals[0],
  options,
  ignoreCache,
}: TranslateListProps) =>
  Effect.gen(function* () {
    const cacheResult = ignoreCache
      ? Array(list.length).fill(null)
      : yield* getCachedTranslations({ list, provider, to });
    const missItems: string[] = [];

    for (let index = 0; index < list.length; index++) {
      const hit = fromIndex(cacheResult, index);
      if (hit) continue;
      missItems.push(fromIndex(list, index));
    }

    yield* Effect.log(
      `[Translate list] Cache hit: ${list.length - missItems.length} / ${list.length}`,
    );

    if (missItems.length === 0) return cacheResult as string[];

    const translateResult = yield* translateInQueue({
      list: missItems,
      from,
      to,
      provider,
      options,
    });

    const itemsToCache: TranslationToCache[] = [];
    for (let index = 0; index < missItems.length; index++) {
      itemsToCache.push({
        raw: fromIndex(missItems, index),
        translated: fromIndex(translateResult, index),
      });
    }
    yield* cacheTranslations({ list: itemsToCache, provider, to });

    const mergedResult: string[] = [];

    for (let index = 0; index < list.length; index++) {
      const hit = fromIndex(cacheResult, index);
      if (hit) {
        mergedResult.push(hit);
        continue;
      }
      const translated = translateResult.shift();
      if (!translated)
        return yield* new TranslateError("Failed to get translated result when merge with cache");

      mergedResult.push(translated);
    }

    return mergedResult;
  });
