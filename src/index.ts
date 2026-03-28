import { Effect } from "effect";

import { translate } from "./translate";

const program = Effect.gen(function* () {
  const result = yield* translate({
    pathToMap: "C:\\Users\\mato\\Desktop\\MpqEditor\\maps\\translate.w3x",
    pathToListFile: "C:\\Users\\mato\\Desktop\\MpqEditor\\listfile\\(listfile)",
  });

  console.log(result);
});

Effect.runPromise(program);
