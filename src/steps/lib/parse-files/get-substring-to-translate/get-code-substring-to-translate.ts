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

const JASSFunctionInfoList: JASSFunctionInfo[] = [
  { name: "CreateQuestBJ", args: [1, 2] },
  { name: "DisplayTimedTextToForce", args: [2] },
  { name: "DisplayTextToPlayer", args: [3] },
  { name: "DzFrameSetText", args: [1] },
  { name: "DisplayTimedTextToPlayer", args: [4] },
  { name: "SaveStr", args: [3] },
];

export const makeCodeTranslateExtractor: MakeTranslateExtractor = ({ locale, provider }) => {
  const localeMatcher = new RegExp(`.*${localeMatch[locale]}.*`, "iu");
  const parser = providerParser[provider].j.encode;
  return (chunk) => {
    const substringList: ExtractedSubstring[] = [];

    for (let index = 0; index < JASSFunctionInfoList.length; index++) {
      const fnInfo = fromIndex(JASSFunctionInfoList, index);

      const args = extractArgsFromJASSFunctions({
        text: chunk,
        argIndexes: fnInfo.args,
        functionName: fnInfo.name,
      });

      if (args.length === 0) continue;

      for (let index = 0; index < args.length; index++) {
        const fnArgsList = fromIndex(args, index);
        for (let index = 0; index < fnArgsList.length; index++) {
          const arg = fromIndex(fnArgsList, index);
          if (!arg) {
            console.warn(
              `[makeCodeTranslateExtractor] Some arg ${index} for function ${fnInfo.name} is undefined`,
            );
            continue;
          }

          const multiString: string[] = [];
          for (const match of arg.matchAll(/"(.*?)"/g)) {
            if (match[1]) multiString.push(match[1]);
          }
          const stringsFromArg = multiString.length > 0 ? multiString : [arg];

          for (let index = 0; index < stringsFromArg.length; index++) {
            const finalString = fromIndex(stringsFromArg, index);

            /** Take item only when there are anything to translate */
            if (!finalString.match(localeMatcher)) continue;

            /** Prevent duplicates, all occurrences will be replaced anyway */
            if (substringList.some((item) => item.raw === finalString)) continue;

            substringList.push({ raw: finalString, transformed: parser(finalString) });
          }
        }
      }
    }

    return substringList;
  };
};
