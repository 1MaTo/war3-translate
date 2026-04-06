import { GoogleFreeProvider, type TranslateProvider } from "../../translate-provider";
import { googleFree } from "./google-free/google-free-api";
import type { TranslateApi } from "./types";

export const translateApi: Record<TranslateProvider, TranslateApi> = {
  [GoogleFreeProvider.literals[0]]: googleFree,
};
