import { Schema } from "effect";

/** Warcraft 3 script file, where might be inline strings for translations */
export const JASSExtension = Schema.Literal("j");
export type JASSExtension = typeof JASSExtension.Type;

/** Usually text files that contain structure like <Property>=<String> that can be translated */
export const StringsExtension = Schema.Literal("txt");
export type StringsExtension = typeof StringsExtension.Type;

/** List of extensions that might have strings to translate */
export const ExtensionToTranslate = Schema.Literal(
  JASSExtension.literals[0],
  StringsExtension.literals[0],
);
export type ExtensionToTranslate = typeof ExtensionToTranslate.Type;
