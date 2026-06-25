import { NodeFileSystem } from "@effect/platform-node";
import { Effect, Layer, Logger } from "effect";

import { importFiles } from "./steps/lib/import-files";
import { parseFiles } from "./steps/lib/parse-files/parse-files";
import { KO } from "./steps/store/locales";
import { SimpleLogger } from "./steps/utils/simple-logger";

export const debug = () =>
  Effect.gen(function* () {
    yield* Effect.log("DEBUG START");

    const fileList = yield* importFiles({
      mapPath: "C:\\Users\\mato\\Desktop\\MpqEditor\\maps\\FBT 1.7.2 KR47.w3x",
      fileFilter: {
        include: /campaignabilitystrings/i,
      },
    });
    const parsed = yield* parseFiles({ extractedFiles: fileList, locale: KO.literals[0] });
    for (const [_, value] of parsed) {
      console.log(value.substring);
    }

    yield* Effect.log("DEBUG END");
  }).pipe(
    Effect.scoped,
    Effect.provide(
      Layer.mergeAll(Logger.replace(Logger.defaultLogger, SimpleLogger), NodeFileSystem.layer),
    ),
  );
