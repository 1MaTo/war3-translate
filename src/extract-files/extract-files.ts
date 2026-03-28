import { rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { Archive } from "@jamiephan/stormlib";
import { Effect, Schema } from "effect";

import type { TranslateConfig } from "#shared/translate-config.ts";

import { FILES_DIR } from "../shared/const";
import { FileError } from "../shared/error";

const ValidExtension = Schema.Literal("j", "txt");
type ValidExtension = typeof ValidExtension.Type;

export type ExtractedFileInfo = {
  extension: ValidExtension;
  path: string;
  fullName: string;
  name: string;
};

export const extractFiles = Effect.fn(function* ({
  pathToMap,
  pathToListFile,
}: Pick<TranslateConfig, "pathToMap" | "pathToListFile">) {
  const map = new Archive();
  yield* Effect.try({
    try: () => map.open(pathToMap),
    catch: () => new FileError({ message: "Failed to open map" }),
  });

  yield* isCanWriteToMap(map);

  if (pathToListFile)
    yield* Effect.try({
      try: () => map.addListFile(pathToListFile),
      catch: () => new FileError({ message: "Failed to add provided listfile" }),
    });

  const files = map.listFiles();
  const filesInfo: ExtractedFileInfo[] = [];

  for (const file of files) {
    if (file.fileSize === 0) continue;

    const match = file.name.match(/\.(txt|j)/);
    if (!match || !match[1]) continue;

    const extension = yield* Schema.decodeUnknown(ValidExtension)(match[1]);
    const filePath = path.join(FILES_DIR, file.plainName);
    filesInfo.push({
      extension: extension,
      path: filePath,
      fullName: file.name,
      name: file.plainName,
    });
    map.extractFile(file.name, path.join(FILES_DIR, file.plainName));
  }

  yield* Effect.log(`Found ${filesInfo.length} files`);

  return filesInfo;
});

const isCanWriteToMap = Effect.fn(function* (map: Archive) {
  const fileName = `${crypto.randomUUID()}.txt`;
  const pathToFile = path.join(FILES_DIR, fileName);

  yield* Effect.tryPromise({
    try: (signal) => writeFile(pathToFile, "", { signal }),
    catch: () => new FileError({ message: "Failed to save file for test map write" }),
  });

  yield* Effect.try({
    try: () => {
      map.addFile(pathToFile, fileName);
      map.removeFile(fileName);
    },
    catch: () => new FileError({ message: "Provided map is readonly" }),
  });

  yield* Effect.promise(() => rm(pathToFile, { force: true }));
});
