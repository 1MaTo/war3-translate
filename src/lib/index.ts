export type { TranslateLibProps } from "./types/props";
export type { ParsedSubstring } from "./parse-files/get-substring-to-translate/common";
export type { TranslatedChunk } from "./apply-files/apply-files";
export { TranslateError } from "./utils/error";
export { TranslateFromLocale, TranslateToLocale, EN, KO, RU, ZH } from "./types/locales";

export { fromIndex } from "./utils/from-index";
export { cleanFiles } from "./clean-files";
export { DeeplProvider, GoogleFreeProvider, TranslateProvider } from "./types/translate-provider";

export { importFiles } from "./import-files";
export { parseFiles } from "./parse-files/parse-files";
export { translateList } from "./translate/translate-list";
export { providerParser } from "./parse-files/get-substring-to-translate/provider-parser/provider-parser";
export { applyFiles } from "./apply-files/apply-files";
export { exportFiles } from "./export-files";
