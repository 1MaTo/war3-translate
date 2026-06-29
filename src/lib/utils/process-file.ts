import { FileSystem } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import type { PlatformError } from "@effect/platform/Error";
import { Chunk, Effect, Option, Stream } from "effect";

import { JASSExtension, StringsExtension, type ExtensionToTranslate } from "../types/extensions";
import type { ApplyError } from "./error";

const isIncompleteFunctionCall = (chunk: string) => {
  const callRegex = new RegExp(`[A-Za-z_]w*(?=\\s*\\()`, "g");

  while (callRegex.exec(chunk) !== null) {
    let lastIndex = callRegex.lastIndex;
    while (chunk[lastIndex] !== "(" && lastIndex < chunk.length) lastIndex++;
    if (chunk[lastIndex] !== "(") continue;

    let depth = 0;
    let inString = false;
    let complete = false;
    let index = lastIndex;

    for (; index < chunk.length; index++) {
      const char = chunk[index];
      if (inString) {
        if (char === "\\") {
          index++;
          continue;
        }
        if (char === '"') inString = false;
        continue;
      }
      if (char === '"') {
        inString = true;
        continue;
      }
      if (char === "(") {
        depth++;
        continue;
      }
      if (char === ")") {
        depth--;
        if (depth === 0) {
          complete = true;
          index++;
          break;
        }
      }
    }

    /** If any function found but not complete, we cannot process chunk */
    if (!complete) {
      return true;
    }

    callRegex.lastIndex = Math.max(callRegex.lastIndex, complete ? index : chunk.length);
  }

  return false;
};

/** Accumulates strings in code to detect functions that contain user strings */
const accumCodeChunk = (self: Stream.Stream<string, PlatformError>) =>
  Stream.unwrapScoped(
    Effect.gen(function* () {
      const getNextChunk = Effect.option(yield* Stream.toPull(self));

      return Stream.unfoldChunkEffect(Chunk.empty<string>(), (buffer) =>
        Effect.gen(function* () {
          const newChunk = Option.getOrNull(yield* getNextChunk);

          /** Stream end, if anything left, pass it */
          if (!newChunk) {
            if (Chunk.isEmpty(buffer)) {
              return Option.none();
            }

            return Option.some([Chunk.of(Chunk.join(buffer, "")), Chunk.empty<string>()] as const);
          }

          const newBuffer = Chunk.appendAll(buffer, newChunk);
          const bufferAsString = Chunk.join(newBuffer, "");
          const splitByLastNewLine = (chunk: string): [string, string] => {
            const lastLineIndex = chunk.lastIndexOf("\n");
            if (lastLineIndex === -1) return [chunk, ""];
            return [chunk.slice(0, lastLineIndex + 1), chunk.slice(lastLineIndex + 1)];
          };
          const [chunkBeforeLastLine, other] = splitByLastNewLine(bufferAsString);
          const isCanProcessChunk = !isIncompleteFunctionCall(chunkBeforeLastLine);

          if (isCanProcessChunk) {
            return Option.some([
              Chunk.of(chunkBeforeLastLine),
              other ? Chunk.of(other) : Chunk.empty<string>(),
            ] as const);
          }

          return Option.some([Chunk.empty<string>(), newBuffer] as const);
        }),
      );
    }),
  );

const stringPipeline =
  (processChunk: ProcessChunkFn) => (self: Stream.Stream<Uint8Array, PlatformError | ApplyError>) =>
    self.pipe(
      Stream.decodeText("utf-8"),
      Stream.splitLines,
      Stream.zipWithIndex,
      Stream.mapEffect(processChunk),
      Stream.map((item) => `${item}\r\n`),
      Stream.encodeText,
    );

const jassPipeline =
  (processChunk: ProcessChunkFn) =>
  (self: Stream.Stream<Uint8Array, PlatformError | ApplyError | any>) =>
    self.pipe(
      Stream.decodeText("utf-8"),
      accumCodeChunk,
      Stream.zipWithIndex,
      Stream.mapEffect(processChunk),
      Stream.encodeText,
    );
const processPipeline: Record<
  ExtensionToTranslate,
  (
    processChunk: ProcessChunkFn,
  ) => (
    self: Stream.Stream<Uint8Array, PlatformError | ApplyError>,
  ) => Stream.Stream<Uint8Array, PlatformError | ApplyError>
> = {
  [StringsExtension.literals[0]]: stringPipeline,
  [JASSExtension.literals[0]]: jassPipeline,
};
type ProcessChunkFn = (data: [string, number]) => Effect.Effect<string, ApplyError>;
export type ProcessFileProps = {
  extension: ExtensionToTranslate;
  fromPath: string;
  toPath: string;
  /** Do things and return string that will be written to file */
  processData: ProcessChunkFn;
};

export const processFile = ({ extension, processData, fromPath, toPath }: ProcessFileProps) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const pipeline = processPipeline[extension];
    const processedStream = fs.stream(fromPath).pipe(pipeline(processData));

    yield* Stream.run(processedStream, fs.sink(toPath));
  }).pipe(Effect.provide(NodeContext.layer));
