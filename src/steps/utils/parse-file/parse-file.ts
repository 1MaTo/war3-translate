import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { finished } from "node:stream/promises";

import { Effect, Stream } from "effect";

import { PARSED_DIR, SUBSTRING_PLACEHOLDER } from "../../store/const";
import { ParseError } from "../../store/error";
import {
  addLineToTranslate,
  TranslateStore,
  type ExtractedFileInfo,
  type ParsedFileInfo,
} from "../../store/store";
import { getLineParser } from "./get-line-parser/get-line-parser";

export const parseFile = (
  extractInfo: ExtractedFileInfo,
): Effect.Effect<ParsedFileInfo, ParseError, TranslateStore> =>
  Effect.gen(function* () {
    const storeRef = yield* TranslateStore;

    const newPath = path.join(PARSED_DIR, extractInfo.name);
    const readStream = createReadStream(extractInfo.systemPath);
    const writeStream = createWriteStream(newPath);

    const parseLine = getLineParser({
      extension: extractInfo.extension,
      from: (yield* storeRef.get).from,
    });

    const lineStream = Stream.acquireRelease(
      Effect.sync(
        () => [createInterface({ input: readStream, crlfDelay: Infinity }), writeStream] as const,
      ),
      ([readLineStream, writeStream]) =>
        Effect.promise(async () => {
          readLineStream.close();
          writeStream.end();
          await finished(writeStream);
        }),
    ).pipe(
      Stream.flatMap(([readLineStream]) =>
        Stream.fromAsyncIterable(
          readLineStream,
          (error) => new ParseError(`${extractInfo.name}: failed during file parse`, error),
        ).pipe(Stream.zipWithIndex),
      ),
    );

    const parseMap: Map<number, number> = new Map();

    let linesTotal = 0;
    let linesReplaced = 0;
    yield* Stream.runForEach(lineStream, ([line, lineIndex]) =>
      Effect.gen(function* () {
        const substringToTranslate = parseLine(line);

        linesTotal++;

        if (!substringToTranslate) {
          writeStream.write(`${line}\n`);
          return;
        }

        linesReplaced++;

        writeStream.write(`${line.replace(substringToTranslate, SUBSTRING_PLACEHOLDER)}\n`);
        const index = yield* addLineToTranslate(storeRef, substringToTranslate);
        parseMap.set(lineIndex, index);
      }),
    );

    yield* Effect.logDebug(
      `    ${extractInfo.mapPath}; Parsed: ${linesReplaced} lines; Total: ${linesTotal} lines`,
    );

    return { ...extractInfo, systemPath: newPath, parseMap };
  });
