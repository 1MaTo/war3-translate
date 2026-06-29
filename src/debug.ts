import { NodeFileSystem } from "@effect/platform-node";
import { Effect, HashMap, Layer, Logger, LogLevel } from "effect";

import { fromIndex, providerParser, TranslateError, type ParsedSubstring } from "./lib";
import { applyFiles, type TranslatedChunk } from "./lib/apply-files/apply-files";
import { exportFiles } from "./lib/export-files";
import { importFiles } from "./lib/import-files";
import { parseFiles } from "./lib/parse-files/parse-files";
import { translateList } from "./lib/translate/translate-list";
import type { TranslateLibProps } from "./lib/types/props";
import { SimpleLogger } from "./simple-logger";

const getTranslations = ({
  parsed,
  ...props
}: { parsed: HashMap.HashMap<string, ParsedSubstring> } & TranslateLibProps) =>
  Effect.gen(function* () {
    const idList: string[] = [];
    const textList: string[] = [];

    for (const [_, item] of parsed) {
      idList.push(item.id);
      textList.push(item.transformed);
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

    return translated;
  });

export const debug = () =>
  Effect.gen(function* () {
    yield* Effect.log("DEBUG START");

    const props: TranslateLibProps = {
      from: "ko",
      to: "en",
      pathToMap: "M:\\game\\warcraft\\Warcraft_1.28\\Maps\\test2\\FBT 1.7.2 ENG47ReFix2 [ENG].w3x",
      pathToTranslatedMap:
        "M:\\game\\warcraft\\Warcraft_1.28\\Maps\\test2\\FBT 1.7.2 ENG47ReFix2 [ENG] full.w3x",
      fileFilter: { include: /\.txt/i },
      provider: "deepl",
      options: {
        deepl: {
          apiKey: "",
          context: "일본 만화 영화",
          glossary: "ec539a03-7086-4449-9a9c-033dc6380aba",
        },
      },
      ignoreCache: false,
      debug: true,
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

    const translated = yield* getTranslations({ parsed, ...props });

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
