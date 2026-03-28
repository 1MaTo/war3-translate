import { access, constants } from "node:fs/promises";

import { Effect } from "effect";

import { FileError } from "../shared/error";
import type { TranslateConfig } from "../shared/translate-config";

export const checkFiles = ({
  pathToMap,
  pathToListFile,
}: Pick<TranslateConfig, "pathToMap" | "pathToListFile">) =>
  Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: () => access(pathToMap, constants.F_OK | constants.R_OK | constants.W_OK),
      catch: () => new FileError({ message: "Map file not exists or cannot read or write" }),
    });

    yield* Effect.tryPromise({
      try: async () =>
        pathToListFile ? await access(pathToListFile, constants.F_OK | constants.R_OK) : true,
      catch: () => new FileError({ message: "List file provided but not exists or cannot read" }),
    });
  });
