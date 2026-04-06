import type { Effect } from "effect";

import type { TranslateError } from "../../error";
import type { TranslateState } from "../../store";

export type TranslateApi = (
  props: Pick<TranslateState, "from" | "to"> & { list: string[] },
) => Effect.Effect<string[], TranslateError>;
