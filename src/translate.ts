import path from "node:path";

import { Archive } from "@jamiephan/stormlib";
import { Duration, Effect, Layer, Logger, LogLevel, Ref } from "effect";

import { importFiles } from "./steps/import";
import { parse } from "./steps/parse";
import { TranslateService } from "./steps/store/service/translate.service/translate.service";
import { TranslateStore, type TranslateProps, type TranslateState } from "./steps/store/store";
import { GoogleFreeProvider } from "./steps/store/translate-provider";
import { translate } from "./steps/translate";

const SimpleLogger = Logger.make(({ message }) => {
  if (Array.isArray(message)) return console.log(message.join("; "));
  return console.log(message);
});

const withTime = <A, E, R>(effect: Effect.Effect<A, E, R>, title: string) =>
  Effect.gen(function* () {
    yield* Effect.log(title);
    const [extractTime, result] = yield* Effect.timed(effect);
    yield* Effect.log(`    Duration: ${extractTime.pipe(Duration.format)}\n`);
    return result;
  });

export const translateMap = (
  props: Omit<TranslateProps, "provider"> & Partial<Pick<TranslateProps, "provider">>,
) =>
  Effect.gen(function* () {
    yield* Effect.log(`Map: ${path.basename(props.pathToMap)}\n`);

    yield* withTime(importFiles, "Importing files...");

    yield* withTime(parse, "Parsing files...");

    yield* withTime(translate, "Translating files...");

    /*yield* Effect.log("Translating files...");
    const [translatedTime] = yield* Effect.timed(translate);
    yield* Effect.log(`    Duration: ${translatedTime.pipe(Duration.format)}\n`);

    yield* Effect.log("Applying translation...");
    const [applyTime, translatedInfo] = yield* Effect.timed(apply(parsedInfo));
    yield* Effect.log(`    Duration: ${applyTime.pipe(Duration.format)}\n`);

    yield* Effect.log("Export files to map...");
    const [exportTime] = yield* Effect.timed(exportFiles(translatedInfo));
    yield* Effect.log(`    Duration: ${exportTime.pipe(Duration.format)}\n`); */

    yield* Effect.log("Map translated");
  }).pipe(
    Effect.provideServiceEffect(
      TranslateStore,
      Ref.make<TranslateState>({
        ...props,
        map: new Archive(),
        rawList: [],
        translatedList: [],
        provider: props.provider || GoogleFreeProvider.literals[0],
        dictionary: { from: [], to: [] },
        fileMap: new Map(),
      }),
    ),
    Effect.provide(
      Layer.mergeAll(TranslateService.Default, Logger.replace(Logger.defaultLogger, SimpleLogger)),
    ),
    Effect.catchAll((error) => Effect.logError(`Translation failed: ${error.message}`)),
    Logger.withMinimumLogLevel(LogLevel.Debug),
  );
