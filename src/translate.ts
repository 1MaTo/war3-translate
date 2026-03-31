import path from "node:path";

import { Archive } from "@jamiephan/stormlib";
import { Effect, Logger, LogLevel, Ref } from "effect";

import { extract } from "./steps/extract";
import { parse } from "./steps/parse";
import {
  GoogleFreeProvider,
  TranslateStore,
  type TranslateProps,
  type TranslateState,
} from "./steps/store/store";

export const translateMap = (
  props: Omit<TranslateProps, "provider"> & Partial<Pick<TranslateProps, "provider">>,
) =>
  Effect.gen(function* () {
    yield* Effect.log(`Map: ${path.basename(props.pathToMap)}`);

    yield* Effect.log(`[1] Extracting files...`);
    const extractInfo = yield* extract;

    yield* Effect.log("[2] Parsing files...");
    yield* parse(extractInfo);

    yield* Effect.log("Map translated");
  }).pipe(
    Effect.catchAll((error) => Effect.logError(`Translation failed: ${error.message}`)),
    Effect.provideServiceEffect(
      TranslateStore,
      Ref.make<TranslateState>({
        ...props,
        map: new Archive(),
        rawList: [],
        translatedList: [],
        provider: props.provider || GoogleFreeProvider.literals[0],
      }),
    ),
    Effect.withLogSpan("time"),
    Effect.provide(Logger.pretty),
    Logger.withMinimumLogLevel(LogLevel.Debug),
  );
