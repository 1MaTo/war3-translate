import {
  DeeplProvider,
  GoogleFreeProvider,
  type TranslateProvider,
} from "../../translate-provider";
import { deepl } from "./deepl/deepl-api";
import { googleFree } from "./google-free/google-free-api";
import type { TranslateApi } from "./types";

export const translateApi: Record<TranslateProvider, TranslateApi> = {
  [GoogleFreeProvider.literals[0]]: googleFree,
  [DeeplProvider.literals[0]]: deepl,
} as const;
