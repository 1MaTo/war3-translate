import { mkdir } from "node:fs/promises";
import path from "node:path";

import { Effect } from "effect";

import { PARSED_DIR, TRANSLATED_DIR } from "./store/const";
import { ApplyError } from "./store/error";
import { TranslateStore } from "./store/store";
import { getFileChunkUtils } from "./utils/get-line-parser/get-file-chunk-utils";
import { processFile } from "./utils/process-file";

export const apply = Effect.gen(function* () {
  const { fileMap } = yield* (yield* TranslateStore).get;
  yield* Effect.promise(() => mkdir(TRANSLATED_DIR, { recursive: true }));

  const applyFileTaskList = Array.from(fileMap.keys()).map(applyToFile);

  return yield* Effect.all(applyFileTaskList, { concurrency: "unbounded" });
});

const applyToFile = (fileName: string) =>
  Effect.gen(function* () {
    const storeRef = yield* TranslateStore;
    const { from, to, dictionary, fileMap } = yield* storeRef.get;

    const info = fileMap.get(fileName);
    if (!info) return yield* new ApplyError(`${fileName} not found`);

    const { getTranslationReplacer } = getFileChunkUtils({
      extension: info.extension,
      from: from,
    });
    const translationReplacer = getTranslationReplacer({ info, dictionary, to });

    yield* processFile({
      extension: info.extension,
      fromPath: path.join(PARSED_DIR, info.name),
      toPath: path.join(TRANSLATED_DIR, info.name),
      processData: (data) =>
        Effect.sync(function () {
          return translationReplacer(data);
        }),
    });
  });
