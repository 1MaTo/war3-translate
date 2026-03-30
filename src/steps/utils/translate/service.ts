import { Context, Effect } from "effect";

import type { TranslateError } from "../../store/error";
import type { TranslateFromLocale, TranslateToLocale } from "../../store/locales";

export type TranslateServiceApi = {
  translate: (props: {
    /** List of strings to translate */
    list: string[];
    from: TranslateFromLocale;
    to: TranslateToLocale;
  }) => Effect.Effect<string[], TranslateError>;
};

export class TranslateService extends Context.Tag("TranslateServiceService")<
  TranslateService,
  TranslateServiceApi
>() {}
