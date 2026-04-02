import { Effect } from "effect";

import { translateMap } from "./translate";

const program = Effect.gen(function* () {
  yield* translateMap({
    pathToMap: "C:\\Users\\mato\\Desktop\\MpqEditor\\maps\\test_fbt_unprotected_list_file.w3x",
    from: "ko",
    to: "en",
    filesToInclude: ["war3map.j"],
  });
});

Effect.runPromise(program);

/* import { NodeRuntime } from "@effect/platform-node";
import { Archive, MPQ_FILE_REPLACEEXISTING } from "@jamiephan/stormlib";
import { Effect } from "effect";

NodeRuntime.runMain(
  Effect.gen(function* () {
    yield* Effect.log("DEBUG START");
    const map = new Archive();
    map.open("C:\\Users\\mato\\Desktop\\MpqEditor\\maps\\test_fbt_unprotected_list_file.w3x");
    map.addFile(
      "tmp\\translated\\CampaignAbilityStrings.txt",
      "Units\\CampaignAbilityStrings.txt",
      {
        flags: MPQ_FILE_REPLACEEXISTING,
      },
    );
    yield* Effect.log("DEBUG END");
  }),
); */
