import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";

import Database from "better-sqlite3";
import { Context, Effect, Layer } from "effect";

import { DB_CACHE_PATH, FILES_DIR } from "../../const";
import { CacheError } from "../../error";
import type { TranslateState } from "../../store";
import { translateTableScript, type TranslateTableCreateOrUpdatePayload } from "./translate.table";

type CacheTranslationProps = Required<
  Pick<TranslateState, "rawList" | "translatedList" | "from" | "to" | "provider">
>;

type CacheState = {
  db: Database.Database;
  cacheTranslation: (props: CacheTranslationProps) => Effect.Effect<void, CacheError>;
};

export class CacheService extends Context.Tag("CacheService")<CacheService, CacheState>() {}

const initialize = Effect.gen(function* () {
  yield* Effect.logDebug("Initializing cache...");
  yield* Effect.promise(() => mkdir(FILES_DIR, { recursive: true }));
  const db = new Database(DB_CACHE_PATH);

  /** Recommend optimization by lib by lib */
  db.pragma("journal_mode = WAL");

  db.exec(translateTableScript.initialize);

  const createOrUpdateTranslation = db.prepare<TranslateTableCreateOrUpdatePayload>(
    translateTableScript.createOrUpdate,
  );

  return {
    db,
    cacheTranslation: ({ rawList, translatedList, from, to, provider }) =>
      Effect.gen(function* () {
        for (let index = 0; index < rawList.length; index++) {
          const raw = rawList[index];
          const translated = translatedList[index];

          if (!raw || !translated)
            return yield* new CacheError("For loop error while saving cache");

          const hash = createHash("md5").update([raw, from, to, provider].join(",")).digest("hex");
          const result = createOrUpdateTranslation.run({
            hash,
            translated,
          });

          yield* Effect.logDebug(`Cache changes: ${result.changes}`);
        }
        yield* Effect.log(db.prepare("SELECT * from translate_cache").all());
      }),
  } satisfies CacheState;
});

export const CacheLayer = Layer.scoped(
  CacheService,
  Effect.acquireRelease(initialize, ({ db }) =>
    Effect.gen(function* () {
      yield* Effect.logDebug("Saving cache...");
      db.close();
    }),
  ),
);
