import { Effect } from "effect";
import { enableMapSet } from "immer";

import type { TranslateProps } from "./steps/store/store";
import { translateMap } from "./translate";

enableMapSet();

export { TranslateFromLocale, TranslateToLocale, EN, KO, RU, ZH } from "./steps/store/locales";
export { TranslateProvider, GoogleFreeProvider } from "./steps/store/translate-provider";
export { StringsFileProperties } from "./steps/utils/get-line-parser/strings-file-properties";

/** Translate map and return path new file */
export const translate = (props: TranslateProps) => Effect.runPromise(translateMap(props));
