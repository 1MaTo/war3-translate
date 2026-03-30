import { mkdir } from "node:fs/promises";

import { Effect } from "effect";

import { PARSED_DIR } from "./store/const";
import { type ExtractedFileInfo } from "./store/store";
import { parseFile } from "./utils/parse-file/parse-file";

/** Parse extracted files */
export const parse = (extractedInfo: ExtractedFileInfo[]) =>
  Effect.gen(function* () {
    yield* Effect.promise(() => mkdir(PARSED_DIR, { recursive: true }));

    const parseFileTaskList = extractedInfo.map((info) => parseFile(info));

    return yield* Effect.all(parseFileTaskList, { concurrency: "unbounded" });
  });
