import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";

import Database from "better-sqlite3";
import { Context, Effect, Layer } from "effect";

import { DB_CACHE_PATH, FILES_DIR } from "../../const";
import { CacheError } from "../../error";
import type { TranslateState } from "../../store";
import {
  translateTableScript,
  type GetByHashPayload,
  type GetByHashResult,
  type TranslateTableCreateOrUpdatePayload,
} from "./translate.table";

type CacheTranslationProps = Required<
  Pick<TranslateState, "rawList" | "translatedList" | "from" | "to" | "provider">
>;

type CacheState = {
  db: Database.Database;
  cacheTranslation: (props: CacheTranslationProps) => Effect.Effect<void, CacheError>;
  /** Return Map<raw, translated> of found cached entries */
  getTranslation: (
    props: Omit<CacheTranslationProps, "translatedList">,
  ) => Effect.Effect<Map<string, string>, CacheError>;
};

export class CacheService extends Context.Tag("CacheService")<CacheService, CacheState>() {}

const hashTranslationItem = ({
  from,
  provider,
  raw,
  to,
}: Pick<CacheTranslationProps, "from" | "to" | "provider"> & { raw: string }) =>
  createHash("md5").update([raw, from, to, provider].join(",")).digest("hex");

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
    cacheTranslation: ({ rawList, translatedList, from, to, provider }) =>
      Effect.gen(function* () {
        for (let index = 0; index < rawList.length; index++) {
          const raw = rawList[index];
          const translated = translatedList[index];

          if (!raw || !translated)
            return yield* new CacheError("For loop error while saving cache");

          const hash = hashTranslationItem({ raw, from, provider, to });
          createOrUpdateTranslation.run({
            hash,
            translated,
          });
        }
      }),
    getTranslation: ({ rawList, from, to, provider }) =>
      Effect.gen(function* () {
        const map = new Map<string, string>();

        for (let index = 0; index < rawList.length; index++) {
          const raw = rawList[index];
          if (!raw) return yield* new CacheError("For loop error while getting cache");

          const hash = hashTranslationItem({ from, to, provider, raw });

          const row = getTranslationByHash.get(hash);
          if (!row) continue;

          map.set(raw, row.translated);
        }

        return map;
      }),
  } satisfies CacheState;
});

export const CacheLayer = Layer.scoped(
  CacheService,
  Effect.acquireRelease(initialize, ({ db }) => Effect.sync(() => db.close())),
);
