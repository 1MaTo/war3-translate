import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";

import Database from "better-sqlite3";
import { Effect } from "effect";

import { DB_CACHE_PATH, FILES_DIR } from "../../store/const";
import type { TranslateToLocale } from "../../store/locales";
import {
  translateTableScript,
  type GetByIdPayload,
  type GetByIdResult,
  type TranslateTableCreateOrUpdatePayload,
} from "../../store/service/cache.service/translate.table";
import type { TranslateProvider } from "../../store/translate-provider";
import { fromIndex } from "../../utils/from-index";

export type CacheLookupItem = string;
type CacheResult = string | null;

type GetCachedTranslationsProps = {
  list: CacheLookupItem[];
  provider: TranslateProvider;
  to: TranslateToLocale;
};

const connectCacheDB = Effect.gen(function* () {
  yield* Effect.promise(() => mkdir(FILES_DIR, { recursive: true }));
  const db = new Database(DB_CACHE_PATH);

  /** Recommend optimization by lib */
  db.pragma("journal_mode = WAL");
  db.exec(translateTableScript.initialize);

  return db;
});

const getId = (item: string, provider: TranslateProvider, to: TranslateToLocale) =>
  createHash("md5").update(provider).update(to).update(item).digest("hex");

export const getCachedTranslations = ({ list, provider, to }: GetCachedTranslationsProps) =>
  Effect.gen(function* () {
    const db = yield* connectCacheDB;

    const getTranslationById = db.prepare<GetByIdPayload, GetByIdResult>(
      translateTableScript.getById,
    );

    const result: CacheResult[] = [];
    for (let index = 0; index < list.length; index++) {
      const item = fromIndex(list, index);
      const row = getTranslationById.get(getId(item, provider, to));

      if (!row) {
        result.push(null);
        continue;
      }

      result.push(row.translation);
    }

    db.close();

    return result;
  });

export type TranslationToCache = { raw: string; translated: string };
export const cacheTranslations = ({
  list,
  provider,
  to,
}: { list: TranslationToCache[] } & Pick<GetCachedTranslationsProps, "provider" | "to">) =>
  Effect.gen(function* () {
    const db = yield* connectCacheDB;

    const createOrUpdateTranslation = db.prepare<TranslateTableCreateOrUpdatePayload>(
      translateTableScript.createOrUpdate,
    );

    for (let index = 0; index < list.length; index++) {
      const item = fromIndex(list, index);
      createOrUpdateTranslation.run({
        id: getId(item.raw, provider, to),
        translation: item.translated,
      });
    }

    db.close();
  });
