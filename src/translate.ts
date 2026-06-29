import path from "node:path";

import { NodeFileSystem } from "@effect/platform-node";
import { Effect, HashMap, Layer, Logger, LogLevel } from "effect";

import {
  applyFiles,
  exportFiles,
  fromIndex,
  importFiles,
  parseFiles,
  providerParser,
  TranslateError,
  translateList,
  cleanFiles,
  type ParsedSubstring,
  type TranslatedChunk,
  type TranslateLibProps,
} from "./lib";
import { SimpleLogger } from "./simple-logger";

const getTranslations = ({
  parsed,
  from,
  provider,
  to,
  ignoreCache,
  options,
}: { parsed: HashMap.HashMap<string, ParsedSubstring> } & Pick<
  TranslateLibProps,
  "ignoreCache" | "from" | "to" | "provider" | "options"
>) =>
  Effect.gen(function* () {
    const idList: string[] = [];
    const textList: string[] = [];

    for (const [_, item] of parsed) {
      idList.push(item.id);
      textList.push(item.transformed);
    }

    const translateResult = yield* translateList({
      ignoreCache: ignoreCache,
      list: textList,
      from: from,
      to: to,
      provider: provider,
      options: options,
    });

    if (textList.length !== translateResult.length)
      return yield* new TranslateError("Translated item count not equal to total text count");

    const translated: TranslatedChunk[] = [];

    for (let index = 0; index < translateResult.length; index++) {
      const chunk = yield* HashMap.get(parsed, fromIndex(idList, index));
      const parser = providerParser[provider][chunk.extension].decode;

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

    return translated;
  });

export const translateMap = (props: TranslateLibProps) =>
  Effect.gen(function* () {
    yield* Effect.log(`Translating Map: ${path.basename(props.pathToMap)}\n`);

    /*  yield* withTime(importFiles, "Importing files...");

    yield* withTime(parse, "Parsing files...");

    yield* withTime(translate, "Translating files...");

    yield* withTime(apply, "Applying translation...");

    const resultPath = yield* withTime(exportFiles, "Export files to map..."); */

    /* const props: TranslateLibProps = {
      from: "ko",
      to: "en",
      pathToMap: "M:\\game\\warcraft\\Warcraft_1.28\\Maps\\test2\\FBT 1.7.2 ENG47ReFix2 [ENG].w3x",
      pathToTranslatedMap:
        "M:\\game\\warcraft\\Warcraft_1.28\\Maps\\test2\\FBT 1.7.2 ENG47ReFix2 [ENG] full.w3x",
      fileFilter: { include: /\.txt/i },
      provider: "deepl",
      options: {
        deepl: {
          apiKey: "dcf6100c-03f1-4c31-a688-e9aa9ffac571:fx",
          context: "일본 만화 영화",
          glossary: "ec539a03-7086-4449-9a9c-033dc6380aba",
        },
      },
      ignoreCache: false,
    }; */

    yield* Effect.log("[1] Importing...");

    const fileList = yield* importFiles({
      mapPath: props.pathToMap,
      fileFilter: props.fileFilter,
    });

    yield* Effect.log("[2] Parsing...");

    const parsed = yield* parseFiles({
      extractedFiles: fileList,
      locale: props.from,
      provider: props.provider,
    });

    yield* Effect.log("[3] Translating...");

    const translated: TranslatedChunk[] = yield* getTranslations({ ...props, parsed });

    yield* Effect.log("[4] Exporting...");

    yield* applyFiles({ extractedFiles: fileList, translates: translated });

    const newMapPath = yield* exportFiles({
      files: fileList,
      pathToMap: props.pathToMap,
      pathToTranslatedMap: props.pathToTranslatedMap,
    });

    yield* Effect.log(`Map translated ${newMapPath}`);

    if (!props.debug) yield* cleanFiles;

    return newMapPath;
  }).pipe(
    Effect.provide(
      Layer.merge(NodeFileSystem.layer, Logger.replace(Logger.defaultLogger, SimpleLogger)),
    ),
    Logger.withMinimumLogLevel(LogLevel.Debug),
  );
