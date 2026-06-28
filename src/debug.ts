import { NodeFileSystem } from "@effect/platform-node";
import { Effect, HashMap, Layer, Logger, LogLevel } from "effect";

import { applyFiles, type TranslatedChunk } from "./steps/lib/apply-files/apply-files";
import { exportFiles } from "./steps/lib/export-files";
import { importFiles } from "./steps/lib/import-files";
import { providerParser } from "./steps/lib/parse-files/get-substring-to-translate/get-code-substring-to-translate";
import { parseFiles } from "./steps/lib/parse-files/parse-files";
import type { TranslateLibProps } from "./steps/lib/props";
import { translateList } from "./steps/lib/translate/translate-list";
import { TranslateError } from "./steps/store/error";
import { fromIndex } from "./steps/utils/from-index";
import { SimpleLogger } from "./steps/utils/simple-logger";

export const debug = () =>
  Effect.gen(function* () {
    yield* Effect.log("DEBUG START");

    const props: TranslateLibProps = {
      from: "ko",
      to: "en",
      pathToMap: "M:\\game\\warcraft\\Warcraft_1.28\\Maps\\test2\\translate_test.w3x",
      pathToTranslatedMap:
        "M:\\game\\warcraft\\Warcraft_1.28\\Maps\\test2\\translate_test_complete.w3x",
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

    /*  for (const [, substring] of parsed) {
      console.log([substring.id, substring.raw, substring.transformed]);
    } */

    const idList: string[] = [];
    const textList: string[] = [];

    /* const DEBUG_ITEM_LIMIT = 50;
    let DEBUG_ITEM_COUNT = 0; */
    for (const [_, item] of parsed) {
      /*  if (DEBUG_ITEM_COUNT > DEBUG_ITEM_LIMIT) break; */
      idList.push(item.id);
      textList.push(item.transformed);
      /*  DEBUG_ITEM_COUNT++; */
    }

    const translateResult = yield* translateList({
      ignoreCache: props.ignoreCache,
      list: textList,
      from: props.from,
      to: props.to,
      provider: props.provider,
      options: props.options,
    });

    if (textList.length !== translateResult.length)
      return yield* new TranslateError("Translated item count not equal to total text count");

    const translated: TranslatedChunk[] = [];

    for (let index = 0; index < translateResult.length; index++) {
      const chunk = yield* HashMap.get(parsed, fromIndex(idList, index));
      const parser = providerParser[props.provider][chunk.extension].decode;

      const newChunk: TranslatedChunk = {
        ...chunk,
        translated: fromIndex(translateResult, index),
        complete: parser(fromIndex(translateResult, index)),
      };
      translated.push(newChunk);
      /*   if (newChunk.complete.match(/(?<!\\)"/g)) console.log("QUOTE DETECTED");
      if (newChunk.transformed.includes("\n")) console.log("NEW LINE DETECTED");
      if (
        newChunk.complete.includes("span") ||
        newChunk.complete.includes("div") ||
        newChunk.complete.includes("translate")
      )
        console.log("ARTIFACT DETECTED"); */
      /*  console.log([newChunk.raw, newChunk.transformed, newChunk.translated, newChunk.complete]); */
    }

    yield* applyFiles({ extractedFiles: fileList, translates: translated });

    const newMapPath = yield* exportFiles({
      files: fileList,
      pathToMap: props.pathToMap,
      pathToTranslatedMap: props.pathToTranslatedMap,
    });

    yield* Effect.log(`[Map translated] ${newMapPath}`);

    yield* Effect.log("DEBUG END");
  }).pipe(
    Effect.scoped,
    Effect.provide(
      Layer.mergeAll(Logger.replace(Logger.defaultLogger, SimpleLogger), NodeFileSystem.layer),
    ),
    Logger.withMinimumLogLevel(LogLevel.Debug),
  );
