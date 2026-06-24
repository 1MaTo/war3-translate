import { mkdir } from "node:fs/promises";

import { Effect } from "effect";

import { PARSED_DIR } from "../store/const";
import type { ExtractedFileInfo } from "./import-files";

// const parseFile = (fileInfo: ExtractedFileInfo) =>
//   Effect.gen(function* () {
//     /*   const storeRef = yield* TranslateStore;
//     const { fileMap, from, to, provider } = yield* (yield* TranslateStore).get; */

//     const oldPath = path.join(RAW_DIR, fileInfo.name);
//     const newPath = path.join(PARSED_DIR, fileInfo.name);

//     let fragmentCount = 0;

//     const { parse, replaceByHash } = getFileChunkUtils({
//       extension: fileInfo.extension,
//       from: from,
//     });

//     const preHash = createHash("md5").update(from).update(to).update(provider).digest();

//     yield* processFile({
//       extension: fileInfo.extension,
//       fromPath: oldPath,
//       toPath: newPath,
//       processData: ([chunk, index]) =>
//         Effect.gen(function* () {
//           const fragments = parse(chunk);
//           if (!fragments) return chunk;

//           fragmentCount += fragments.length;

//           let result = chunk;
//           for (const fragment of fragments) {
//             const encodedFragment = warcraftString[fileInfo.extension].encode({
//               value: fragment,
//               from: from,
//               to: to,
//             });

//             const fragmentHash = createHash("md5")
//               .update(preHash)
//               .update(encodedFragment)
//               .digest("hex");

//             yield* addFragment(storeRef, {
//               fileName: fileInfo.name,
//               fragment: encodedFragment,
//               hash: fragmentHash,
//               lineIndex: index,
//             });

//             result = replaceByHash({ text: result, fragment, hash: fragmentHash });
//           }

//           return result;
//         }),
//     });

//     if (fragmentCount > 0) {
//       yield* Effect.logDebug(`    ${fileInfo.mapPath}`);
//       yield* Effect.logDebug(`        ${fragmentCount} fragments`);
//     } else {
//       yield* removeImportedFile(storeRef, name);
//       yield* Effect.promise(() => rm(oldPath, { force: true }));
//       yield* Effect.promise(() => rm(newPath, { force: true }));
//     }
//   });

export type ParseFilesProps = {
  extractedFiles: ExtractedFileInfo[];
};

export const parseFiles = (_: ParseFilesProps) =>
  Effect.gen(function* () {
    yield* Effect.promise(() => mkdir(PARSED_DIR, { recursive: true }));

    /* const parseFileTaskList = Array.from(fileMap.keys()).map(parseFile); */

    /* return yield* Effect.all(parseFileTaskList, { concurrency: "unbounded" }); */
  });
