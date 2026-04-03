import { Effect } from "effect";
import translate from "google-translate-api-x";

import { TranslateError } from "../../error";
import { TranslateFromLocale, ZH, type TranslateToLocale } from "../../locales";
import { type TranslateState } from "../../store";
import { GoogleFreeProvider, type TranslateProvider } from "../../translate-provider";

type TranslateApi = (
  props: Pick<TranslateState, "from" | "to" | "rawList">,
) => Effect.Effect<Map<string, string>, TranslateError>;

const googleLocale: Partial<Record<TranslateFromLocale | TranslateToLocale, string>> = {
  [ZH.literals[0]]: "zh-Hans",
};
const googleFree: TranslateApi = ({ rawList, from, to }) =>
  Effect.gen(function* () {
    if (rawList.length === 0) return new Map();

    const result = yield* Effect.tryPromise({
      try: () =>
        translate(rawList, {
          from: googleLocale[from] || from,
          to: googleLocale[to] || to,
          forceFrom: true,
          forceBatch: false,
        }),
      catch: (error) => new TranslateError("Translate api call failed", error),
    });

    const translatedMap = new Map<string, string>();
    for (let index = 0; index < result.length; index++) {
      const item = result[index];
      const raw = rawList[index];
      if (!item || !raw) return yield* new TranslateError("Mismatch in result array from api call");
      translatedMap.set(raw, item.text);
    }

    return translatedMap;
  });

export const translateApi: Record<TranslateProvider, TranslateApi> = {
  [GoogleFreeProvider.literals[0]]: googleFree,
};
