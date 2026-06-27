import path from "node:path";

import { FileSystem } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { Archive, MPQ_FILE_REPLACEEXISTING } from "@jamiephan/stormlib";
import { Effect } from "effect";

import { TRANSLATED_DIR } from "../store/const";
import { ApplyError } from "../store/error";
import type { ExtractedFileInfo } from "./import-files";
import type { TranslateLibProps } from "./props";

type CloneMapProps = Pick<TranslateLibProps, "pathToMap" | "pathToTranslatedMap">;

const cloneMap = ({ pathToMap, pathToTranslatedMap }: CloneMapProps) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const { dir, name, ext } = path.parse(pathToMap);
    const pathToClone = pathToTranslatedMap ?? path.join(dir, `${name}_translated${ext}`);
    yield* fs.copyFile(pathToMap, pathToClone);
    return pathToClone;
  }).pipe(
    Effect.provide(NodeContext.layer),
    Effect.catchAll((error) => new ApplyError("Failed to copy map", error)),
  );

type ExportFilesProps = { files: ExtractedFileInfo[] } & CloneMapProps;

export const exportFiles = ({ files, pathToMap, pathToTranslatedMap }: ExportFilesProps) =>
  Effect.gen(function* () {
    const pathToClone = yield* cloneMap({ pathToMap, pathToTranslatedMap });

    const map = new Archive();
    map.open(pathToClone);

    for (const file of files) {
      map.addFile(path.join(TRANSLATED_DIR, file.name), file.mapPath, {
        flags: MPQ_FILE_REPLACEEXISTING,
      });
    }

    map.close();

    return pathToClone;
  });
