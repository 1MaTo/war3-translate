import type { Archive } from "@jamiephan/stormlib";
import { Effect } from "effect";

import { ExtractError } from "../store/error";

/** Fast check if map is writable before any work */
export const isCanWrite = (map: Archive) =>
  Effect.try({
    try: () => {
      const filename = `${crypto.randomUUID()}.txt`;
      map.createFile(filename, Date.now(), filename.length);
      map.removeFile(filename);
    },
    catch: (error) => new ExtractError("Cannot edit readonly map", error),
  });
