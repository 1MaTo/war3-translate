import { mkdir } from "node:fs/promises";
import path from "node:path";

import { Effect } from "effect";

import { PARSED_DIR, TRANSLATED_DIR } from "./store/const";
import { ApplyError } from "./store/error";
import { TranslateStore } from "./store/store";
import { fromIndex } from "./utils/from-index";
import { processFileByLine } from "./utils/process-file";
import { warcraftString } from "./utils/warcraft-string-parser";

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

    yield* processFileByLine({
      fromPath: path.join(PARSED_DIR, info.name),
      toPath: path.join(TRANSLATED_DIR, info.name),
      processLine: ([line, index]) =>
        Effect.sync(function () {
          const lineInfo = info.lineMap.get(index);
          if (!lineInfo) return `${line}\n`;

          let result = line;
          for (const fragment of lineInfo) {
            result = result.replaceAll(
              fragment.hash,
              warcraftString[info.extension].decode({
                value: fromIndex(dictionary.to, fragment.dictionaryIndex),
                from,
                to,
              }),
            );
          }

          return `${result}\n`;
        }),
    });
  });
