import { mkdir } from "node:fs/promises";

import { Effect } from "effect";

import { TRANSLATED_DIR } from "../../store/const";
import { ApplyError } from "../../store/error";
import { fromIndex } from "../../utils/from-index";
import type { ExtractedFileInfo } from "../import-files";
import type {
  ParsedChunk,
  ParsedSubstring,
} from "../parse-files/get-substring-to-translate/common";
import { applyFile, type ApplyChunk, type OnApplyTranslation } from "./apply-file";

export type TranslatedChunk = Omit<ParsedChunk, "substring"> & {
  substring: ParsedSubstring & { translated: string; complete: string };
};

export type ApplyFilesProps = {
  extractedFiles: ExtractedFileInfo[];
  translates: TranslatedChunk[];
};

export const applyFiles = ({ extractedFiles, translates }: ApplyFilesProps) =>
  Effect.gen(function* () {
    yield* Effect.promise(() => mkdir(TRANSLATED_DIR, { recursive: true }));

    const onApplyTranslation: OnApplyTranslation = (data: ApplyChunk) =>
      Effect.gen(function* () {
        const newChunk = data.chunk;
        for (let index = 0; index < data.tags.length; index++) {
          const tag = fromIndex(data.tags, index);
          const translation = translates.find((item) => item.id === tag.id);

          if (!translation)
            return yield* new ApplyError(`Translation not found for fragment ${tag.full}`);

          newChunk.replace(tag.full, translation?.substring.translated);
        }
        return newChunk;
      });

    const applyFileTaskList = extractedFiles.map((fileInfo) =>
      applyFile({ ...fileInfo, onApplyTranslation }),
    );

    yield* Effect.all(applyFileTaskList, { concurrency: "unbounded" });
  });
