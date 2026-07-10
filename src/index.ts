import { Effect } from "effect";

import type { TranslateLibProps } from "./lib";
import { translateMap } from "./translate";

export type { TranslateLibProps } from "./lib/types/props";
export {
  TranslateFromLocale,
  TranslateToLocale,
  EN,
  KO,
  RU,
  ZH,
  DeeplProvider,
  GoogleFreeProvider,
  TranslateProvider,
} from "./lib";
/** Translate map and return path new file */
export const translate = (props: TranslateLibProps) => Effect.runPromise(translateMap(props));

/* Effect.runPromise(debug()); */
