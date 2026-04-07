import { Effect } from "effect";
import { enableMapSet } from "immer";

import type { TranslateProps } from "./steps/store/store";
import { translateMap } from "./translate";

enableMapSet();

/* {
      pathToMap: "M:\\game\\warcraft\\Warcraft_1.28\\Maps\\Download\\FBT 1.7.2 Re46fix3.w3x",
      from: "ko",
      to: "en",
    } */

export { TranslateFromLocale, TranslateToLocale, EN, KO, RU, ZH } from "./steps/store/locales";
export { TranslateProvider, GoogleFreeProvider } from "./steps/store/translate-provider";

/** Translate map and return path new file */
export const translate = (props: TranslateProps) => Effect.runPromise(translateMap(props));
