import { createHash } from "node:crypto";
import path from "node:path";

import { Effect } from "effect";

import { PARSED_DIR, RAW_DIR } from "../../../store/const";
import { ExtensionToTranslate, JASSExtension, StringsExtension } from "../../../store/extensions";
import type { TranslateFromLocale } from "../../../store/locales";
import { processFile } from "../../../utils/process-file";
import type { ExtractedFileInfo } from "../../import-files";
import type { MakeTranslateExtractor, ParsedChunk } from "./common";
import { makeTextTranslateExtractor } from "./get-text-substring-to-translate";

type ParseFileProps = {
  onNewFragment: (data: ParsedChunk) => Effect.Effect<void>;
  locale: TranslateFromLocale;
} & ExtractedFileInfo;

const makeTranslateExtractor: Record<ExtensionToTranslate, MakeTranslateExtractor | (() => null)> =
  {
    [StringsExtension.literals[0]]: makeTextTranslateExtractor,
    [JASSExtension.literals[0]]: () => null,
  };

export const parseFile = ({ onNewFragment, extension, name, locale }: ParseFileProps) =>
  Effect.gen(function* () {
    const extractTranslation = makeTranslateExtractor[extension](locale);
    if (!extractTranslation) {
      yield* Effect.logWarning(`[parseFile] Parse fn not found for "${extension}" extension`);
      return null;
    }

    const fromPath = path.join(RAW_DIR, name);
    const toPath = path.join(PARSED_DIR, name);

    yield* processFile({
      extension,
      fromPath,
      toPath,
      processData: ([chunk]) =>
        Effect.gen(function* () {
          const substring = extractTranslation(chunk);
          if (!substring) return chunk;

          const id = createHash("md5").update(substring.transformed).update(locale).digest("hex");
          const newChunk = chunk.replace(substring.raw, `<translate id="${id}"/>`);

          yield* onNewFragment({
            id,
            chunk: newChunk,
            substring,
          });

          return newChunk;
        }),
    });
  });
