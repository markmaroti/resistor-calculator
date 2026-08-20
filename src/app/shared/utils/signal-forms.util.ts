import { ValidationError } from '@angular/forms/signals';

/** Maps a `{ kind, code }` validator result to a Signal Forms `ValidationError`, or null if valid. */
export function toValidationError<Code extends string>(
  result: { kind: string; code: Code } | null,
  getMessage: (code: Code) => string,
): ValidationError | null {
  if (!result) {
    return null;
  }

  return { kind: result.kind, message: getMessage(result.code) };
}

/** Treats a field value as empty if it's unset or contains only whitespace. */
export function isBlank(value: string): boolean {
  return !value || value.trim() === '';
}
