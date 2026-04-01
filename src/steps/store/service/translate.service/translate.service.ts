import { Effect } from "effect";

import { TranslateError } from "../../error";
import { type TranslateState } from "../../store";
import { CacheLayer, CacheService } from "../cache.service/cache.service";
import { translateApi } from "./translate-api";

type TranslateProps = Pick<TranslateState, "from" | "to" | "rawList" | "provider">;

export class TranslateService extends Effect.Service<TranslateService>()("TranslateService", {
  effect: Effect.gen(function* () {
    const cache = yield* CacheService;

    return {
      translate: ({ from, to, rawList, provider }: TranslateProps) =>
        Effect.gen(function* () {
          const cachedMap = yield* cache.getTranslation({ from, to, rawList, provider });

          const listToTranslate: string[] = [];
          for (let index = 0; index < rawList.length; index++) {
            const raw = rawList[index];

            if (!raw || cachedMap.has(raw)) continue;
            listToTranslate.push(raw);
          }

          const translatedMap = yield* translateApi[provider]({
            from,
            to,
            rawList: listToTranslate,
          });

          const result: string[] = [];
          for (let index = 0; index < rawList.length; index++) {
            const raw = rawList[index];
            if (!raw) return yield* new TranslateError("Loop index mismatch");

            const translated = cachedMap.get(raw) || translatedMap.get(raw);
            if (!translated) return yield* new TranslateError("Translation not found");

            result.push(translated);
          }

          return result;
        }),
    } as const;
  }),
  dependencies: [CacheLayer],
}) {}
