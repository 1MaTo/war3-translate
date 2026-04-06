import { Chunk, Duration, Effect, Schedule, Sink, Stream } from "effect";
import translate from "google-translate-api-x";

import { fromIndex } from "../../../../utils/from-index";
import { localeMatch } from "../../../../utils/get-line-parser/get-file-chunk-utils";
import { getListCharCount } from "../../../../utils/get-list-char-count";
import { TranslateError } from "../../../error";
import { ZH, type TranslateFromLocale, type TranslateToLocale } from "../../../locales";
import type { TranslateApi } from "../types";

const googleLocale: Partial<Record<TranslateFromLocale | TranslateToLocale, string>> = {
  [ZH.literals[0]]: "zh-Hans",
};

type ItemToTranslate = { index: number; value: string };

const CHARS_PER_REQUEST = 100000;
const DELAY = Duration.seconds(5);
const RETRY_COUNT = 10;
export const googleFree: TranslateApi = ({ list, from, to }) =>
  Effect.gen(function* () {
    if (list.length === 0) return [];

    let retry: ItemToTranslate[] = list.map((value, index) => ({
      value,
      index,
    }));
    const complete: ItemToTranslate[] = [];

    yield* Effect.logDebug(
      `            Google free translate, translating with rate limit with ~${CHARS_PER_REQUEST} chars per request`,
    );

    let retryCount = 0;
    while (retry.length > 0 && retryCount < RETRY_COUNT) {
      if (retryCount > 0) {
        yield* Effect.logWarning(
          `\n            [${retryCount}/${RETRY_COUNT}] Detected "from" language values in translation result, retry translation...`,
        );
      }

      retryCount++;

      const iterationCount = Math.ceil(
        getListCharCount(retry, (item) => item.value) / CHARS_PER_REQUEST,
      );
      yield* Effect.logDebug(`            ~${iterationCount} iterations`);
      yield* Effect.logDebug(
        `            ~${Math.ceil((iterationCount * Duration.toSeconds(DELAY)) / 60)} minutes`,
      );

      const result = yield* callTranslation({
        list: retry.map((item) => item.value),
        from: googleLocale[from] || from,
        to: googleLocale[to] || to,
      });

      const newRetry: ItemToTranslate[] = [];
      for (let index = 0; index < retry.length; index++) {
        const retryItem = fromIndex(retry, index);
        const translated = fromIndex(result, index);

        if (translated.match(new RegExp(`${localeMatch[from]}+`, "gu"))) {
          newRetry.push(retryItem);
          continue;
        }

        complete.push({ value: translated, index: retryItem.index });
      }

      retry = newRetry;
    }

    if (retry.length > 0) {
      yield* Effect.logDebug(
        `            Failed to translate ${retry.length} fragments, return without translation`,
      );
      complete.push(...retry);
    }

    return complete.toSorted((a, b) => a.index - b.index).map((item) => item.value);
  });

const callTranslation = ({ list, from, to }: { from: string; to: string; list: string[] }) =>
  Effect.gen(function* () {
    const stream = Stream.fromIterable(list).pipe(
      Stream.transduce(
        Sink.foldWeighted({
          initial: Chunk.empty<string>(),
          maxCost: CHARS_PER_REQUEST,
          cost: (_, fragment) => fragment.length,
          body: (group, fragment) => Chunk.append(group, fragment),
        }),
      ),
      Stream.zipWithIndex,
      Stream.mapEffect(([value, index]) =>
        Effect.gen(function* () {
          const list: string[] = [];
          let totalCharCount = 0;
          Chunk.forEach(value, (fragment) => {
            list.push(fragment);
            totalCharCount += fragment.length;
          });
          yield* Effect.logDebug(
            `                [${index + 1}] Translating chunk of ${totalCharCount} chars...`,
          );
          const result = yield* Effect.tryPromise({
            try: () => translate(list, { forceBatch: false, fallbackBatch: false, from, to }),
            catch: () => new TranslateError("Failed to translate chunk..."),
          });

          return Chunk.fromIterable(result.map((item) => item.text));
        }),
      ),
      Stream.schedule(Schedule.spaced(DELAY)),
      Stream.flattenChunks,
    );

    return Chunk.toArray(yield* Stream.runCollect(stream));
  });
