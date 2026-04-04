import { Data } from "effect";
import { isError } from "effect/Predicate";

type AppError = {
  message?: string;
  originalMessage: string;
};

export class ImportError extends Data.TaggedError("ImportError")<AppError> {
  constructor(message: string, error?: unknown) {
    super({
      message: `[IMPORT] ${message}`,
      originalMessage: isError(error) ? error.message : "unknown",
    });
  }
}

export class ProcessFileError extends Data.TaggedError("ProcessFileError")<AppError> {
  constructor(message: string, error?: unknown) {
    super({
      message: `[PROCESS FILE] ${message}`,
      originalMessage: isError(error) ? error.message : "unknown",
    });
  }
}

export class ParseError extends Data.TaggedError("ParseError")<AppError> {
  constructor(message: string, error?: unknown) {
    super({
      message: `[PARSE] ${message}`,
      originalMessage: isError(error) ? error.message : "unknown",
    });
  }
}

export class ApplyError extends Data.TaggedError("ApplyError")<AppError> {
  constructor(message: string, error?: unknown) {
    super({
      message: `[APPLY] ${message}`,
      originalMessage: isError(error) ? error.message : "unknown",
    });
  }
}

export class StoreError extends Data.TaggedError("StoreError")<AppError> {
  constructor(message: string, error?: unknown) {
    super({
      message: `[STORE] ${message}`,
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
