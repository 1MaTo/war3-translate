import { Schema } from "effect";

export const GoogleFreeProvider = Schema.Literal("google-free");
export type GoogleFreeProvider = typeof GoogleFreeProvider.Type;

export const DeeplProvider = Schema.Literal("deepl");
export type DeeplProvider = typeof DeeplProvider.Type;

export const TranslateProvider = Schema.Literal(GoogleFreeProvider.Type, DeeplProvider.Type);
export type TranslateProvider = typeof TranslateProvider.Type;
