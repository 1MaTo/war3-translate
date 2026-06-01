import { DeepLClient, type TargetLanguageCode } from "deepl-node";
import { Chunk, Effect, Either, Schedule, Schema, Sink, Stream } from "effect";

import { TranslateError } from "../../../error";
import { EN, type TranslateFromLocale, type TranslateToLocale } from "../../../locales";
import type { TranslateApi } from "../types";

const deeplLocale: Partial<Record<TranslateFromLocale | TranslateToLocale, TargetLanguageCode>> = {
  [EN.literals[0]]: "en-US",
};

const DeeplOptions = Schema.Struct({
  apiKey: Schema.String,
  context: Schema.optional(Schema.String),
  glossary: Schema.optional(Schema.String),
});
export type DeeplOptions = Schema.Schema.Type<typeof DeeplOptions>;

export const deepl: TranslateApi = ({ list, from, to, translateApiOptions }) =>
  Effect.gen(function* () {
    const options = Schema.decodeUnknownEither(DeeplOptions)(translateApiOptions);
    if (Either.isLeft(options)) return yield* new TranslateError(`Deepl options not provided`);

    const { apiKey, ...props } = options.right;

    const client = new DeepLClient(apiKey);

    const result = yield* translateByChunks({
      list,
      maxCost: 50,
      getItemConst: () => 1,
      callTranslation: async (list) =>
        (
          await client.translateText(list, from, deeplLocale[to] || "en-US", {
            ...props,
          })
        ).map((item) => item.text),
    });

    return result;
  });

const translateByChunks = ({
  list,
  maxCost,
  callTranslation,
  getItemConst,
}: {
  list: string[];
  maxCost: number;
  callTranslation: (list: string[]) => Promise<string[]>;
  getItemConst: (item: string) => number;
}) =>
  Effect.gen(function* () {
    const stream = Stream.fromIterable(list).pipe(
      Stream.transduce(
        Sink.foldWeighted({
          initial: Chunk.empty<string>(),
          maxCost,
          cost: (_, fragment) => getItemConst(fragment),
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
            try: () => callTranslation(list),
            catch: (error) => new TranslateError(`Failed to translate ${String(error)}`, error),
          });

          return Chunk.fromIterable(result);
        }),
      ),
      Stream.schedule(Schedule.spaced(100)),
      Stream.flattenChunks,
    );

    return Chunk.toArray(yield* Stream.runCollect(stream));
  });
