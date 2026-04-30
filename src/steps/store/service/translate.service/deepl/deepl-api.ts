import { DeepLClient, type TargetLanguageCode } from "deepl-node";
import { Effect, Either, Schema } from "effect";

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
    const result = yield* Effect.tryPromise({
      try: () =>
        client.translateText(list, from, deeplLocale[to] || "en-US", {
          ...props,
        }),
      catch: (error) => new TranslateError(`Failed to translate ${String(error)}`, error),
    });

    return result.map((item) => item.text);
  });
