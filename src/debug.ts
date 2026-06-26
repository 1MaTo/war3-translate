import { NodeFileSystem } from "@effect/platform-node";
import { Effect, HashMap, Layer, Logger, LogLevel } from "effect";

import { applyFiles, type TranslatedChunk } from "./steps/lib/apply-files/apply-files";
import { exportFiles } from "./steps/lib/export-files";
import { importFiles } from "./steps/lib/import-files";
import { patternReplacer } from "./steps/lib/parse-files/get-substring-to-translate/get-text-substring-to-translate";
import { parseFiles } from "./steps/lib/parse-files/parse-files";
import { translateList } from "./steps/lib/translate/translate-list";
import { TranslateError } from "./steps/store/error";
import { KO } from "./steps/store/locales";
import { fromIndex } from "./steps/utils/from-index";
import { SimpleLogger } from "./steps/utils/simple-logger";

export const debug = () =>
  Effect.gen(function* () {
    yield* Effect.log("DEBUG START");

    const pathToMap = "C:\\Users\\mato\\Desktop\\MpqEditor\\maps\\FBT 1.7.2 KR47.w3x";

    const fileList = yield* importFiles({
      mapPath: pathToMap,
      fileFilter: {
        include: /campaignabilitystrings/i,
      },
    });
    const parsed = yield* parseFiles({ extractedFiles: fileList, locale: KO.literals[0] });

    const idList: string[] = [];
    const textList: string[] = [];

    /*  const DEBUG_ITEM_LIMIT = 100;
    let DEBUG_ITEM_COUNT = 0; */
    for (const [_, item] of parsed) {
      /*  if (DEBUG_ITEM_COUNT > DEBUG_ITEM_LIMIT) break; */
      idList.push(item.id);
      textList.push(item.substring.transformed);
      /*  DEBUG_ITEM_COUNT++; */
    }

    const translateResult = yield* translateList({
      list: textList,
      from: "ko",
      to: "en",
      provider: "google-free",
      options: {
        deepl: {
          apiKey: "621c3fff-e066-49ec-8552-ebcc570a2260:fx",
          context: "일본 만화 영화",
          glossary: "ec539a03-7086-4449-9a9c-033dc6380aba",
        },
      },
    });

    if (textList.length !== translateResult.length)
      return yield* new TranslateError("Translated item count not equal to total text count");

    const translated: TranslatedChunk[] = [];

    for (let index = 0; index < translateResult.length; index++) {
      const chunk = yield* HashMap.get(parsed, fromIndex(idList, index));
      const newChunk: TranslatedChunk = {
        ...chunk,
        substring: {
          ...chunk.substring,
          translated: fromIndex(translateResult, index),
          complete: fromIndex(translateResult, index)
            .replaceAll(...patternReplacer.colorCode.open.to)
            .replaceAll(...patternReplacer.colorCode.close.to)
            .replaceAll(...patternReplacer.newLine.to)
            /** Not allowed, replace with chinese before nextDescription replace */
            .replaceAll(/,/g, "，")
            .replaceAll(...patternReplacer.nextDescription.to)
            /** Not allowed, replace with chinese after all html replacement */
            .replaceAll(/</g, "＜")
            .replaceAll(/>/g, "＞"),
        },
      };
      translated.push(newChunk);
      /*     console.log(newChunk.id, newChunk.substring); */
    }

    yield* applyFiles({ extractedFiles: fileList, translates: translated });

    yield* exportFiles({ files: fileList, pathToMap: pathToMap });

    yield* Effect.log("DEBUG END");
  }).pipe(
    Effect.scoped,
    Effect.provide(
      Layer.mergeAll(Logger.replace(Logger.defaultLogger, SimpleLogger), NodeFileSystem.layer),
    ),
    Logger.withMinimumLogLevel(LogLevel.Debug),
  );
