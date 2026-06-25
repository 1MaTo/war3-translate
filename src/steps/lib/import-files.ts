import { mkdir } from "node:fs/promises";
import path from "node:path";

import { Archive } from "@jamiephan/stormlib";
import { Effect, Schema } from "effect";

import { RAW_DIR } from "../store/const";
import { ImportError } from "../store/error";
import { ExtensionToTranslate } from "../store/extensions";
import type { TranslateProps } from "../store/store";
import { isCanWrite } from "../utils/is-can-write";

const openMap = (map: Archive, path: string) =>
  Effect.try({
    try: () => map.open(path),
    catch: (error) => new ImportError("Failed to open map", error),
  });

type ExtractFilesProps = {
  map: Archive;
} & Pick<TranslateProps, "fileFilter">;

export type ExtractedFileInfo = { name: string; extension: ExtensionToTranslate; mapPath: string };

const extractFiles = ({ map, fileFilter }: ExtractFilesProps) =>
  Effect.gen(function* () {
    yield* Effect.promise(() => mkdir(RAW_DIR, { recursive: true }));

    const files = map.listFiles();
    const extractedFiles: ExtractedFileInfo[] = [];

    for (const file of files) {
      if (file.fileSize === 0) continue;
      if (fileFilter?.exclude && fileFilter.exclude.test(file.plainName)) continue;
      if (fileFilter?.include && !fileFilter.include.test(file.plainName)) continue;

      const match = file.name.match(new RegExp(`\\.(${ExtensionToTranslate.literals.join("|")})`));

      if (!match || !match[1]) continue;

      yield* Effect.logDebug(`        ${file.name} | size: ${file.fileSize}`);

      const extension = yield* Schema.decodeUnknown(ExtensionToTranslate)(match[1]);
      const fileName = file.name.replace(/\\/g, "_").toLowerCase();
      extractedFiles.push({ name: fileName, extension, mapPath: file.name });
      /*  yield* addImportedFile(storeRef, {
        name: fileName,
        extension,
        mapPath: file.name,
      }); */
      map.extractFile(file.name, path.join(RAW_DIR, fileName));
    }

    if (extractedFiles.length === 0)
      return yield* new ImportError(
        "No files found for translation, make sure map has listfile or provide one (or generate using MPQEditor)",
      );

    return extractedFiles;
  });

type ImportFilesProps = {
  mapPath: string;
  mapToUse?: Archive;
} & Pick<ExtractFilesProps, "fileFilter">;

export const importFiles = ({ mapPath, mapToUse, fileFilter }: ImportFilesProps) =>
  Effect.gen(function* () {
    const map = mapToUse || new Archive();

    yield* openMap(map, mapPath);
    yield* isCanWrite(map);

    const result = yield* extractFiles({ map, fileFilter });
    map.close();

    return result;
  });
