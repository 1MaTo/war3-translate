import type { TranslateFromLocale, TranslateToLocale } from "../store/locales";
import type { TranslateProvider } from "../store/translate-provider";
import type { ProviderOptions } from "./translate/common";

export type FileFilter = {
  include?: RegExp;
  exclude?: RegExp;
};

export type TranslateLibProps = {
  pathToMap: string;
  /** Full path with map name and extension */
  pathToTranslatedMap?: string;
  from: TranslateFromLocale;
  to: TranslateToLocale;
  provider: TranslateProvider;
  options?: ProviderOptions;
  fileFilter?: FileFilter;
  ignoreCache?: boolean;
  /** If true, tmp folder with files will not be deleted */
  debug?: boolean;
};
