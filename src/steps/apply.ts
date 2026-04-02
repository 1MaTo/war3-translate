import { mkdir } from "node:fs/promises";

import { Effect } from "effect";

import { TRANSLATED_DIR } from "./store/const";
import { type ParsedFileInfo } from "./store/store";
import { applyToFile } from "./utils/parse-file/apply-file";

export const apply = (parsedInfo: ParsedFileInfo[]) =>
  Effect.gen(function* () {
    yield* Effect.promise(() => mkdir(TRANSLATED_DIR, { recursive: true }));

    const applyFileTaskList = parsedInfo.map((info) => applyToFile(info));

    return yield* Effect.all(applyFileTaskList, { concurrency: "unbounded" });
  });
