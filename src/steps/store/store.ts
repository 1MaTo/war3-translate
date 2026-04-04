import { Archive } from "@jamiephan/stormlib";
import { Context, Effect, Option, Ref } from "effect";

import type { ExtensionToTranslate } from "./extensions";
import type { TranslateFromLocale, TranslateToLocale } from "./locales";
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
  provider: TranslateProvider;
  /** List of file names (as they named in map, case sensitive, with extension)
   * When specified only this files will be processed */
  filesToInclude?: string[];
  /** List of file names (as they named in map, case sensitive, with extension)
   * When specified this files will not be translated even if specified in filesToInclude */
  filesToExclude?: string[];
};

export type TranslateState = TranslateProps & {
  /** @deprecated */
  rawList: string[];
  /** @deprecated */
  translatedList: string[];

  map: Archive;
  fileMap: FileMap;
  dictionary: {
    from: string[];
    to: string[];
  };
};

export class TranslateStore extends Context.Tag("TranslateStore")<
  TranslateStore,
  Ref.Ref<TranslateState>
>() {}

/** Add line to translation list (if not already exists) and return it index */
export const addLineToTranslate = (ref: Ref.Ref<TranslateState>, line: string) =>
  Effect.gen(function* () {
    const result = yield* Ref.updateSomeAndGet(ref, (draft) => {
      const currentIndex = draft.rawList.indexOf(line);
      if (currentIndex !== -1) return Option.none();
      return Option.some({
        ...draft,
        rawList: [...draft.rawList, line],
      });
    });

    return result.rawList.indexOf(line);
  });

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
