import { Effect } from "effect";
import { enableMapSet } from "immer";

import { translateMap } from "./translate";

enableMapSet();

const program = Effect.gen(function* () {
  yield* translateMap({
    pathToMap: "C:\\Users\\mato\\Desktop\\MpqEditor\\maps\\test_fbt_unprotected_list_file.w3x",
    from: "ko",
    to: "en",
    filesToInclude: ["CampaignAbilityStrings.txt"],
  });
});

Effect.runPromise(program);

/* import path from "node:path";

import { NodeRuntime } from "@effect/platform-node";
import { Effect } from "effect";

import { processFileByLine } from "./steps/parse";
import { PARSED_DIR } from "./steps/store/const";

NodeRuntime.runMain(
  Effect.gen(function* () {
    yield* Effect.log("DEBUG START");

    yield* processFileByLine({
      fromPath: path.join(PARSED_DIR, "test.txt"),
      toPath: path.join(PARSED_DIR, "new.txt"),
      processLine: (data) =>
        Effect.gen(function* () {
          yield* Effect.log(data);
          return `${data}\n`;
        }),
    });

    yield* Effect.log("DEBUG END");
  }),
); */
