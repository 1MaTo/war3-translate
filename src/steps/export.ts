import { MPQ_FILE_REPLACEEXISTING } from "@jamiephan/stormlib";
import { Effect } from "effect";

import { TranslateStore, type TranslatedFileInfo } from "./store/store";

export const exportFiles = (infoList: TranslatedFileInfo[]) =>
  Effect.gen(function* () {
    const { map } = yield* (yield* TranslateStore).get;

    yield* Effect.logDebug("    Exporting files...");

    for (const info of infoList) {
      map.addFile(info.systemPath, info.mapPath, {
        flags: MPQ_FILE_REPLACEEXISTING,
      });
    }

    yield* Effect.logDebug("    Closing map...");
    map.close();
  });
