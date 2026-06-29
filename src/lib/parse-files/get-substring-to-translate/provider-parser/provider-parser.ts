import {
  DeeplProvider,
  GoogleFreeProvider,
  type TranslateProvider,
} from "../../../types/translate-provider";
import type { ProviderStringParser } from "../common";
import { deeplParser } from "./deepl.parser";
import { googleFreeParser } from "./google-free.parser";

export const providerParser: Record<TranslateProvider, ProviderStringParser> = {
  [GoogleFreeProvider.literals[0]]: googleFreeParser,
  [DeeplProvider.literals[0]]: deeplParser,
};
