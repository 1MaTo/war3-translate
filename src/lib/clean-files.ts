import { FileSystem } from "@effect/platform";
import { Effect } from "effect";

import { PARSED_DIR, RAW_DIR, TRANSLATED_DIR } from "./const";

export const cleanFiles = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.remove(RAW_DIR, { recursive: true, force: true });
  yield* fs.remove(PARSED_DIR, { recursive: true, force: true });
  yield* fs.remove(TRANSLATED_DIR, { recursive: true, force: true });
}).pipe(Effect.catchAll(() => Effect.log("Failed to clean tmp folder :(")));
