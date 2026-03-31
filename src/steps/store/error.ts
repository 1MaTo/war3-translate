import { Data } from "effect";
import { isError } from "effect/Predicate";

type AppError = {
  message?: string;
  originalMessage: string;
};

export class ExtractError extends Data.TaggedError("ExtractError")<AppError> {
  constructor(message: string, error?: unknown) {
    super({
      message: message,
      originalMessage: isError(error) ? error.message : "unknown",
    });
  }
}

export class ParseError extends Data.TaggedError("ParseError")<AppError> {
  constructor(message: string, error?: unknown) {
    super({
      message: message,
      originalMessage: isError(error) ? error.message : "unknown",
    });
  }
}

export class TranslateError extends Data.TaggedError("TranslateError")<AppError> {
  constructor(message: string, error?: unknown) {
    super({
      message: message,
      originalMessage: isError(error) ? error.message : "unknown",
    });
  }
}

export class CacheError extends Data.TaggedError("CacheError")<AppError> {
  constructor(message: string, error?: unknown) {
    super({
      message: message,
      originalMessage: isError(error) ? error.message : "unknown",
    });
  }
}
