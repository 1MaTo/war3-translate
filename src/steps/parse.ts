import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { Effect } from "effect";

import { PARSED_DIR, RAW_DIR } from "./store/const";
import { ParseError } from "./store/error";
import { TranslateStore } from "./store/store";
import { addFragment } from "./store/store.actions";
import { getLineParser } from "./utils/get-line-parser/get-line-parser";
import { processFileByLine } from "./utils/process-file";
import { warcraftString } from "./utils/warcraft-string-parser";

/** Parse extracted files */
export const parse = Effect.gen(function* () {
  yield* Effect.promise(() => mkdir(PARSED_DIR, { recursive: true }));

  const fileMap = (yield* (yield* TranslateStore).get).fileMap;

  const parseFileTaskList = Array.from(fileMap.keys()).map((name) => parseFile(name));

  return yield* Effect.all(parseFileTaskList, { concurrency: "unbounded" });
});

const parseFile = (name: string) =>
  Effect.gen(function* () {
    const storeRef = yield* TranslateStore;
    const { fileMap, from, to, provider } = yield* storeRef.get;
    const info = fileMap.get(name);
    if (!info) return yield* new ParseError(`File ${name} not found`);

    const newPath = path.join(PARSED_DIR, info.name);

    let linesTotal = 0;
    let linesReplaced = 0;

    const parseLine = getLineParser({
      extension: info.extension,
      from: from,
    });

    const preHash = createHash("md5").update(from).update(to).update(provider).digest();

    yield* processFileByLine({
      fromPath: path.join(RAW_DIR, info.name),
      toPath: newPath,
      processLine: ([line, index]) =>
        Effect.gen(function* () {
          linesTotal++;

          const fragment = parseLine(line);
          if (!fragment) return `${line}\n`;

          linesReplaced++;

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

          return `${line.replaceAll(fragment, fragmentHash)}\n`;
        }),
    });

    yield* Effect.logDebug(
      `    ${info.mapPath}; Parsed: ${linesReplaced} lines; Total: ${linesTotal} lines`,
    );
  });
