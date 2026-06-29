import { createHash } from "node:crypto";
import path from "node:path";

import { Effect } from "effect";

import { PARSED_DIR, RAW_DIR } from "../../const";
import type { ExtractedFileInfo } from "../../import-files";
import { ExtensionToTranslate, JASSExtension, StringsExtension } from "../../types/extensions";
import type { TranslateFromLocale } from "../../types/locales";
import type { TranslateProvider } from "../../types/translate-provider";
import { fromIndex } from "../../utils/from-index";
import { processFile } from "../../utils/process-file";
import type { MakeTranslateExtractor, ParsedSubstring } from "./common";
import { makeCodeTranslateExtractor } from "./get-code-substring-to-translate";
import { makeTextTranslateExtractor } from "./get-text-substring-to-translate";

type ParseFileProps = {
  onNewFragment: (data: ParsedSubstring) => Effect.Effect<void>;
  locale: TranslateFromLocale;
  provider: TranslateProvider;
} & ExtractedFileInfo;

const makeTranslateExtractor: Record<ExtensionToTranslate, MakeTranslateExtractor | (() => null)> =
  {
    [StringsExtension.literals[0]]: makeTextTranslateExtractor,
    [JASSExtension.literals[0]]: makeCodeTranslateExtractor,
  };

export const parseFile = ({ onNewFragment, extension, name, locale, provider }: ParseFileProps) =>
  Effect.gen(function* () {
    const extractTranslation = makeTranslateExtractor[extension]({ locale, provider });
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
          const substringList = extractTranslation(chunk);
          if (!substringList) return chunk;

          let newChunk = chunk;

          for (let index = 0; index < substringList.length; index++) {
            const substring = fromIndex(substringList, index);
            const id = createHash("md5").update(substring.transformed).update(locale).digest("hex");

            switch (extension) {
              case StringsExtension.literals[0]:
                newChunk = newChunk.replaceAll(substring.raw, `<translate id="${id}"/>`);
                break;

              case JASSExtension.literals[0]:
                newChunk = newChunk.replaceAll(`"${substring.raw}"`, `"<translate id="${id}"/>"`);
                break;

              default:
                extension satisfies never;
                break;
            }

            yield* onNewFragment({ id, chunk: newChunk, extension, ...substring });
          }

          return newChunk;
        }),
    });
  });
