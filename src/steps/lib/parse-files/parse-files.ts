import { mkdir } from "node:fs/promises";

import { Effect, HashMap, Ref } from "effect";

import { PARSED_DIR } from "../../store/const";
import type { TranslateFromLocale } from "../../store/locales";
import type { ExtractedFileInfo } from "../import-files";
import type { ParsedChunk } from "./get-substring-to-translate/common";
import { parseFile } from "./get-substring-to-translate/parser";

export type ParseFilesProps = {
  extractedFiles: ExtractedFileInfo[];
  locale: TranslateFromLocale;
};

export const parseFiles = ({ extractedFiles, locale }: ParseFilesProps) =>
  Effect.gen(function* () {
    yield* Effect.promise(() => mkdir(PARSED_DIR, { recursive: true }));

    const ref = yield* Ref.make(HashMap.empty<string, ParsedChunk>());

    const onNewFragment = (data: ParsedChunk) =>
      Ref.update(ref, (map) => HashMap.set(map, data.id, data));

    const parseFileTaskList = extractedFiles.map((fileInfo) =>
      parseFile({ ...fileInfo, locale, onNewFragment: onNewFragment }),
    );

    yield* Effect.all(parseFileTaskList, { concurrency: "unbounded" });

    return yield* Ref.get(ref);
  });
