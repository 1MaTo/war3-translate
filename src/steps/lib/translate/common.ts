import { Schema } from "effect";

import type { TranslateProps } from "../../store/store";
import type { DeeplProvider } from "../../store/translate-provider";

export type TranslateInQueueProps = {
  list: string[];
  maxCharsPerRequest?: number;
  delay?: number;
  options?: ProviderOptions;
} & Pick<TranslateProps, "from" | "to" | "provider">;

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
