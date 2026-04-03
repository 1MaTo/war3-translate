import { Schema } from "effect";

export const GoogleFreeProvider = Schema.Literal("google-free");
export type GoogleFreeProvider = typeof GoogleFreeProvider.Type;
export type TranslateProvider = GoogleFreeProvider;
