import path from "node:path";

import { NodeFileSystem } from "@effect/platform-node";
import { Effect, Layer, Logger } from "effect";

import { FILES_DIR, PARSED_DIR } from "./steps/store/const";
import { processFile } from "./steps/utils/process-file";
import { SimpleLogger } from "./steps/utils/simple-logger";

export const Debug = Effect.gen(function* () {
  yield* Effect.log("DEBUG START");

  const filePath = path.join(PARSED_DIR, "debug.j");
  const toPath = path.join(FILES_DIR, "debug", "debug_rewrite.j");
  console.log(filePath);
  yield* processFile({
    extension: "j",
    fromPath: filePath,
    toPath,
    processData: ([data, index]) =>
      Effect.gen(function* () {
        yield* Effect.log("temp");
        const quoteCount = (data.match(/(?<=(?:^|[^\\])(?:\\{2})*)"/g) || []).length;
        console.log(`[${index}] -------> `, quoteCount, quoteCount % 2 === 0);

        return `[${index}]${data}`;
      }),
  });

  yield* Effect.log("DEBUG END");
}).pipe(
  Effect.scoped,
  Effect.provide(
    Layer.mergeAll(Logger.replace(Logger.defaultLogger, SimpleLogger), NodeFileSystem.layer),
  ),
);
