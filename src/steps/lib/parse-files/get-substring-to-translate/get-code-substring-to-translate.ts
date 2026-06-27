import {
  DeeplProvider,
  GoogleFreeProvider,
  type TranslateProvider,
} from "../../../store/translate-provider";
import { fromIndex } from "../../../utils/from-index";
import {
  localeMatch,
  type ExtractedSubstring,
  type MakeTranslateExtractor,
  type ProviderStringParser,
} from "./common";
import { extractArgsFromJASSFunctions } from "./jass-function-args-extractor";
import { deeplParser } from "./provider-parser/deepl.parser";
import { googleFreeParser } from "./provider-parser/google-free.parser";

export const providerParser: Record<TranslateProvider, ProviderStringParser> = {
  [GoogleFreeProvider.literals[0]]: googleFreeParser,
  [DeeplProvider.literals[0]]: deeplParser,
};

type JASSFunctionInfo = {
  name: string;
  args: number[];
};

const JASSFunctionInfoList: JASSFunctionInfo[] = [{ name: "CreateQuestBJ", args: [1, 2] }];

export const makeCodeTranslateExtractor: MakeTranslateExtractor = (locale, _) => {
  const localeMatcher = new RegExp(`.*${localeMatch[locale]}.*`, "iu");
  return (chunk) => {
    const substringList: ExtractedSubstring[] = [];

    for (let index = 0; index < JASSFunctionInfoList.length; index++) {
      const fnInfo = fromIndex(JASSFunctionInfoList, index);

      const args = extractArgsFromJASSFunctions({
        text: chunk,
        argIndexes: fnInfo.args,
        functionName: fnInfo.name,
      });

      if (args.length === 0) return null;

      for (let index = 0; index < args.length; index++) {
        const fnArgsList = fromIndex(args, index);
        for (let index = 0; index < fnArgsList.length; index++) {
          const arg = fromIndex(fnArgsList, index);
          if (!arg) {
            console.warn(
              `[makeCodeTranslateExtractor] Some arg ${index} for function ${"CreateQuestBJ"} is undefined`,
            );
            continue;
          }

          /** Take item only when there are anything to translate */
          if (!arg.match(localeMatcher)) continue;

          /** Prevent duplicates, all occurrences will be replaced anyway */
          if (substringList.some((item) => item.raw === arg)) continue;

          substringList.push({ raw: arg, transformed: arg });
        }
      }
    }

    return substringList;
  };
};
