import { mkdir } from "node:fs/promises";

import { Effect, HashMap, Ref } from "effect";

import { PARSED_DIR } from "../const";
import type { ExtractedFileInfo } from "../import-files";
import type { TranslateFromLocale } from "../types/locales";
import type { TranslateProvider } from "../types/translate-provider";
import type { ParsedSubstring } from "./get-substring-to-translate/common";
import { parseFile } from "./get-substring-to-translate/parser";

export type ParseFilesProps = {
  extractedFiles: ExtractedFileInfo[];
  locale: TranslateFromLocale;
  provider: TranslateProvider;
};

export const parseFiles = ({ extractedFiles, locale, provider }: ParseFilesProps) =>
  Effect.gen(function* () {
    yield* Effect.promise(() => mkdir(PARSED_DIR, { recursive: true }));

    const ref = yield* Ref.make(HashMap.empty<string, ParsedSubstring>());

    const onNewFragment = (data: ParsedSubstring) =>
      Ref.update(ref, (map) => HashMap.set(map, data.id, data));

    const parseFileTaskList = extractedFiles.map((fileInfo) =>
      parseFile({ ...fileInfo, locale, onNewFragment: onNewFragment, provider }),
    );

    yield* Effect.all(parseFileTaskList, { concurrency: "unbounded" });

    return yield* Ref.get(ref);
  });
