import { Archive } from "@jamiephan/stormlib";
import { Context, Effect, Option, Ref } from "effect";

import type { ExtensionToTranslate } from "./extensions";
import type { TranslateFromLocale } from "./locales";

export type TranslateProps = {
  pathToMap: string;
  fromLanguage: TranslateFromLocale;
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
>() {
  /* add: PushStringToStoreAction;

  constructor(state: Ref.Ref<FileTranslateInfo>) {
    super
    this.add = (record: string) =>
      Effect.gen(function* () {
        const result = yield* Ref.updateAndGet(state, (draft) =>
          produce(draft, (state) => {
            state.rawList.push(record);
          }),
        );

        return result.rawList.length - 1;
      });
  } */
}

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
