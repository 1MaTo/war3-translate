import { ExtensionToTranslate, StringsExtension, JASSExtension } from "../../../store/extensions";
import { TranslateFromLocale, KO, ZH } from "../../../store/locales";
import type { TranslateProps } from "../../../store/store";
import { StringsFileProperties } from "./strings-file-properties";

const localeMatch: Record<TranslateFromLocale, string> = {
  [KO.literals[0]]: "\\p{Script=Hangul}",
  [ZH.literals[0]]: "[\u4E00-\u9FFF]",
} as const;

type Props = {
  extension: ExtensionToTranslate;
} & Pick<TranslateProps, "from">;

/** Return function than takes line and return substring for translation or null if nothing to translate */
export const getLineParser = ({ extension, from }: Props): ((line: string) => string | null) => {
  switch (extension) {
    case StringsExtension.literals[0]: {
      const propertyList = StringsFileProperties.literals;

      const lineMatch = new RegExp(
        `^(?:${propertyList.join("|")})=(.*${localeMatch[from]}+.*)$`,
        "iu",
      );
      return (line: string) => {
        const match = line.match(lineMatch);
        if (!match || !match[1]) return null;
        return match[1];
      };
    }

    case JASSExtension.literals[0]: {
      return () => null;
    }

    default:
      extension satisfies never;
      throw new Error("unknown extension");
  }
};
