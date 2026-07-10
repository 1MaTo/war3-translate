import type { ProviderOptions } from "../translate/common";
import type { TranslateFromLocale, TranslateToLocale } from "./locales";
import type { TranslateProvider } from "./translate-provider";

type FileFilter = {
  include?: RegExp;
  exclude?: RegExp;
};

export type TranslateLibProps = {
  pathToMap: string;
  /** Full path with map name and extension */
  pathToTranslatedMap?: string;
  pathToManualTranslations?: string;
  from: TranslateFromLocale;
  to: TranslateToLocale;
  provider: TranslateProvider;
  options?: ProviderOptions;
  fileFilter?: FileFilter;
  ignoreCache?: boolean;
  /** If true, tmp folder with files will not be deleted */
  debug?: boolean;
};
