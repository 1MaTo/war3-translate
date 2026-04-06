import { mkdir } from "node:fs/promises";
import path from "node:path";

import { Effect, Schema } from "effect";

import { RAW_DIR } from "./store/const";
import { ImportError } from "./store/error";
import { ExtensionToTranslate } from "./store/extensions";
import { TranslateStore } from "./store/store";
import { addImportedFile } from "./store/store.actions";
import { isCanWrite } from "./utils/is-can-write";

/** Extract files from map */
export const importFiles = Effect.gen(function* () {
  const { pathToMap, map } = yield* (yield* TranslateStore).get;

  yield* Effect.logDebug("    Opening map...");
  yield* Effect.try({
    try: () => map.open(pathToMap),
    catch: (error) => new ImportError("    Failed to open map", error),
  });

  yield* Effect.logDebug("    Checking write permission..");
  yield* isCanWrite(map);

  yield* Effect.logDebug("    Extracting files...");

  yield* extractFiles;

  map.close();
});

const extractFiles = Effect.gen(function* () {
  yield* Effect.promise(() => mkdir(RAW_DIR, { recursive: true }));
  const storeRef = yield* TranslateStore;
  const { filesToInclude, filesToExclude, map } = yield* storeRef.get;

  const files = map.listFiles();

  for (const file of files) {
    if (file.fileSize === 0) continue;
    if (filesToInclude && filesToInclude.length > 0 && !filesToInclude.includes(file.plainName))
      continue;
    if (filesToExclude && filesToExclude.includes(file.plainName)) continue;

    const match = file.name.match(new RegExp(`\\.(${ExtensionToTranslate.literals.join("|")})`));

    if (!match || !match[1]) continue;

    yield* Effect.logDebug(`        ${file.name} | size: ${file.fileSize}`);

    const extension = yield* Schema.decodeUnknown(ExtensionToTranslate)(match[1]);
    const fileName = file.name.replace(/\\/g, "_").toLowerCase();
    yield* addImportedFile(storeRef, {
      name: fileName,
      extension,
      mapPath: file.name,
    });
    map.extractFile(file.name, path.join(RAW_DIR, fileName));
  }

  const { fileMap } = yield* storeRef.get;
  if (fileMap.size === 0)
    return yield* new ImportError(
      "No files found for translation, make sure map has listfile or provide one (or generate using MPQEditor)",
    );
});
