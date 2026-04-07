import path from "node:path";

import { Archive } from "@jamiephan/stormlib";
import { Duration, Effect, Layer, Logger, LogLevel, Ref } from "effect";

import { apply } from "./steps/apply";
import { exportFiles } from "./steps/export";
import { importFiles } from "./steps/import";
import { parse } from "./steps/parse";
import { TranslateService } from "./steps/store/service/translate.service/translate.service";
import { TranslateStore, type TranslateProps, type TranslateState } from "./steps/store/store";
import { GoogleFreeProvider } from "./steps/store/translate-provider";
import { translate } from "./steps/translate";
import { SimpleLogger } from "./steps/utils/simple-logger";

const withTime = <A, E, R>(effect: Effect.Effect<A, E, R>, title: string) =>
  Effect.gen(function* () {
    yield* Effect.log(title);
    const [extractTime, result] = yield* Effect.timed(effect);
    yield* Effect.log(`    Duration: ${extractTime.pipe(Duration.format)}\n`);
    return result;
  });

export const translateMap = (props: TranslateProps) =>
  Effect.gen(function* () {
    yield* Effect.log(`Map: ${path.basename(props.pathToMap)}\n`);

    yield* withTime(importFiles, "Importing files...");

    yield* withTime(parse, "Parsing files...");

    yield* withTime(translate, "Translating files...");

    yield* withTime(apply, "Applying translation...");

    const resultPath = yield* withTime(exportFiles, "Export files to map...");

    /*  const { dictionary, from, to } = yield* (yield* TranslateStore).get;
    for (let index = 0; index < dictionary.from.length; index++) {
      const fromS = fromIndex(dictionary.from, index);
      const toS = fromIndex(dictionary.to, index);
      console.log([
        fromS,
        toS,
        warcraftString["j"].decode({ value: fromS, from, to }),
        warcraftString["j"].decode({ value: toS, from, to }),
      ]);
    } */

    yield* Effect.log("Map translated");

    return resultPath;
  }).pipe(
    Effect.provide(
      Layer.mergeAll(TranslateService.Default, Logger.replace(Logger.defaultLogger, SimpleLogger)),
    ),
    Effect.provideServiceEffect(
      TranslateStore,
      Ref.make<TranslateState>({
        ...props,
        map: new Archive(),
        provider: props.provider || GoogleFreeProvider.literals[0],
        dictionary: { from: [], to: [] },
        fileMap: new Map(),
      }),
    ),
    Logger.withMinimumLogLevel(LogLevel.Debug),
  );
