import { createHash } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

import { Effect } from "effect";

import { PARSED_DIR, RAW_DIR } from "./store/const";
import { ParseError } from "./store/error";
import { TranslateStore } from "./store/store";
import { addFragment, removeImportedFile } from "./store/store.actions";
import { getFileChunkUtils } from "./utils/get-line-parser/get-file-chunk-utils";
import { processFile } from "./utils/process-file";
import { warcraftString } from "./utils/warcraft-string-parser";

/** Parse extracted files */
export const parse = Effect.gen(function* () {
  yield* Effect.promise(() => mkdir(PARSED_DIR, { recursive: true }));

  const fileMap = (yield* (yield* TranslateStore).get).fileMap;

  const parseFileTaskList = Array.from(fileMap.keys()).map(parseFile);

  return yield* Effect.all(parseFileTaskList, { concurrency: "unbounded" });
});

const parseFile = (name: string) =>
  Effect.gen(function* () {
    const storeRef = yield* TranslateStore;
    const { fileMap, from, to, provider } = yield* (yield* TranslateStore).get;
    const info = fileMap.get(name);
    if (!info) return yield* new ParseError(`File ${name} not found`);

    const oldPath = path.join(RAW_DIR, info.name);
    const newPath = path.join(PARSED_DIR, info.name);

    let fragmentCount = 0;

    const { parse, replaceByHash } = getFileChunkUtils({
      extension: info.extension,
      from: from,
    });

    const preHash = createHash("md5").update(from).update(to).update(provider).digest();

    yield* processFile({
      extension: info.extension,
      fromPath: oldPath,
      toPath: newPath,
      processData: ([chunk, index]) =>
        Effect.gen(function* () {
          const fragments = parse(chunk);
          if (!fragments) return chunk;

          fragmentCount += fragments.length;

          let result = chunk;
          for (const fragment of fragments) {
            const encodedFragment = warcraftString[info.extension].encode({
              value: fragment,
              from: from,
              to: to,
            });

            const fragmentHash = createHash("md5")
              .update(preHash)
              .update(encodedFragment)
              .digest("hex");

            yield* addFragment(storeRef, {
              fileName: info.name,
              fragment: encodedFragment,
              hash: fragmentHash,
              lineIndex: index,
            });

            result = replaceByHash({ text: result, fragment, hash: fragmentHash });
          }

          return result;
        }),
    });

    if (fragmentCount > 0) {
      yield* Effect.logDebug(`    ${info.mapPath}`);
      yield* Effect.logDebug(`        ${fragmentCount} fragments`);
    } else {
      yield* removeImportedFile(storeRef, name);
      yield* Effect.promise(() => rm(oldPath, { force: true }));
      yield* Effect.promise(() => rm(newPath, { force: true }));
    }
  });
