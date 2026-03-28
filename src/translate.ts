import { Effect } from "effect";

import type { TranslateConfig } from "#shared/translate-config.ts";

import { checkFiles } from "./check-files/check-files";
import { prepare } from "./prepare/prepare";

export const translate = Effect.fn(function* ({ pathToMap, pathToListFile }: TranslateConfig) {
  yield* prepare();
  yield* checkFiles({ pathToMap, pathToListFile });
  /*  const filesInfo = yield* extractFiles({ pathToMap, pathToListFile });

  const store = new TranslationStore(
    yield* Ref.make<FileTranslateInfo>({ rawList: [], translateList: [] }),
  );

  if (filesInfo[0]) {
    const file = filesInfo[0];
    yield* collectTranslations(store, file.path);
  } */

  return "ok";
});
