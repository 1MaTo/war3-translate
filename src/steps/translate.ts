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

  yield* Effect.logDebug(`    ${dictionary.from.length} fragments`);

  const translate = (yield* TranslateService).translate;

  const list: TranslateListItem[] = Array.from(Array(dictionary.from.length));

  for (const [, file] of fileMap) {
    for (const [, line] of file.lineMap) {
      for (const fragment of line) {
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
