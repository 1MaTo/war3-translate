export const temp = 2;

/* import type Database from "better-sqlite3";
import type { Effect } from "effect";

import type { TranslateFromLocale, TranslateToLocale } from "../../locales";

export type TranslateCacheServiceApi = {
  readonly db: Database.Database;
  saveTranslated: (
    raw: string[],
    translated: string[],
    from: TranslateFromLocale,
    to: TranslateToLocale,
  ) => Effect.Effect<void>;
};

export class TranslateCacheService extends Context.Tag("TranslateCacheService")<
  TranslateCacheService,
  TranslateCacheServiceApi
>() {}
const TranslateCacheLayer = Layer.scoped(
  TranslateCacheService,
  Effect.acquireRelease(
    Effect.gen(function* () {
      yield* Effect.logDebug("Initializing cache...");
      const db = new Database("translate-cache.db");

      db.exec(`
            CREATE TABLE IF NOT EXISTS translate_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                raw TEXT NOT NULL,
                translated TEXT NOT NULL,
                fromLocale: TEXT NOT NULL,
                toLocale: TEXT NOT NULL
                provider TEXT NOT NULL
            )
      `);

      return {
        db,
        saveTranslated: (translated) =>
          Effect.gen(function* () {
            db;
          }),
      };
    }),
    ({ db }) =>
      Effect.gen(function* () {
        yield* Effect.logDebug("Saving cache...");
        db.close();
      }),
  ),
);
 */
