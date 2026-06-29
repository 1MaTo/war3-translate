import type { TranslateFromLocale } from "../../types/locales";
import { fromIndex } from "../../utils/from-index";
import { localeMatch, type ExtractedSubstring, type MakeTranslateExtractor } from "./common";
import { extractArgsFromJASSFunctions } from "./jass-function-args-extractor";
import { providerParser } from "./provider-parser/provider-parser";

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
  { name: "QuestMessageBJ", args: [2] },
  { name: "TransmissionFromUnitTypeWithNameBJ", args: [3, 6] },
  { name: "DisplayTextToForce", args: [1] },
  { name: "CustomDefeatBJ", args: [1] },
  { name: "DialogSetMessage", args: [1] },
  { name: "CreateTextTagUnitBJ", args: [0] },
  { name: "DialogAddButton", args: [1] },
  { name: "MultiboardSetItemValue", args: [1] },
  { name: "MultiboardSetTitleText", args: [1] },
  { name: "SetMapName", args: [0] },
  { name: "Ping_Fire", args: [7] },
  { name: "Ping_Chat", args: [1] },
  { name: "Music", args: [0] },
];

const customExpressionsMatchers = [
  (
    chunk: string,
    locale: TranslateFromLocale,
    parser: (value: string) => string,
  ): ExtractedSubstring[] => {
    const result: ExtractedSubstring[] = [];
    for (const match of chunk.matchAll(
      new RegExp(`set udg_s="(.*?${localeMatch[locale]}.*?)"`, "giu"),
    )) {
      const substring = match[1] as string;
      result.push({ raw: substring, transformed: parser(substring) });
    }
    return result;
  },
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
          if (!arg) continue;
          const fixedArg = arg.replaceAll('\\"', "&quot;");
          const multiString: string[] = [];
          for (const match of fixedArg.matchAll(/"(.*?)"/g)) {
            if (match[1]) multiString.push(match[1]);
          }
          const stringsFromArg = multiString.length > 0 ? multiString : [fixedArg];

          for (let index = 0; index < stringsFromArg.length; index++) {
            const finalString = fromIndex(stringsFromArg, index);

            /** Take item only when there are anything to translate */
            if (!finalString.match(localeMatcher)) continue;

            substringList.push({
              raw: finalString.replaceAll("&quot;", '\\"'),
              transformed: parser(finalString),
            });
          }
        }
      }
    }

    for (let index = 0; index < customExpressionsMatchers.length; index++) {
      const expressionMatcher = fromIndex(customExpressionsMatchers, index);
      const newItems = expressionMatcher(chunk, locale, parser);
      substringList.push(...newItems);
    }

    const checkSet = new Set<string>();
    const filteredSubstringList: ExtractedSubstring[] = [];
    for (let index = 0; index < substringList.length; index++) {
      const item = fromIndex(substringList, index);
      if (checkSet.has(item.raw)) continue;

      checkSet.add(item.raw);
      filteredSubstringList.push(item);
    }

    return filteredSubstringList;
  };
};
