import { Archive } from "@jamiephan/stormlib";
import { Context, Ref } from "effect";

import type { ProviderOptions } from "../lib/translate/common";
import type { StringsFileProperties } from "../utils/get-line-parser/strings-file-properties";
import type { ExtensionToTranslate } from "./extensions";
import type { TranslateFromLocale, TranslateToLocale } from "./locales";
import type { DeeplOptions } from "./service/translate.service/deepl/deepl-api";
import type { TranslateProvider } from "./translate-provider";

export type TranslateFragment = {
  /** Hash for fragment, used to replace fragment in file, will be replaced by translated value */
  hash: string;
  /** Index of this translation in dictionary */
  dictionaryIndex: number;
};

export type ParsedFile = {
  /** Filename */
  name: string;
  extension: ExtensionToTranslate;
  /** Filename with fill path in map */
  mapPath: string;
  /** Key is file line index, starting from 0*/
  lineMap: Map<number, TranslateFragment[]>;
};

/** Key is file name */
export type FileMap = Map<string, ParsedFile>;

export type TranslateProps = {
  pathToMap: string;
  /** Full path with map name and extension */
  pathToTranslatedMap?: string;
  from: TranslateFromLocale;
  to: TranslateToLocale;
  provider?: TranslateProvider;
  options?: ProviderOptions;
  /** Api specific options for translations, context, glossary, auth key, etc...
   * @deprecated
   */
  translateApiOptions?: DeeplOptions;

  /** List of file names (as they named in map, case sensitive, with extension)
   * When specified only this files will be processed
   * @deprecated use `fileFilter` instead */
  filesToInclude?: string[];
  /** List of file names (as they named in map, case sensitive, with extension)
   * When specified this files will not be translated even if specified in filesToInclude
   * @deprecated use `fileFilter` instead */
  filesToExclude?: string[];
  fileFilter?: FileFilter;

  /** List of string files properties to ignore, useful when limited by translation resources as some properties never can be never seen in game
   * @deprecated
   */
  propertiesToExclude?: StringsFileProperties[];
  /** If true, tmp folder with files will not be deleted */
  debug?: boolean;
};

export type TranslationDictionary = {
  from: string[];
  to: string[];
};

export type TranslateState = TranslateProps & {
  provider: TranslateProvider;
  map: Archive;
  fileMap: FileMap;
  dictionary: TranslationDictionary;
};

export class TranslateStore extends Context.Tag("TranslateStore")<
  TranslateStore,
  Ref.Ref<TranslateState>
>() {}

export const setTranslatedList = (ref: Ref.Ref<TranslateState>, list: string[]) =>
  Ref.update(ref, (state) => ({ ...state, translatedList: list }));

export type ExtractedFileInfo = {
  extension: ExtensionToTranslate;
  /** Filename with full path in system */
  systemPath: string;
  /** Filename with fill path in map */
  mapPath: string;
  /** Only filename */
  name: string;
};

export type ParsedFileInfo = ExtractedFileInfo & {
  /** Map for parsed data, key is line index in file, value is line index in translated list */
  parseMap: Map<number, number>;
};

export type TranslatedFileInfo = ExtractedFileInfo;
