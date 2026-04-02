import { mkdir } from "node:fs/promises";
import path from "node:path";

import type { Archive } from "@jamiephan/stormlib";
import { Effect, Schema } from "effect";

import { RAW_DIR } from "../store/const";
import { ExtractError } from "../store/error";
import { ExtensionToTranslate } from "../store/extensions";
import { TranslateStore, type ExtractedFileInfo } from "../store/store";

export const extractFiles = (map: Archive) =>
  Effect.gen(function* () {
    yield* Effect.promise(() => mkdir(RAW_DIR, { recursive: true }));
    const { filesToInclude } = yield* (yield* TranslateStore).get;

    const files = map.listFiles();
    const filesInfo: ExtractedFileInfo[] = [];

    for (const file of files) {
      if (file.fileSize === 0) continue;
      if (filesToInclude && filesToInclude.length > 0 && !filesToInclude.includes(file.plainName))
        continue;

      const match = file.name.match(new RegExp(`\\.(${ExtensionToTranslate.literals.join("|")})`));

      if (!match || !match[1]) continue;

      yield* Effect.logDebug(`        ${file.name} ${file.fileSize}`);

      const extension = yield* Schema.decodeUnknown(ExtensionToTranslate)(match[1]);
      const filePath = path.join(RAW_DIR, file.plainName);
      filesInfo.push({
        extension: extension,
        systemPath: filePath,
        mapPath: file.name,
        name: file.plainName,
      });

      map.extractFile(file.name, filePath);
    }

    if (filesInfo.length === 0)
      return yield* new ExtractError(
        "No files found for translation, make sure map has listfile or provide one (or generate using MPQEditor)",
      );

    return filesInfo;
  });
