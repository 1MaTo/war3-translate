import { ExtensionToTranslate, StringsExtension, JASSExtension } from "../../store/extensions";
import { TranslateFromLocale, KO, ZH, TranslateToLocale } from "../../store/locales";
import type { ParsedFile, TranslateProps, TranslationDictionary } from "../../store/store";
import { fromIndex } from "../from-index";
import { warcraftString } from "../warcraft-string-parser";
import { StringsFileProperties } from "./strings-file-properties";

export const localeMatch: Record<TranslateFromLocale, string> = {
  [KO.literals[0]]: "\\p{Script=Hangul}",
  [ZH.literals[0]]: "[\u4E00-\u9FFF]",
} as const;

type Props = {
  extension: ExtensionToTranslate;
} & Pick<TranslateProps, "from" | "propertiesToExclude">;

type ChunkParser = (chunk: string) => string[] | null;

/** Replace `fragment` in `line` by `hash` */
type ByHashReplacer = (props: { text: string; fragment: string; hash: string }) => string;

type ByTranslationReplacer = (props: {
  info: ParsedFile;
  dictionary: TranslationDictionary;
  to: TranslateToLocale;
}) => (data: [chunk: string, index: number]) => string;

type FileChunkUtils = {
  parse: ChunkParser;
  replaceByHash: ByHashReplacer;
  getTranslationReplacer: ByTranslationReplacer;
};

/** Return function than takes line and return substring for translation or null if nothing to translate
 * each entry of list guaranteed to be unique
 */
export const getFileChunkUtils = ({
  extension,
  from,
  propertiesToExclude,
}: Props): FileChunkUtils => {
  switch (extension) {
    case StringsExtension.literals[0]: {
      const propertyList =
        propertiesToExclude && propertiesToExclude.length
          ? StringsFileProperties.literals.filter((item) => !propertiesToExclude.includes(item))
          : StringsFileProperties.literals;

      const lineMatch = new RegExp(
        `^(?:${propertyList.join("|")})=(.*${localeMatch[from]}+.*)$`,
        "iu",
      );
      return {
        parse: (line: string) => {
          const match = line.match(lineMatch);
          if (!match || !match[1]) return null;
          return [match[1]];
        },
        replaceByHash: ({ text, fragment, hash }) => text.replaceAll(fragment, hash),
        getTranslationReplacer:
          ({ info, dictionary, to }) =>
          ([chunk, index]) => {
            const lineInfo = info.lineMap.get(index);
            if (!lineInfo) return chunk;

            let result = chunk;
            for (const fragment of lineInfo) {
              result = result.replaceAll(
                fragment.hash,
                warcraftString[info.extension].decode({
                  value: fromIndex(dictionary.to, fragment.dictionaryIndex),
                  from,
                  to,
                }),
              );
            }

            return result;
          },
      };
    }

    case JASSExtension.literals[0]: {
      const chunkMatch = new RegExp(
        `(?<=(?:^|[^\\\\])(?:\\\\{2})*)"((?:\\\\.|[^"\\\\])*?${localeMatch[from]}(?:\\\\.|[^"\\\\])*?)"`,
        "guis",
      );

      return {
        parse: (chunk: string) => {
          const match = Array.from(chunk.matchAll(chunkMatch));
          if (match.length === 0) return null;

          return match.reduce<string[]>((prev, item) => {
            const fragment = fromIndex(item, 1);
            if (prev.includes(fragment)) return prev;
            return [...prev, fragment];
          }, []);
        },

        replaceByHash: ({ text, fragment, hash }) => {
          return text.replace(new RegExp(`"${RegExp.escape(fragment)}"`, "guis"), `"${hash}"`);
        },

        getTranslationReplacer: ({ info, dictionary, to }) => {
          const hashToTranslation = new Map<string, string>();
          for (const fragment of Array.from(info.lineMap.values()).flat()) {
            if (hashToTranslation.has(fragment.hash)) continue;
            hashToTranslation.set(
              fragment.hash,
              warcraftString[info.extension].decode({
                value: fromIndex(dictionary.to, fragment.dictionaryIndex),
                from,
                to,
              }),
            );
          }
          return ([chunk]) => {
            let result = chunk;
            const chunkHashList = new Set<string>(chunk.match(/[0-9a-f]{32}/gi));

            for (const hash of chunkHashList) {
              const translation = hashToTranslation.get(hash);

              if (!translation) continue;

              result = result.replaceAll(hash, translation);
            }

            return result;
          };
        },
      };
    }

    default:
      extension satisfies never;
      throw new Error("unknown extension");
  }
};
