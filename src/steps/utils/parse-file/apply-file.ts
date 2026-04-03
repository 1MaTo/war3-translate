import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { finished } from "node:stream/promises";

import { Effect, Stream } from "effect";

import { SUBSTRING_PLACEHOLDER, TRANSLATED_DIR } from "../../store/const";
import { ParseError, TranslateError } from "../../store/error";
import { TranslateStore, type ParsedFileInfo, type TranslatedFileInfo } from "../../store/store";
import { warcraftString } from "../warcraft-string-parser";

export const applyToFile = (
  info: ParsedFileInfo,
): Effect.Effect<TranslatedFileInfo, ParseError, TranslateStore> =>
  Effect.gen(function* () {
    const storeRef = yield* TranslateStore;
    const { from, to, translatedList } = yield* storeRef.get;

    const newPath = path.join(TRANSLATED_DIR, info.name);
    const readStream = createReadStream(info.systemPath);
    const writeStream = createWriteStream(newPath);

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
          (error) => new ParseError(`${info.name}: failed apply translation`, error),
        ).pipe(Stream.zipWithIndex),
      ),
    );

    yield* Stream.runForEach(lineStream, ([line, lineIndex]) =>
      Effect.sync(() => {
        const translationIndex = info.parseMap.get(lineIndex);
        if (translationIndex === undefined) {
          writeStream.write(`${line}\n`);
          return;
        }

        const translatedString = translatedList[translationIndex];
        if (!translatedString)
          return Effect.fail(
            new TranslateError(`File: ${info.name}, translation for line ${lineIndex} not found`),
          );

        writeStream.write(
          `${line.replace(SUBSTRING_PLACEHOLDER, warcraftString[info.extension].decode({ value: translatedString, from, to }))}\n`,
        );
      }),
    );

    return { ...info, systemPath: newPath };
  });
