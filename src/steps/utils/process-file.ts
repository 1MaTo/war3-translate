import { FileSystem } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import type { PlatformError } from "@effect/platform/Error";
import { Chunk, Effect, Option, Stream } from "effect";

import { ExtensionToTranslate, StringsExtension, JASSExtension } from "../store/extensions";

/** Accumulates strings until quote count (ignores escaped quotes) is even */
const accumByEvenQuotes = (self: Stream.Stream<string, PlatformError>) =>
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
          const quoteCount = (bufferAsString.match(/(?<=(?:^|[^\\])(?:\\{2})*)"/g) || []).length;

          if (quoteCount % 2 === 0) {
            return Option.some([Chunk.of(bufferAsString), Chunk.empty<string>()] as const);
          }

          return Option.some([Chunk.empty<string>(), newBuffer] as const);
        }),
      );
    }),
  );

const stringPipeline =
  (processChunk: ProcessChunkFn) => (self: Stream.Stream<Uint8Array, PlatformError>) =>
    self.pipe(
      Stream.decodeText("utf-8"),
      Stream.splitLines,
      Stream.zipWithIndex,
      Stream.mapEffect(processChunk),
      Stream.map((item) => `${item}\r\n`),
      Stream.encodeText,
    );
const jassPipeline =
  (processChunk: ProcessChunkFn) => (self: Stream.Stream<Uint8Array, PlatformError>) =>
    self.pipe(
      Stream.decodeText("utf-8"),
      accumByEvenQuotes,
      Stream.zipWithIndex,
      Stream.mapEffect(processChunk),
      Stream.encodeText,
    );
const processPipeline: Record<
  ExtensionToTranslate,
  (
    processChunk: ProcessChunkFn,
  ) => (self: Stream.Stream<Uint8Array, PlatformError>) => Stream.Stream<Uint8Array, PlatformError>
> = {
  [StringsExtension.literals[0]]: stringPipeline,
  [JASSExtension.literals[0]]: jassPipeline,
};
type ProcessChunkFn = (data: [string, number]) => Effect.Effect<string>;
type ProcessFileProps = {
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
