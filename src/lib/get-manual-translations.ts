import { FileSystem } from "@effect/platform";
import { Effect, Schema } from "effect";

import { ImportError } from "./utils/error";

const schema = Schema.Record({
  key: Schema.String,
  value: Schema.String,
});

export type ManualTranslations = Schema.Schema.Type<typeof schema>;

export const getManualTranslations = (path?: string) =>
  Effect.gen(function* () {
    if (!path) return {};
    const fs = yield* FileSystem.FileSystem;
    const fileContent = yield* fs.readFileString(path, "utf-8");
    return yield* Schema.decodeUnknown(Schema.parseJson(schema))(fileContent).pipe(
      Effect.mapError(
        (error) => new ImportError(`Failed to get manual translations ${error}`, error),
      ),
    );
  });
