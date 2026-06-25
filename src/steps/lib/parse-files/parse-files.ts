import { mkdir } from "node:fs/promises";

import { Effect, HashMap, Ref } from "effect";

import { PARSED_DIR } from "../../store/const";
import type { TranslateFromLocale } from "../../store/locales";
import type { ExtractedFileInfo } from "../import-files";
import type { ParsedChunk } from "./get-substring-to-translate/common";
import { parseFile } from "./get-substring-to-translate/parser";

// const parseFile = (fileInfo: ExtractedFileInfo) =>
//   Effect.gen(function* () {
//     /*   const storeRef = yield* TranslateStore;
//     const { fileMap, from, to, provider } = yield* (yield* TranslateStore).get; */

//     const pathFrom = path.join(RAW_DIR, fileInfo.name);
//     const pathTo = path.join(PARSED_DIR, fileInfo.name);

//     /*  const { parse, replaceByHash } = getFileChunkUtils({
//       extension: fileInfo.extension,
//       from: from,
//     }); */

//     /*  const preHash = createHash("md5").update(from).update(to).update(provider).digest(); */

//     /* if (fragmentCount > 0) {
//       yield* Effect.logDebug(`    ${fileInfo.mapPath}`);
//       yield* Effect.logDebug(`        ${fragmentCount} fragments`);
//     } else {
//       yield* removeImportedFile(storeRef, name);
//       yield* Effect.promise(() => rm(oldPath, { force: true }));
//       yield* Effect.promise(() => rm(newPath, { force: true }));
//     } */
//   });

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
