import { Chunk, Effect, Schedule, Sink, Stream } from "effect";

import { TranslateError } from "../../store/error";
import {
  DeeplProvider,
  GoogleFreeProvider,
  type TranslateProvider,
} from "../../store/translate-provider";
import type { MakeTranslateApiFn, TranslateInQueueProps } from "./common";
import { translateDeepl } from "./provider/deepl.provider";
import { translateGoogleFree } from "./provider/google.provider";

const translateFnMap: Record<TranslateProvider, MakeTranslateApiFn> = {
  [GoogleFreeProvider.literals[0]]: translateGoogleFree,
  [DeeplProvider.literals[0]]: translateDeepl,
} as const;

export const translateInQueue = ({
  list,
  from,
  to,
  provider = GoogleFreeProvider.literals[0],
  maxCharsPerRequest = 50000,
  delay = 300,
  options,
}: TranslateInQueueProps) =>
  Effect.gen(function* () {
    const translateFn = translateFnMap[provider](options);
    if (!translateFn)
      return yield* new TranslateError(`No translate function found for "${provider}" provider`);

    const stream = Stream.fromIterable(list).pipe(
      Stream.transduce(
        Sink.foldWeighted({
          initial: Chunk.empty<string>(),
          maxCost: maxCharsPerRequest,
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
            `[Translate queue ${index + 1}] chunk of ${totalCharCount} chars...`,
          );

          const result = yield* Effect.tryPromise({
            try: () => translateFn({ list, from, to }),
            catch: (error) =>
              new TranslateError(`Failed to translate chunk... ${String(error)}`, error),
          });

          return Chunk.fromIterable(result);
        }),
      ),
      Stream.schedule(Schedule.spaced(delay)),
      Stream.flattenChunks,
    );

    return Chunk.toArray(yield* Stream.runCollect(stream));
  });
