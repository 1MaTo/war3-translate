import { Archive } from "@jamiephan/stormlib";
import { Context, Effect, Option, Ref, Schema } from "effect";

import type { ExtensionToTranslate } from "./extensions";
import type { TranslateFromLocale, TranslateToLocale } from "./locales";

export const GoogleFreeProvider = Schema.Literal("google-free");
export type GoogleFreeProvider = typeof GoogleFreeProvider.Type;
export type TranslateProvider = GoogleFreeProvider;

export type TranslateProps = {
  pathToMap: string;
  from: TranslateFromLocale;
  to: TranslateToLocale;
  provider: TranslateProvider;
  /** List of file names (as they named in map, case sensitive, with extension)
   * When specified only this files will be processed */
  filesToInclude?: string[];
};

export type TranslateState = TranslateProps & {
  map: Archive;
  /** Raw strings extracted from files to be translated */
  rawList: string[];
  /** Translated strings */
  translatedList: string[];
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
