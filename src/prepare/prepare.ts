import { mkdir } from "node:fs/promises";

import { Effect } from "effect";

import { FILES_DIR } from "#shared/const.ts";
import { FileError } from "#shared/error.ts";

const createFileFolder = Effect.tryPromise({
  try: () => mkdir(FILES_DIR, { recursive: true }),
  catch: () => new FileError({ message: "Filed to create folder for working files" }),
});

export const prepare = () => createFileFolder;
