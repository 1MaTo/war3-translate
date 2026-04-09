import path from "node:path";

import { NodeFileSystem } from "@effect/platform-node";
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
import { cleanFiles } from "./steps/utils/clean-files";
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

    yield* Effect.log("Map translated");

    return resultPath;
  }).pipe(
    Effect.ensuring(cleanFiles),
    Effect.provide(
      Layer.mergeAll(
        NodeFileSystem.layer,
        TranslateService.Default,
        Logger.replace(Logger.defaultLogger, SimpleLogger),
      ),
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
