import { NodeFileSystem } from "@effect/platform-node";
import { Effect, Layer, Logger, LogLevel } from "effect";

import { importFiles } from "./steps/lib/import-files";
import { parseFiles } from "./steps/lib/parse-files/parse-files";
import type { TranslateLibProps } from "./steps/lib/props";
import { SimpleLogger } from "./steps/utils/simple-logger";

export const debug = () =>
  Effect.gen(function* () {
    yield* Effect.log("DEBUG START");

    const props: TranslateLibProps = {
      from: "ko",
      to: "en",
      pathToMap: "C:\\Users\\mato\\Desktop\\MpqEditor\\maps\\FBT 1.7.2 KR47.w3x",
      pathToTranslatedMap: "M:\\game\\warcraft\\Warcraft_1.28\\Maps\\test2\\translate_test.w3x",
      fileFilter: { include: /\.j/i },
      provider: "google-free",
      options: {
        deepl: {
          apiKey: "",
          context: "일본 만화 영화",
          glossary: "ec539a03-7086-4449-9a9c-033dc6380aba",
        },
      },
      ignoreCache: false,
    };

    const fileList = yield* importFiles({
      mapPath: props.pathToMap,
      fileFilter: props.fileFilter,
    });
    const parsed = yield* parseFiles({
      extractedFiles: fileList,
      locale: props.from,
      provider: props.provider,
    });

    for (const [, substring] of parsed) {
      console.log(substring);
    }

    // const idList: string[] = [];
    // const textList: string[] = [];

    // /* const DEBUG_ITEM_LIMIT = 50;
    // let DEBUG_ITEM_COUNT = 0; */
    // for (const [_, item] of parsed) {
    //   /*  if (DEBUG_ITEM_COUNT > DEBUG_ITEM_LIMIT) break; */
    //   idList.push(item.id);
    //   textList.push(item.substring.transformed);
    //   /*  DEBUG_ITEM_COUNT++; */
    // }

    // const translateResult = yield* translateList({
    //   ignoreCache: props.ignoreCache,
    //   list: textList,
    //   from: props.from,
    //   to: props.to,
    //   provider: props.provider,
    //   options: props.options,
    // });

    // if (textList.length !== translateResult.length)
    //   return yield* new TranslateError("Translated item count not equal to total text count");

    // const translated: TranslatedChunk[] = [];

    // const parser = providerParser[props.provider].decode;
    // for (let index = 0; index < translateResult.length; index++) {
    //   const chunk = yield* HashMap.get(parsed, fromIndex(idList, index));

    //   const newChunk: TranslatedChunk = {
    //     ...chunk,
    //     substring: {
    //       ...chunk.substring,
    //       translated: fromIndex(translateResult, index),
    //       complete: parser(fromIndex(translateResult, index)),
    //     },
    //   };
    //   translated.push(newChunk);
    //   console.log(newChunk.id, newChunk.substring);
    // }

    // yield* applyFiles({ extractedFiles: fileList, translates: translated });

    // const newMapPath = yield* exportFiles({
    //   files: fileList,
    //   pathToMap: props.pathToMap,
    //   pathToTranslatedMap: props.pathToTranslatedMap,
    // });

    // yield* Effect.log(`[Map translated] ${newMapPath}`);

    yield* Effect.log("DEBUG END");
  }).pipe(
    Effect.scoped,
    Effect.provide(
      Layer.mergeAll(Logger.replace(Logger.defaultLogger, SimpleLogger), NodeFileSystem.layer),
    ),
    Logger.withMinimumLogLevel(LogLevel.Debug),
  );
