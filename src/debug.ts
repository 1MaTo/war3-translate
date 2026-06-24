import { NodeFileSystem } from "@effect/platform-node";
import { Effect, Layer, Logger } from "effect";

import { SimpleLogger } from "./steps/utils/simple-logger";

export const debug = () =>
  Effect.gen(function* () {
    yield* Effect.log("DEBUG START");

    /*  const fileList = yield* importFiles({
      mapPath: "C:\\Users\\mato\\Desktop\\MpqEditor\\maps\\FBT 1.7.2 KR47.w3x",
      filesToInclude: ["war3map.j"],
    }); */

    yield* Effect.log("DEBUG END");
  }).pipe(
    Effect.scoped,
    Effect.provide(
      Layer.mergeAll(Logger.replace(Logger.defaultLogger, SimpleLogger), NodeFileSystem.layer),
    ),
  );
