import { Effect } from "effect";

import { ExtractError } from "./store/error";
import { TranslateStore } from "./store/store";
import { extractFiles } from "./utils/extract-files";
import { isCanWrite } from "./utils/is-can-write";

/** Extract files from map */
export const importFiles = Effect.gen(function* () {
  const { pathToMap, map } = yield* (yield* TranslateStore).get;

  yield* Effect.logDebug("    Opening map...");
  yield* Effect.try({
    try: () => map.open(pathToMap),
    catch: (error) => new ExtractError("    Failed to open map", error),
  });

  yield* Effect.logDebug("    Checking write permission..");
  yield* isCanWrite(map);

  yield* Effect.logDebug("    Extracting files...");

  return yield* extractFiles(map);
});
