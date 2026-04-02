import { Effect } from "effect";

import { TranslateService } from "./store/service/translate.service/translate.service";
import { setTranslatedList, TranslateStore } from "./store/store";
import { warcraftString } from "./utils/warcraft-string-parser";

export const translate = Effect.gen(function* () {
  const store = yield* TranslateStore;
  const { rawList, from, to, provider } = yield* store.get;
  const translate = (yield* TranslateService).translate;

  let charCount = 0;
  const encodedList = rawList.map((item) => {
    const encoded = warcraftString["txt"].encode({ value: item, from, to });
    charCount += encoded.length;
    return encoded;
  });

  yield* Effect.logDebug(`    Char count: ${charCount}`);
  yield* Effect.logDebug(`    Line count: ${encodedList.length}`);

  const result = yield* translate({
    from,
    to,
    provider,
    rawList: encodedList,
  });

  yield* setTranslatedList(
    store,
    result.map((item) => warcraftString["txt"].decode({ value: item, from, to })),
  );
});
