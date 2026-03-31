const TABLE = "translate_cache";
const COLUMN = {
  HASH: "hash",
  TRANSLATED: "translated",
} as const;

const initializeScript = `CREATE TABLE IF NOT EXISTS ${TABLE} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ${COLUMN.HASH} TEXT NOT NULL UNIQUE,
    ${COLUMN.TRANSLATED} TEXT NOT NULL
  )`;

const createOrUpdateWhereHashScript = `
    INSERT INTO ${TABLE} (
      ${COLUMN.HASH}, 
      ${COLUMN.TRANSLATED} 
    ) VALUES ( 
      @${COLUMN.HASH}, 
      @${COLUMN.TRANSLATED}
    ) ON CONFLICT(${COLUMN.HASH}) 
    DO UPDATE SET 
      ${COLUMN.TRANSLATED} = excluded.${COLUMN.TRANSLATED}`;

export type TranslateTableCreateOrUpdatePayload = {
  [COLUMN.HASH]: string;
  [COLUMN.TRANSLATED]: string;
};

export const translateTableScript = {
  initialize: initializeScript,
  createOrUpdate: createOrUpdateWhereHashScript,
};
