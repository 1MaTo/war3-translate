const TABLE = "translate_cache";
const COLUMN = {
  HASH: "hash",
  TRANSLATION: "translation",
} as const;

const initializeScript = `CREATE TABLE IF NOT EXISTS ${TABLE} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ${COLUMN.HASH} TEXT NOT NULL UNIQUE,
    ${COLUMN.TRANSLATION} TEXT NOT NULL
  )`;

export type TranslateTableCreateOrUpdatePayload = {
  [COLUMN.HASH]: string;
  [COLUMN.TRANSLATION]: string;
};

const createOrUpdateWhereHashScript = `
    INSERT INTO ${TABLE} (
      ${COLUMN.HASH}, 
      ${COLUMN.TRANSLATION} 
    ) VALUES ( 
      @${COLUMN.HASH}, 
      @${COLUMN.TRANSLATION}
    ) ON CONFLICT(${COLUMN.HASH}) 
    DO UPDATE SET 
      ${COLUMN.TRANSLATION} = excluded.${COLUMN.TRANSLATION}`;

const getByHash = `SELECT ${COLUMN.TRANSLATION} from ${TABLE} WHERE ${COLUMN.HASH} = ?`;

export type GetByHashPayload = string;
export type GetByHashResult = { [COLUMN.TRANSLATION]: string } | undefined;

export const translateTableScript = {
  initialize: initializeScript,
  createOrUpdate: createOrUpdateWhereHashScript,
  getByHash,
};
