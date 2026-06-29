import { Schema } from "effect";

import type { TranslateLibProps } from "../types/props";
import type { DeeplProvider } from "../types/translate-provider";

export type TranslateInQueueProps = {
  list: string[];
  options?: ProviderOptions;
} & Pick<TranslateLibProps, "from" | "to" | "provider">;

const DeeplOptions = Schema.Struct({
  apiKey: Schema.String,
  context: Schema.optional(Schema.String),
  glossary: Schema.optional(Schema.String),
});
type DeeplOptions = Schema.Schema.Type<typeof DeeplOptions>;
export type ProviderOptions = { [DeeplProvider.Type]?: DeeplOptions };

export type MakeTranslateApiFn = (options?: ProviderOptions) => TranslateApiFn | null;

type TranslateApiFn = (
  props: Pick<TranslateInQueueProps, "from" | "to" | "list">,
) => Promise<string[]>;
