const TABLE = "translate_cache";
const COLUMN = {
  ID: "id",
  TRANSLATION: "translation",
} as const;

const initializeScript = `CREATE TABLE IF NOT EXISTS ${TABLE} (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    ${COLUMN.ID} TEXT NOT NULL UNIQUE,
    ${COLUMN.TRANSLATION} TEXT NOT NULL
  )`;

export type TranslateTableCreateOrUpdatePayload = {
  [COLUMN.ID]: string;
  [COLUMN.TRANSLATION]: string;
};

const createOrUpdateWhereHashScript = `
    INSERT INTO ${TABLE} (
      ${COLUMN.ID}, 
      ${COLUMN.TRANSLATION} 
    ) VALUES ( 
      @${COLUMN.ID}, 
      @${COLUMN.TRANSLATION}
    ) ON CONFLICT(${COLUMN.ID}) 
    DO UPDATE SET 
      ${COLUMN.TRANSLATION} = excluded.${COLUMN.TRANSLATION}`;

const getById = `SELECT ${COLUMN.TRANSLATION} from ${TABLE} WHERE ${COLUMN.ID} = ?`;

export type GetByIdPayload = string;
export type GetByIdResult = { [COLUMN.TRANSLATION]: string } | undefined;

export const translateTableScript = {
  initialize: initializeScript,
  createOrUpdate: createOrUpdateWhereHashScript,
  getById: getById,
};
