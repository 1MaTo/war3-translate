import path from "node:path";

/** Path to folder where all files used for scripts will be stored */
export const FILES_DIR = path.join("./", "tmp");
export const RAW_DIR = path.join(FILES_DIR, "raw");
export const PARSED_DIR = path.join(FILES_DIR, "parsed");
export const TRANSLATED_DIR = path.join(FILES_DIR, "translated");
export const DB_CACHE_PATH = path.join(FILES_DIR, "cache.db");
