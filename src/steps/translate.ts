import { Effect } from "effect";

import {
  TranslateService,
  type TranslateListItem,
} from "./store/service/translate.service/translate.service";
import { TranslateStore } from "./store/store";
import { saveTranslations } from "./store/store.actions";
import { fromIndex } from "./utils/from-index";

export const translate = Effect.gen(function* () {
  const storeRef = yield* TranslateStore;
  const { dictionary, from, to, provider, fileMap } = yield* storeRef.get;

  const charCount = dictionary.from.reduce((total, line) => total + line.length, 0);
  yield* Effect.logDebug(`    Char count: ${charCount}`);
  yield* Effect.logDebug(`    Fragment count: ${dictionary.from.length}`);

  const translate = (yield* TranslateService).translate;

  const list: TranslateListItem[] = Array.from(Array(dictionary.from.length));

  for (const [, file] of fileMap) {
    for (const [, line] of file.lineMap) {
      for (const fragment of line) {
        if (list[fragment.dictionaryIndex]) continue;

        list[fragment.dictionaryIndex] = {
          hash: fragment.hash,
          fragment: fromIndex(dictionary.from, fragment.dictionaryIndex),
          index: fragment.dictionaryIndex,
        };
      }
    }
  }

  const result = yield* translate({
    from,
    to,
    provider,
    list,
  });

  yield* saveTranslations(storeRef, result);
});
