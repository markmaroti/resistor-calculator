import { FieldTree, ValidationError } from '@angular/forms/signals';

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

/**
 * Returns the first error message from `fieldsInPriorityOrder`, honoring that order — unlike
 * `FieldTree.errorSummary()`, which sorts by bound DOM element position (or child-registration
 * order when nothing is rendered) and can silently diverge from a field's intended priority.
 */
export function firstFieldErrorMessageInPriorityOrder(
  fieldsInPriorityOrder: readonly FieldTree<string>[],
): string {
  for (const field of fieldsInPriorityOrder) {
    const ownFieldErrorMessage = field().errors()[0]?.message;
    if (ownFieldErrorMessage) {
      return ownFieldErrorMessage;
    }
  }

  return '';
}

/** Treats a field value as empty if it's unset or contains only whitespace. */
export function isBlank(value: string): boolean {
  return !value || value.trim() === '';
}
