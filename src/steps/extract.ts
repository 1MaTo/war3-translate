import { Effect, FiberRef, List } from "effect";

import { ExtractError } from "./store/error";
import { TranslateStore } from "./store/store";
import { extractFiles } from "./utils/extract-files";
import { isCanWrite } from "./utils/is-can-write";

/** Extract files from map */
export const extract = Effect.gen(function* () {
  const { pathToMap, map } = yield* (yield* TranslateStore).get;

  yield* Effect.logDebug("Extracting map files..");

  yield* Effect.logDebug(`Opening map...`);
  yield* Effect.try({
    try: () => map.open(pathToMap),
    catch: (error) => new ExtractError("Failed to open map", error),
  });

  yield* Effect.logDebug("Checking write permission..");
  yield* isCanWrite(map);

  yield* Effect.logDebug("Extracting files...");
  return yield* extractFiles(map);
}).pipe(Effect.locally(FiberRef.currentLogSpan, List.empty()));
