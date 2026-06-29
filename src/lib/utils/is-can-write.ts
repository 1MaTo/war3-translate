import type { Archive } from "@jamiephan/stormlib";
import { Effect } from "effect";

import { ImportError } from "../../lib/utils/error";

/** Fast check if map is writable before any work */
export const isCanWrite = (map: Archive) =>
  Effect.try({
    try: () => {
      const filename = `${crypto.randomUUID()}.txt`;
      map.createFile(filename, Date.now(), filename.length);
      map.removeFile(filename);
    },
    catch: (error) => new ImportError("Cannot edit readonly map", error),
  });
