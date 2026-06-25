import { Effect } from "effect";

export const translateList = (list: string[]) =>
  Effect.gen(function* () {
    yield* Effect.log("TODO", list);
  });
