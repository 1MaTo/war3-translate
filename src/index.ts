/* import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";

import { Effect } from "effect";

import { RAW_DIR, TRANSLATED_DIR } from "#shared/const.ts";
import { getLineParser } from "#shared/get-line-parser-config.ts";
import { ExtensionToTranslate } from "#shared/translate-config.ts";

import { translate } from "./translate";

const program = Effect.gen(function* () {
  const result = yield* translate({
    pathToMap: "C:\\Users\\mato\\Desktop\\MpqEditor\\maps\\translate.w3x",
    pathToListFile: "C:\\Users\\mato\\Desktop\\MpqEditor\\listfile\\(listfile)",
  });

  console.log(result);
});


const debug = Effect.tryPromise(async () => {
  const propertyList = new Set<string>();
  for (const filename of ["CampaignAbilityStrings.txt"]) {
    const readStream = createReadStream(path.join(RAW_DIR, filename));
    const writeStream = createWriteStream(path.join(TRANSLATED_DIR, filename));

    const parseLine = getLineParser({ extension: "txt", fromLanguage: "ko" });
    for await (const line of createInterface({ input: readStream, crlfDelay: Infinity })) {
      const result = parseLine(line);
      if (!result) {
        writeStream.write(`${line}\n`);
      }
    }

    writeStream.end();
  }

  console.dir(propertyList, { maxArrayLength: null });
  console.log("done");
});

Effect.runPromise(debug);
 */

import { Effect } from "effect";

import { translateMap } from "./translate";

Effect.runPromise(
  translateMap({
    pathToMap: "C:\\Users\\mato\\Desktop\\MpqEditor\\maps\\fbt_unprotected_list_file.w3x",
    fromLanguage: "ko",
  }),
);
