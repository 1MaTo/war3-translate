import { Schema } from "effect";

export const GoogleFreeProvider = Schema.Literal("google-free");
export type GoogleFreeProvider = typeof GoogleFreeProvider.Type;

export const TranslateProvider = Schema.Literal(GoogleFreeProvider.Type);
export type TranslateProvider = typeof TranslateProvider.Type;
