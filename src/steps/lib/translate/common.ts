import { Schema } from "effect";

import type { DeeplProvider } from "../../store/translate-provider";
import type { TranslateLibProps } from "../props";

export type TranslateInQueueProps = {
  list: string[];
  options?: ProviderOptions;
} & Pick<TranslateLibProps, "from" | "to" | "provider">;

export const DeeplOptions = Schema.Struct({
  apiKey: Schema.String,
  context: Schema.optional(Schema.String),
  glossary: Schema.optional(Schema.String),
});
export type DeeplOptions = Schema.Schema.Type<typeof DeeplOptions>;
export type ProviderOptions = { [DeeplProvider.Type]?: DeeplOptions };

export type MakeTranslateApiFn = (options?: ProviderOptions) => TranslateApiFn | null;

export type TranslateApiFn = (
  props: Pick<TranslateInQueueProps, "from" | "to" | "list">,
) => Promise<string[]>;
