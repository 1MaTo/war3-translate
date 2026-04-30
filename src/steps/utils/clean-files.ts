import { FileSystem } from "@effect/platform";
import { Effect } from "effect";

import { PARSED_DIR, RAW_DIR, TRANSLATED_DIR, TRANSLATION_LIST_RAW } from "../store/const";
import { TranslateStore } from "../store/store";

export const cleanFiles = Effect.gen(function* () {
  const { debug } = yield* (yield* TranslateStore).get;
  if (debug) return;

  const fs = yield* FileSystem.FileSystem;
  yield* fs.remove(RAW_DIR, { recursive: true });
  yield* fs.remove(PARSED_DIR, { recursive: true });
  yield* fs.remove(TRANSLATED_DIR, { recursive: true });
  yield* fs.remove(TRANSLATION_LIST_RAW, { recursive: true });
}).pipe(Effect.catchAll(() => Effect.log("Failed to clean tmp folder :(")));
