import { FileSystem } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { Effect, Stream } from "effect";

type ProcessFileProps<E, R> = {
  fromPath: string;
  toPath: string;
  /** Do things to line and return string that will be written to file */
  processLine: (data: [string, number]) => Effect.Effect<string, E, R>;
};
export const processFileByLine = <E, R>({
  processLine,
  fromPath,
  toPath,
}: ProcessFileProps<E, R>) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const processedStream = fs
      .stream(fromPath)
      .pipe(
        Stream.decodeText("utf-8"),
        Stream.splitLines,
        Stream.zipWithIndex,
        Stream.mapEffect(processLine),
        Stream.encodeText,
      );

    yield* Stream.run(processedStream, fs.sink(toPath));

    /*   yield* _(Effect.log("File copy complete!")); */
    /*  const readStream = createReadStream(fromPath);
  const writeStream = createWriteStream(toPath);
 
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
        (error) =>
          new ProcessFileError(`Failed processing files: ${fromPath} --> ${toPath}`, error),
      ).pipe(Stream.zipWithIndex),
    ),
  );

  yield* Stream.runForEach(lineStream, (data) => processLine(data,) ); */
  }).pipe(Effect.provide(NodeContext.layer), Effect.asVoid);
