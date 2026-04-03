import { Effect } from "effect";

import { TranslateStore } from "./store/store";

export const translate = Effect.gen(function* () {
  const { dictionary } = yield* (yield* TranslateStore).get;

  const charCount = dictionary.from.reduce((total, line) => total + line.length, 0);
  yield* Effect.logDebug(`    Char count: ${charCount}`);
  yield* Effect.logDebug(`    Line count: ${dictionary.from.length}`);

  /* const translate = (yield* TranslateService).translate;
   const result = yield* translate({
    from,
    to,
    provider,
    rawList,
  }); */

  /*  yield* setTranslatedList(store, result);  */
});
