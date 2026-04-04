import path from "node:path";

import { FileSystem } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { Archive, MPQ_FILE_REPLACEEXISTING } from "@jamiephan/stormlib";
import { Effect } from "effect";

import { TRANSLATED_DIR } from "./store/const";
import { ApplyError } from "./store/error";
import { TranslateStore } from "./store/store";

export const exportFiles = Effect.gen(function* () {
  const { fileMap } = yield* (yield* TranslateStore).get;

  yield* Effect.logDebug("    Exporting files...");

  const pathToClone = yield* cloneMap;

  yield* Effect.logDebug(`    Map cloned: ${pathToClone}`);

  const map = new Archive();
  map.open(pathToClone);

  for (const [, info] of fileMap) {
    map.addFile(path.join(TRANSLATED_DIR, info.name), info.mapPath, {
      flags: MPQ_FILE_REPLACEEXISTING,
    });
  }

  map.close();
});

const cloneMap = Effect.gen(function* () {
  yield* Effect.logDebug("        Cloning map...");

  const { pathToMap, pathToTranslatedMap } = yield* (yield* TranslateStore).get;
  const fs = yield* FileSystem.FileSystem;
  const { dir, name, ext } = path.parse(pathToMap);
  const pathToClone = pathToTranslatedMap ?? path.join(dir, `${name}_translated${ext}`);
  yield* fs.copyFile(pathToMap, pathToClone);
  return pathToClone;
}).pipe(
  Effect.provide(NodeContext.layer),
  Effect.catchAll((error) => new ApplyError("Failed to copy map", error)),
);
