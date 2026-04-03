import { Effect } from "effect";
import translate from "google-translate-api-x";

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
const googleFree: TranslateApi = ({ list, from, to }) =>
  Effect.gen(function* () {
    if (list.length === 0) return [];

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

    return result.map((item) => item.text);
  });

export const translateApi: Record<TranslateProvider, TranslateApi> = {
  [GoogleFreeProvider.literals[0]]: googleFree,
};
