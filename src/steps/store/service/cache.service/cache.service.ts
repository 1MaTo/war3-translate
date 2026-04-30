import { mkdir } from "node:fs/promises";

import Database from "better-sqlite3";
import { Context, Effect, Layer } from "effect";

import { fromIndex } from "../../../utils/from-index";
import { DB_CACHE_PATH, FILES_DIR } from "../../const";
import { CacheError } from "../../error";
import {
  translateTableScript,
  type GetByHashPayload,
  type GetByHashResult,
  type TranslateTableCreateOrUpdatePayload,
} from "./translate.table";

export type CacheLookupItem = {
  hash: string;
  /** Original order of items to restore after translation */
  index: number;
};

export type CacheResultItem = CacheLookupItem & {
  translation: string;
};

export type CacheSaveItem = {
  hash: string;
  translation: string;
};

type CacheState = {
  db: Database.Database;
  cacheTranslation: (list: CacheSaveItem[]) => Effect.Effect<void, CacheError>;
  /** Return Map<raw, translated> of found cached entries */
  getTranslation: (
    list: CacheLookupItem[],
  ) => Effect.Effect<[CacheResultItem[], CacheLookupItem[]], CacheError>;
};

export class CacheService extends Context.Tag("CacheService")<CacheService, CacheState>() {}

const initialize = Effect.gen(function* () {
  yield* Effect.promise(() => mkdir(FILES_DIR, { recursive: true }));
  const db = new Database(DB_CACHE_PATH);

  /** Recommend optimization by lib */
  db.pragma("journal_mode = WAL");

  db.exec(translateTableScript.initialize);

  const createOrUpdateTranslation = db.prepare<TranslateTableCreateOrUpdatePayload>(
    translateTableScript.createOrUpdate,
  );
  const getTranslationByHash = db.prepare<GetByHashPayload, GetByHashResult>(
    translateTableScript.getByHash,
  );

  return {
    db,
    cacheTranslation: (list) =>
      Effect.gen(function* () {
        for (let index = 0; index < list.length; index++) {
          const item = list[index];

          if (!item) return yield* new CacheError("For loop error while saving cache");

          createOrUpdateTranslation.run(item);
        }
      }),
    getTranslation: (list) =>
      Effect.sync(function () {
        const hit: CacheResultItem[] = [];
        const miss: CacheLookupItem[] = [];

        for (let index = 0; index < list.length; index++) {
          const item = fromIndex(list, index);
          const row = getTranslationByHash.get(item.hash);

          if (!row) {
            miss.push(item);
            continue;
          }

          hit.push({ ...item, ...row });
        }

        return [hit, miss];
      }),
  } satisfies CacheState;
});

export const CacheLayer = Layer.scoped(
  CacheService,
  Effect.acquireRelease(initialize, ({ db }) => Effect.sync(() => db.close())),
);
