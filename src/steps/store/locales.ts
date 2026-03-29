import { Schema } from "effect";

/** List of all supported locales */

export const KO = Schema.Literal("ko");
export type KO = typeof KO.Type;

export const ZH = Schema.Literal("zh");
export type ZH = typeof ZH.Type;

export const RU = Schema.Literal("ru");
export type RU = typeof RU.Type;

export const EN = Schema.Literal("en");
export type EN = typeof EN.Type;

export const TranslateFromLocale = Schema.Literal(KO.Type, ZH.Type);
export type TranslateFromLocale = typeof TranslateFromLocale.Type;

export const TranslateToLocale = Schema.Literal(EN.Type, RU.Type);
export type TranslateToLocale = typeof TranslateToLocale.Type;
