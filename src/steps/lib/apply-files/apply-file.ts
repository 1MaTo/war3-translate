import path from "node:path";

import { Effect } from "effect";

import { PARSED_DIR, TRANSLATED_DIR } from "../../store/const";
import type { ApplyError } from "../../store/error";
import { processFile } from "../../utils/process-file";
import type { ExtractedFileInfo } from "../import-files";

export type OnApplyTranslation = (data: ApplyChunk) => Effect.Effect<string, ApplyError>;

type ApplyFileProps = {
  onApplyTranslation: OnApplyTranslation;
} & ExtractedFileInfo;

type ApplyTag = {
  id: string;
  /** Full tag string to use for replace */
  full: string;
};

export type ApplyChunk = {
  chunk: string;
  tags: ApplyTag[];
};

const extractTranslateTags = (chunk: string): ApplyChunk | null => {
  const tags: ApplyTag[] = [];
  for (const match of chunk.matchAll(/<translate id="(.*?)"\/>/gi)) {
    tags.push({ id: match[1] as string, full: match[0] as string });
  }

  if (tags.length === 0) return null;

  return { chunk, tags };
};

export const applyFile = ({ onApplyTranslation, extension, name }: ApplyFileProps) =>
  processFile({
    extension,
    fromPath: path.join(PARSED_DIR, name),
    toPath: path.join(TRANSLATED_DIR, name),
    processData: ([chunk]) =>
      Effect.gen(function* () {
        const translateTags = extractTranslateTags(chunk);
        if (!translateTags) return chunk;
        return yield* onApplyTranslation(translateTags);
      }),
  });
