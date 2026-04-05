import { Effect } from "effect";
import { enableMapSet } from "immer";

import { translateMap } from "./translate";

enableMapSet();

const program = Effect.gen(function* () {
  yield* translateMap({
    pathToMap: "C:\\Users\\mato\\Desktop\\MpqEditor\\maps\\test_fbt_unprotected_list_file.w3x",
    pathToTranslatedMap: "M:\\game\\warcraft\\Warcraft_1.28\\Maps\\test\\translated_test.w3x",
    from: "ko",
    to: "en",
    filesToInclude: ["war3map.j"],
  });
});

Effect.runPromise(program);
